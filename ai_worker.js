'use strict';

/**
 * AI Computation Worker v1.0
 * - Handles heavy calculations off the main thread
 * - Deep Synergy, Win Probability, Combination Generation
 */

importScripts('lotto_utils.js', 'indicators.js', 'unified_engine.js');

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
                // Worker 내부에서 조합 생성 루프 실행 (가장 무거운 작업)
                result = generateCombinationsInWorker(task.pools, task.strategies, task.statsData, task.synergyMatrix, task.endingChainMatrix);
                break;
        }
        self.postMessage({ type: task.type, result: result, id: task.id });
    } catch(err) {
        self.postMessage({ type: 'ERROR', error: err.toString(), id: task.id });
    }
};

// Worker-specific generation logic (Optimized loop)
function generateCombinationsInWorker(pools, strategies, statsData, synergyMatrix, endingChainMatrix) {
    var results = [];
    var lastDraw = statsData.recent_draws[0];
    var stats = statsData.stats_summary;

    strategies.forEach(strategy => {
        var found = false, attempts = 0;
        while (!found && attempts < 2000) { // Worker니까 시도 횟수 2배 상향
            attempts++;
            var pick = [];
            var pool = pools.hot.concat(pools.neutral);
            
            // Strategy Pool Logic (Simplified mirror of prediction.js)
            if (strategy.id === 'hot') pool = pools.hot.slice(0, 15);
            if (strategy.id === 'defensive') pool = pools.neutral.concat(pools.cold);
            if (strategy.id === 'extreme') pool = pools.cold.concat(pools.neutral.slice(0, 2));
            if (strategy.id === 'neighbor') {
                var neighbors = [];
                lastDraw.nums.forEach(n => { if (n > 1) neighbors.push(n-1); if (n < 45) neighbors.push(n+1); });
                pool = neighbors.concat(pools.hot.slice(0, 10));
            }

            var localPool = [...new Set(pool)];
            
            // Random Pick
            while (pick.length < 6 && localPool.length > 0) {
                var idx = Math.floor(Math.random() * localPool.length);
                var n = localPool.splice(idx, 1)[0];
                pick.push(n);
            }
            if (pick.length < 6) { 
                var remain = Array.from({length:45},(_,i)=>i+1).filter(n=>!pick.includes(n));
                while(pick.length < 6) pick.push(remain.splice(Math.floor(Math.random()*remain.length),1)[0]);
            }
            pick.sort((a,b)=>a-b);

            // Filtering
            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            var isPass = (harmony.violations.length === 0 && harmony.score >= 0);
            
            // Indicator Filters
            if (isPass) {
                LottoConfig.INDICATORS.forEach(cfg => {
                    if (cfg.filter && isPass) {
                        var val = cfg.calc(pick, { last_3_draws: statsData.recent_draws.slice(0,3).map(d=>d.nums) });
                        if (cfg.filter.min !== undefined && val < cfg.filter.min) isPass = false;
                        if (cfg.filter.max !== undefined && val > cfg.filter.max) isPass = false;
                    }
                });
            }

            if (strategy.id === 'extreme') isPass = true;

            if (isPass) {
                var compScore = LottoAI.getCompatibilityScore(pick, synergyMatrix);
                var endScore = LottoAI.calculateMarkovScore(pick, lastDraw.nums, statsData);
                var totalSynergy = Math.round((compScore + endScore) / 2);
                var prob = LottoAI.calculateWinProbability(pick, false, statsData);
                
                results.push({ nums: pick, strategy: strategy, synergyScore: totalSynergy, prob: prob });
                found = true;
            }
        }
    });
    return results;
}
