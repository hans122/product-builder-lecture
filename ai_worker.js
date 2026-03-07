'use strict';

/**
 * AI Computation Worker v1.2
 * - Fixed SyntaxError (Unexpected token '...') for better compatibility
 * - Removed Spread Operators, replaced with ES5/ES6 safe methods
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
    var targetCount = 10;
    var totalAttempts = 0;

    function weightedRandomPick(pool, weights) {
        var totalWeight = weights.reduce(function(a, b) { return a + b; }, 0);
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
        while (!found && attempts < 500) {
            attempts++;
            var pick = [];
            var pool = pools.hot.concat(pools.neutral);
            
            if (strategy.id === 'hot') pool = pools.hot; 
            else if (strategy.id === 'defensive') pool = pools.neutral.concat(pools.cold);
            else if (strategy.id === 'extreme') pool = pools.cold.concat(pools.neutral.slice(0, 2));
            else if (strategy.id === 'neighbor') {
                var neighbors = [];
                lastDraw.nums.forEach(function(n) { if (n > 1) neighbors.push(n-1); if (n < 45) neighbors.push(n+1); });
                pool = neighbors.concat(pools.hot.slice(0, 10));
            }

            // v1.2: 스프레드 연산자 제거 (호환성 확보)
            var localPoolSet = new Set(pool);
            var localPool = Array.from(localPoolSet);
            
            while (pick.length < 6 && localPool.length > 0) {
                var weights = localPool.map(function(n) {
                    var w = 1.0;
                    if (pools.hot.indexOf(n) !== -1) w += 0.5;
                    if (pick.length > 0) {
                        var synSum = pick.reduce(function(sum, p) { return sum + (synergyMatrix[p] ? (synergyMatrix[p][n] || 0) : 0); }, 0);
                        w += (synSum / 50);
                    }
                    if (statsData.regression_signals) {
                        for (var label in statsData.regression_signals) {
                            if (statsData.regression_signals[label].energy >= 80) {
                                var cfg = LottoConfig.INDICATORS.find(function(c) { return c.label === label; });
                                if (cfg && cfg.calc([n], null) > 0) w += 0.3;
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
            pick.sort(function(a,b) { return a - b; });

            var harmony = LottoAI.checkCorrelationHarmony(pick, statsData);
            var isPass = (harmony.violations.length === 0 || harmony.score >= -10);
            
            if (isPass) {
                LottoConfig.INDICATORS.forEach(function(cfg) {
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

            if (isPass && statsData.regression_signals) {
                var context = { last_3_draws: statsData.last_3_draws, recent_draws: statsData.recent_draws };
                for (var label in statsData.regression_signals) {
                    var sig = statsData.regression_signals[label];
                    if (sig.energy >= 90) {
                        var cfg = LottoConfig.INDICATORS.find(function(c) { return c.label === label || c.distKey === label.toLowerCase().replace(/ /g,'_'); });
                        if (cfg) {
                            var val = cfg.calc(pick, context);
                            var s = statsData.stats_summary[cfg.statKey || cfg.distKey];
                            if (s && Math.abs(val - s.mean) > s.std) { 
                                isPass = false;
                                break;
                            }
                        }
                    }
                }
            }

            if (strategy.id === 'extreme') isPass = true;

            var isDuplicate = results.some(function(r) { return JSON.stringify(r.nums) === JSON.stringify(pick); });
            if (isPass && !isDuplicate) {
                var compScore = LottoAI.getCompatibilityScore(pick, synergyMatrix);
                var endScore = LottoAI.calculateMarkovScore(pick, lastDraw.nums, statsData);
                var prob = LottoAI.calculateWinProbability(pick, false, statsData);
                
                var ensembleCount = 1;
                strategies.forEach(function(other) {
                    if (other.id === strategy.id) return;
                    var testPass = true;
                    if (other.id === 'hot' && !pick.every(function(n) { return pools.hot.indexOf(n) !== -1; })) testPass = false;
                    if (other.id === 'balanced') {
                        var oc = pick.filter(function(n) { return n % 2 !== 0; }).length;
                        if (oc < 2 || oc > 4) testPass = false;
                    }
                    if (testPass) ensembleCount++;
                });

                results.push({ 
                    nums: pick, 
                    strategy: strategy, 
                    synergyScore: Math.round((compScore + endScore) / 2), 
                    prob: prob,
                    ensembleCount: ensembleCount
                });
                found = true;
            }
        }
    }
    return results;
}
