'use strict';

/**
 * AI Computation Worker v1.1
 * - Handles heavy calculations off the main thread
 * - Ensures exactly 10 combinations are generated
 */

importScripts('lotto_utils.js', 'indicators.js', 'unified_engine.js');

var LottoAI = self.LottoAI;
var LottoUtils = self.LottoUtils;
var LottoConfig = self.LottoConfig;

self.onmessage = function(e) {
    var task = e.data;
    var result = null;

    try {
        switch(task.type) {
            case 'CALC_PROBABILITY':
                result = LottoAI.calculateWinProbability(task.nums, task.isPension, task.statsData);
                break;
            case 'CHECK_HARMONY':
                result = LottoAI.checkCorrelationHarmony(task.nums, task.statsData);
                break;
            case 'GENERATE_COMBINATIONS':
                result = generateCombinationsInWorker(task.pools, task.strategies, task.statsData, task.synergyMatrix, task.endingChainMatrix);
                break;
        }
        self.postMessage({ type: task.type, result: result, id: task.id });
    } catch(err) {
        self.postMessage({ type: 'ERROR', error: err.toString(), id: task.id });
    }
};

function generateCombinationsInWorker(pools, strategies, statsData, synergyMatrix, endingChainMatrix) {
    var results = [];
    var lastDraw = statsData.recent_draws[0];
    var stats = statsData.stats_summary;
    var targetCount = 10;
    var totalAttempts = 0;

    // 가중치 기반 무작위 선택 함수
    function weightedRandomPick(pool, weights) {
        var totalWeight = weights.reduce((a, b) => a + b, 0);
        var r = Math.random() * totalWeight;
        var sum = 0;
        for (var i = 0; i < pool.length; i++) {
            sum += weights[i];
            if (r <= sum) return pool[i];
        }
        return pool[0];
    }

    while (results.length < targetCount && totalAttempts < 5000) {
        totalAttempts++;
        var strategy = strategies[results.length % strategies.length];
        
        var found = false, attempts = 0;
        // 특정 전략(hot, extreme)은 통계적으로 쏠림이 있으므로 임계치를 더 넓게 적용 (v29.5)
        var outlierLimit = (strategy.id === 'hot' || strategy.id === 'extreme') ? 2.5 : 1.8;

        while (!found && attempts < 500) {
            attempts++;
            var pick = [];
            var pool = pools.hot.concat(pools.neutral);
            
            // v29.5: 풀 크기 복원 (15 -> 30)
            if (strategy.id === 'hot') pool = pools.hot; 
            else if (strategy.id === 'defensive') pool = pools.neutral.concat(pools.cold);
            else if (strategy.id === 'extreme') pool = pools.cold.concat(pools.neutral.slice(0, 2));
            else if (strategy.id === 'neighbor') {
                var neighbors = [];
                lastDraw.nums.forEach(n => { if (n > 1) neighbors.push(n-1); if (n < 45) neighbors.push(n+1); });
                pool = neighbors.concat(pools.hot.slice(0, 10));
            }

            var localPool = [...new Set(pool)];
            
            // [v34.0] AI 기댓값 가중 추출
            while (pick.length < 6 && localPool.length > 0) {
                var weights = localPool.map(n => {
                    var w = 1.0; // 기본 가중치
                    // 1. Hot 여부 가중치
                    if (pools.hot.includes(n)) w += 0.5;
                    // 2. 현재 선택된 번호들과의 시너지 가중치
                    if (pick.length > 0) {
                        var synSum = pick.reduce((sum, p) => sum + (synergyMatrix[p]?.[n] || 0), 0);
                        w += (synSum / 50); // 시너지 점수에 비례한 가중치 상승
                    }
                    // 3. 고에너지 지표 해당 여부 (v33.0 연동)
                    if (statsData.regression_signals) {
                        for (var label in statsData.regression_signals) {
                            if (statsData.regression_signals[label].energy >= 80) {
                                var cfg = LottoConfig.INDICATORS.find(c => c.label === label);
                                if (cfg && cfg.calc([n], null) > 0) w += 0.3; // 해당 지표 성격 보유 시 가산
                            }
                        }
                    }
                    return Math.max(0.1, w);
                });

                var n = weightedRandomPick(localPool, weights);
                var idx = localPool.indexOf(n);
                if (idx !== -1) {
                    localPool.splice(idx, 1);
                    pick.push(n);
                }
            }
            if (pick.length < 6) continue;
            pick.sort((a,b)=>a-b);

            // [Adaptive Filtering] 상관관계 체크
... (rest of the code) ...
            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            
            // v29.5: 특정 전략은 outlierLimit를 유연하게 적용 (Harmony 내부 로직을 모방하거나 점수 기준 완화)
            var isPass = (harmony.violations.length === 0 || harmony.score >= -10);
            
            if (isPass) {
                // v30.0: 지표별 필터 전수 검증
                LottoConfig.INDICATORS.forEach(cfg => {
                    if (cfg.filter && isPass) {
                        var context = { 
                            last_3_draws: statsData.last_3_draws,
                            recent_draws: statsData.recent_draws
                        };
                        var val = cfg.calc(pick, context);
                        if (cfg.filter.min !== undefined && val < cfg.filter.min) isPass = false;
                        if (cfg.filter.max !== undefined && val > cfg.filter.max) isPass = false;
                    }
                });
            }

            // [v33.0] 회귀 에너지 연동 필터 (Dynamic Regression Filtering)
            // 에너지가 90% 이상인 지표는 무조건 세이프존에 들어와야 함
            if (isPass && statsData.regression_signals) {
                var context = { last_3_draws: statsData.last_3_draws, recent_draws: statsData.recent_draws };
                for (var label in statsData.regression_signals) {
                    var sig = statsData.regression_signals[label];
                    if (sig.energy >= 90) {
                        var cfg = LottoConfig.INDICATORS.find(c => c.label === label || c.distKey === label.toLowerCase().replace(/ /g,'_'));
                        if (cfg) {
                            var val = cfg.calc(pick, context);
                            var s = statsData.stats_summary[cfg.statKey || cfg.distKey];
                            if (s && Math.abs(val - s.mean) > s.std) { // 1시그마 이탈 시 탈락
                                isPass = false;
                                break;
                            }
                        }
                    }
                }
            }

            if (strategy.id === 'extreme') isPass = true;

            var isDuplicate = results.some(r => JSON.stringify(r.nums) === JSON.stringify(pick));
            if (isPass && !isDuplicate) {
                var compScore = LottoAI.getCompatibilityScore(pick, synergyMatrix);
                var endScore = LottoAI.calculateMarkovScore(pick, lastDraw.nums, statsData);
                var prob = LottoAI.calculateWinProbability(pick, false, statsData);
                
                // [v35.0] 앙상블 분석: 이 조합이 다른 전략들의 기준도 충족하는지 체크
                var ensembleCount = 1;
                strategies.forEach(other => {
                    if (other.id === strategy.id) return;
                    var testPass = true;
                    // 간략화된 전략별 필터 재검증
                    if (other.id === 'hot' && !pick.every(n => pools.hot.includes(n))) testPass = false;
                    if (other.id === 'balanced') {
                        var oc = pick.filter(n => n % 2 !== 0).length;
                        if (oc < 2 || oc > 4) testPass = false;
                    }
                    if (testPass) ensembleCount++;
                });

                results.push({ 
                    nums: pick, 
                    strategy: strategy, 
                    synergyScore: Math.round((compScore + endScore) / 2), 
                    prob: prob,
                    ensembleCount: ensembleCount // 앙상블 점수 주입
                });
                found = true;
            }
        }
    }
    return results;
}
