'use strict';

/**
 * AI Computation Worker v1.3 (High-Performance Optimized)
 * - Fixed Chrome Error Code 5 (Process Killed)
 * - Pre-calculated weights for 10x faster generation
 * - Optimized filtering pipeline
 */

importScripts('lotto_utils.js', 'indicators.js', 'unified_engine.js');

var LottoAI = self.LottoAI;
var LottoUtils = self.LottoUtils;
var LottoConfig = self.LottoConfig;

self.onmessage = function(e) {
    var task = e.data;
    try {
        if (task.type === 'GENERATE_COMBINATIONS') {
            var result = generateCombinationsInWorker(task.pools, task.strategies, task.statsData, task.synergyMatrix, task.endingChainMatrix);
            self.postMessage({ type: task.type, result: result, id: task.id });
        } else if (task.type === 'CALC_PROBABILITY') {
            var res = LottoAI.calculateWinProbability(task.nums, task.isPension, task.statsData);
            self.postMessage({ type: task.type, result: res, id: task.id });
        }
    } catch(err) {
        self.postMessage({ type: 'ERROR', error: err.toString(), id: task.id });
    }
};

function generateCombinationsInWorker(pools, strategies, statsData, synergyMatrix, endingChainMatrix) {
    var results = [];
    var lastDraw = statsData.recent_draws[0];
    var targetCount = 10;
    var totalAttempts = 0;

    // [Optimization] 가중치 사전 계산 (매번 루프에서 돌리지 않음)
    var baseWeights = new Array(46).fill(1.0);
    if (statsData.regression_signals) {
        for (var label in statsData.regression_signals) {
            if (statsData.regression_signals[label].energy >= 80) {
                var cfg = LottoConfig.INDICATORS.find(function(c) { return c.label === label; });
                if (cfg) {
                    for (var n = 1; n <= 45; n++) {
                        if (cfg.calc([n], null) > 0) baseWeights[n] += 0.3;
                    }
                }
            }
        }
    }
    pools.hot.forEach(function(n) { baseWeights[n] += 0.5; });

    while (results.length < targetCount && totalAttempts < 3000) { // 임계치 하향 조정
        totalAttempts++;
        var strategy = strategies[results.length % strategies.length];
        
        var found = false, attempts = 0;
        while (!found && attempts < 300) {
            attempts++;
            var pick = [];
            var pool = pools.hot.concat(pools.neutral);
            
            if (strategy.id === 'hot') pool = pools.hot;
            else if (strategy.id === 'defensive') pool = pools.neutral.concat(pools.cold);
            else if (strategy.id === 'extreme') pool = pools.cold;
            else if (strategy.id === 'neighbor') {
                var neighbors = [];
                lastDraw.nums.forEach(function(n) { if (n > 1) neighbors.push(n-1); if (n < 45) neighbors.push(n+1); });
                pool = neighbors.concat(pools.hot.slice(0, 5));
            }

            var localPool = Array.from(new Set(pool));
            
            // [v34.0 Optimized] 경량화된 가중치 추출
            while (pick.length < 6 && localPool.length > 0) {
                var totalW = 0;
                var currentWeights = localPool.map(function(n) {
                    var w = baseWeights[n];
                    if (pick.length > 0) {
                        // 시너지 계산 최소화
                        var s = synergyMatrix[pick[pick.length-1]];
                        if (s && s[n]) w += (s[n] / 100);
                    }
                    totalW += w;
                    return w;
                });

                var r = Math.random() * totalW;
                var sum = 0, selected = localPool[0];
                for (var i = 0; i < localPool.length; i++) {
                    sum += currentWeights[i];
                    if (r <= sum) { selected = localPool[i]; break; }
                }
                pick.push(selected);
                localPool.splice(localPool.indexOf(selected), 1);
            }
            if (pick.length < 6) continue;
            pick.sort(function(a,b) { return a - b; });

            // [Fast Path Filtering] 가벼운 필터부터 먼저 적용
            var sum = pick.reduce(function(a,b){return a+b;}, 0);
            if (sum < 100 || sum > 175) continue; 

            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            if (harmony.violations.length > 0 || harmony.score < -10) continue;

            // [Strict Guard]
            var isPass = true;
            var context = { last_3_draws: statsData.last_3_draws, recent_draws: statsData.recent_draws };
            for (var i = 0; i < LottoConfig.INDICATORS.length; i++) {
                var cfg = LottoConfig.INDICATORS[i];
                if (cfg.filter) {
                    var val = cfg.calc(pick, context);
                    if ((cfg.filter.min !== undefined && val < cfg.filter.min) || (cfg.filter.max !== undefined && val > cfg.filter.max)) {
                        isPass = false; break;
                    }
                }
            }

            if (strategy.id === 'extreme') isPass = true;

            if (isPass && !results.some(function(r){return JSON.stringify(r.nums)===JSON.stringify(pick);})) {
                var prob = LottoAI.calculateWinProbability(pick, false, statsData);
                
                // [v35.1] 앙상블 판정 로직 복원 및 최적화
                var ensembleCount = 1;
                strategies.forEach(function(st) {
                    if (st.id === strategy.id) return;
                    var testPass = true;
                    // 전략별 약식 필터링 (성능 고려)
                    if (st.id === 'hot' && pick.filter(function(n){return pools.hot.indexOf(n)!==-1;}).length < 4) testPass = false;
                    if (st.id === 'balanced' && (sum < 120 || sum > 160)) testPass = false;
                    if (st.id === 'trend' && prob.multiplier < 1.1) testPass = false;
                    if (st.id === 'regression' && prob.confidence < 80) testPass = false;
                    if (testPass) ensembleCount++;
                });

                results.push({ 
                    nums: pick, strategy: strategy, 
                    synergyScore: Math.round((LottoAI.getCompatibilityScore(pick, synergyMatrix) + LottoAI.calculateMarkovScore(pick, lastDraw.nums, statsData)) / 2), 
                    prob: prob, ensembleCount: ensembleCount 
                });
                found = true;
            }
        }
    }
    return results;
}
