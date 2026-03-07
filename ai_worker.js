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

    // 10개를 채울 때까지 전략을 순환하며 생성
    while (results.length < targetCount && totalAttempts < 5000) {
        totalAttempts++;
        var strategy = strategies[results.length % strategies.length];
        
        var found = false, attempts = 0;
        while (!found && attempts < 500) {
            attempts++;
            var pick = [];
            var pool = pools.hot.concat(pools.neutral);
            
            if (strategy.id === 'hot') pool = pools.hot.slice(0, 15);
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

            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            var isPass = (harmony.violations.length === 0 && harmony.score >= 0);
            
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
