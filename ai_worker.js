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
            while (pick.length < 6 && localPool.length > 0) {
                var n = localPool.splice(Math.floor(Math.random() * localPool.length), 1)[0];
                pick.push(n);
            }
            if (pick.length < 6) continue;
            pick.sort((a,b)=>a-b);

            // [Adaptive Filtering] 상관관계 체크
            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            
            // v29.5: 특정 전략은 outlierLimit를 유연하게 적용 (Harmony 내부 로직을 모방하거나 점수 기준 완화)
            var isPass = (harmony.violations.length === 0 || harmony.score >= -10);
            
            if (isPass) {
                LottoConfig.INDICATORS.forEach(cfg => {
                    if (cfg.filter && isPass) {
                        var val = cfg.calc(pick, { last_3_draws: statsData.recent_draws.slice(0,3).map(d=>d.nums) });
                        // hot 전략은 특정 지표(Z-limit) 필터를 조금 더 넓게 허용
                        var limitMultiplier = (strategy.id === 'hot') ? 1.5 : 1.0;
                        if (cfg.filter.min !== undefined && val < cfg.filter.min) isPass = false;
                        if (cfg.filter.max !== undefined && val > cfg.filter.max) isPass = false;
                    }
                });
            }

            if (strategy.id === 'extreme') isPass = true;

            var isDuplicate = results.some(r => JSON.stringify(r.nums) === JSON.stringify(pick));
            if (isPass && !isDuplicate) {
                var compScore = LottoAI.getCompatibilityScore(pick, synergyMatrix);
                var endScore = LottoAI.calculateMarkovScore(pick, lastDraw.nums, statsData);
                var prob = LottoAI.calculateWinProbability(pick, false, statsData);
                results.push({ nums: pick, strategy: strategy, synergyScore: Math.round((compScore + endScore) / 2), prob: prob });
                found = true;
            }
        }
    }
    return results;
}
