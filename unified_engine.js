'use strict';

/**
 * AI Unified Logic Engine v1.0
 * - Centrally manages all Lotto & Pension algorithms
 * - Pure Logic focus (No DOM dependency)
 */

var _global = typeof window !== 'undefined' ? window : self;
_global.LottoAI = {
    // 1. Monte Carlo Simulation
    runMonteCarlo: function(nums, isPension, statsData) {
        var iterations = 10000;
        var hits = 0;
        if (isPension) {
            for (var i = 0; i < iterations; i++) {
                var match = 0;
                for (var m = 5; m >= 0; m--) { 
                    if (Number(nums[m]) === Math.floor(Math.random()*10)) match++; 
                    else break; 
                }
                if (match >= 1) hits++;
            }
            var rate = (hits / iterations) * 100;
            return { hits: hits, score: Math.round(50 + rate * 5), rate: rate.toFixed(2) };
        } else {
            var mySet = new Set(nums.map(n => Number(n)));
            for (var j = 0; j < iterations; j++) {
                var sim = this.generateRandomLotto();
                var matchL = sim.filter(n => mySet.has(n)).length;
                if (matchL >= 3) hits++;
            }
            var expected = 222;
            var scoreL = 50 + ((hits - expected) / 10);
            return { hits: hits, score: Math.round(Math.min(99, Math.max(1, scoreL))) };
        }
    },

    generateRandomLotto: function() {
        var pool = Array.from({length:45}, (_,i)=>i+1);
        var res = [];
        for(var i=0; i<6; i++) res.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
        return res;
    },

    // 2. Markov Chain Strategy
    generateMarkovPension: function(anchor, matrix) {
        if (!matrix) return [0,0,0,0,0,anchor];
        var combo = [0, 0, 0, 0, 0, anchor];
        for (var i = 4; i >= 0; i--) {
            var prev = combo[i + 1], row = matrix[prev];
            var total = row.reduce((a, b) => a + b, 0);
            if (total === 0) { combo[i] = Math.floor(Math.random()*10); continue; }
            var rand = Math.random() * total, sum = 0, picked = 0;
            for (var n = 0; n < 10; n++) { sum += row[n]; if (rand <= sum) { picked = n; break; } }
            combo[i] = picked;
        }
        return combo;
    },

    // 3. Combined Score Calculator
    calculateTotalScore: function(baseScore, synergyResults, indicatorStatuses) {
        var total = 100 + (baseScore - 50) / 5;
        if (synergyResults) synergyResults.forEach(s => { if(s.status === 'danger') total -= 15; });
        if (indicatorStatuses) indicatorStatuses.forEach(st => { if(st === 'danger') total -= 12; });
        return Math.max(0, Math.min(100, Math.round(total)));
    },

    // 4. Grade Determination
    getGrade: function(score) {
        if (score >= 90) return { grade: 'S', comment: '통계적 황금 밸런스 조합입니다.' };
        if (score >= 80) return { grade: 'A', comment: '확률적으로 매우 균형 잡힌 조합입니다.' };
        if (score >= 70) return { grade: 'B', comment: '무난하나 일부 지표가 범위를 벗어납니다.' };
        return { grade: 'C', comment: '통계적으로 당첨 빈도가 낮은 희귀 패턴입니다.' };
    },

    // 5. Complex Number Pooling
    getComplexPools: function(allDraws, currentIndex) {
        var history = allDraws.slice(currentIndex + 1);
        if (history.length < 10) return { hot: [], neutral: [], cold: [] };
        var scores = [];
        for (var i = 1; i <= 45; i++) {
            var score = 0;
            var freq10 = history.slice(0, 10).filter(d => d.nums.indexOf(i) !== -1).length;
            score += freq10 * 15;
            var gap = history.findIndex(d => d.nums.indexOf(i) !== -1);
            var recent5 = history.slice(0, 5).filter(d => d.nums.indexOf(i) !== -1).length;
            if (recent5 >= 4) score -= 80;
            else if (gap <= 4) score += 40;
            scores.push({ num: i, score: score });
        }
        scores.sort((a, b) => b.score - a.score);
        return {
            hot: scores.slice(0, 30).map(s => s.num).sort((a,b)=>a-b),
            neutral: scores.slice(30, 35).map(s => s.num).sort((a,b)=>a-b),
            cold: scores.slice(35, 45).map(s => s.num).sort((a,b)=>a-b)
        };
    },

    // 6. Number Compatibility Matrix
    calculateSynergyMatrix: function(draws, limit) {
        var matrix = {};
        var targetDraws = (draws || []).slice(0, limit || 200);
        targetDraws.forEach(d => {
            var nums = d.nums;
            for (var i = 0; i < nums.length; i++) {
                for (var j = i + 1; j < nums.length; j++) {
                    var n1 = nums[i], n2 = nums[j];
                    if (!matrix[n1]) matrix[n1] = {}; if (!matrix[n2]) matrix[n2] = {};
                    matrix[n1][n2] = (matrix[n1][n2] || 0) + 1; matrix[n2][n1] = (matrix[n2][n1] || 0) + 1;
                }
            }
        });
        return matrix;
    },

    getCompatibilityScore: function(nums, matrix) {
        if (!matrix) return 0;
        var score = 0;
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) {
                if (matrix[nums[i]] && matrix[nums[i]][nums[j]]) score += matrix[nums[i]][nums[j]];
            }
        }
        return score;
    },

    // 7. Pension Specifics
    calculateFlowScore: function(nums) {
        var score = 0;
        for (var i = 0; i < 5; i++) {
            var diff = Math.abs(nums[i] - nums[i+1]);
            if (diff === 1) score += 10; if (diff === 0) score -= 5;
        }
        return score;
    },

    calculatePensionSynergy: function(nums, matrix) {
        var synergyScore = 0;
        if (matrix) {
            for(var j=5; j>0; j--) synergyScore += (matrix[nums[j]] ? (matrix[nums[j]][nums[j-1]] || 0) : 0);
        }
        return Math.round(synergyScore + this.calculateFlowScore(nums));
    },

    // 8. Adaptive Weighting System
    getTrendWeight: function(k1, k2, statsData) {
        var draws = (statsData.recent_draws || []).slice(0, 3);
        if (draws.length === 0) return 1.0;
        var r = statsData.correlation_matrix[k1][k2], hit = 0, summary = statsData.stats_summary;
        draws.forEach(d => {
            var z1 = (d[k1] - summary[k1].mean) / summary[k1].std;
            var z2 = (d[k2] - summary[k2].mean) / summary[k2].std;
            if ((r > 0 && z1 * z2 > 0) || (r < 0 && z1 * z2 < 0)) hit++;
        });
        return (hit / draws.length) >= 0.9 ? 1.5 : 1.0;
    },

    // 9. Hyper-Markov Chain Score
    calculateMarkovScore: function(nums, prevNums, statsData) {
        if (!statsData || !prevNums) return 0;
        var mEnd = statsData.markov_ending_matrix, score = 0;
        if (mEnd) {
            var cEnds = nums.map(n => n % 10), pEnds = prevNums.map(n => n % 10);
            cEnds.forEach(c => { pEnds.forEach(p => score += (mEnd[p][c] || 0)); });
        }
        return Math.round(score / 5);
    },

    // 10. [v32.0] Deep Synergy Engine (34 Indicators, 47 Pairs)
    checkCorrelationHarmony: function(nums, statsData) {
        if (!statsData || !statsData.correlation_matrix || !statsData.stats_summary) return { score: 0, violations: [] };
        var matrix = statsData.correlation_matrix, summary = statsData.stats_summary, indicators = LottoConfig.INDICATORS;
        var zScores = {}, keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "period_1", "period_2", "period_3", "neighbor", "consecutive", "prime", "composite", "multiple_3", "multiple_4", "square", "double_num", "mirror", "bucket_15", "bucket_9", "bucket_7", "bucket_5", "p9", "empty_zone", "color", "pattern_corner", "pattern_center", "same_end", "recent_5_recurrence", "hot_10_count", "cold_20_count", "avg_recurrence_interval", "max_gap"];
        
        keys.forEach(key => {
            var cfg = indicators.find(c => (c.distKey === key || c.statKey === key || c.id === key.replace(/_/g,'-').replace('avg-recurrence-interval', 'avg-recurrence')));
            if (cfg) {
                var context = { last_3_draws: (statsData.recent_draws || []).slice(0,3).map(d => d.nums), recent_draws: statsData.recent_draws };
                var val = cfg.calc(nums, context), s = summary[key];
                if (s && s.std !== 0) zScores[key] = (val - s.mean) / s.std;
            }
        });

        var score = 0, violations = [], pairs = [['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'], ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'], ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'], ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count'], ['bucket_9', 'bucket_5'], ['pattern_center', 'pattern_corner'], ['same_end', 'end_sum'], ['square', 'prime'], ['double_num', 'mirror'], ['ac', 'mean_gap'], ['multiple_3', 'multiple_4'], ['color', 'bucket_15'], ['span', 'consecutive'], ['bucket_9', 'low_count'], ['end_sum', 'multiple_3'], ['period_1', 'neighbor'], ['period_1', 'sum'], ['neighbor', 'ac'], ['bucket_7', 'empty_zone'], ['p9', 'color'], ['composite', 'low_count'], ['period_2', 'period_3'], ['multiple_3', 'prime'], ['square', 'pattern_center'], ['double_num', 'same_end'], ['bucket_15', 'bucket_7'], ['mean_gap', 'color'], ['span', 'p9'], ['period_1', 'consecutive'], ['recent_5_recurrence', 'hot_10_count'], ['recent_5_recurrence', 'period_1'], ['hot_10_count', 'period_3'], ['cold_20_count', 'recent_5_recurrence'], ['cold_20_count', 'empty_zone'], ['max_gap', 'span'], ['max_gap', 'empty_zone']];

        pairs.forEach(pair => {
            var k1 = pair[0], k2 = pair[1];
            if (zScores[k1] !== undefined && zScores[k2] !== undefined) {
                var r = matrix[k1][k2];
                if (Math.abs(r) >= 0.12) {
                    var currentRel = zScores[k1] * zScores[k2], isHarmony = (r > 0 && currentRel > 0) || (r < 0 && currentRel < 0);
                    var weight = this.getTrendWeight(k1, k2, statsData);
                    if (!isHarmony && Math.abs(currentRel) > 1.8) { score -= 20 * weight; violations.push(`${k1}↔${k2} 모순`); }
                    else if (isHarmony && Math.abs(currentRel) > 0.8) { score += 3 * weight; }
                }
            }
        });
        return { score: Math.max(-100, Math.min(80, score)), violations: violations };
    },

    // 11. Win Probability Index
    calculateWinProbability: function(nums, isPension, statsData) {
        if (!statsData) return { multiplier: 1.0, confidence: 50 };
        if (isPension) {
            var sim = this.runMonteCarlo(nums, true, statsData);
            var mult = (1.0 + (sim.score - 50) / 150) * (1.0 + this.calculateFlowScore(nums) / 100);
            return { multiplier: Math.max(0.1, Math.min(3.0, mult)).toFixed(2), confidence: 85, grade: mult >= 1.8 ? 'TOP' : 'HIGH' };
        } else {
            var harmony = this.checkCorrelationHarmony(nums, statsData), hEdge = 1.0 + (harmony.score / 100), eBoost = 1.0, sPenalty = 1.0;
            var recentDraws = statsData.recent_draws || [];
            if (recentDraws.length >= 2) {
                var s2 = setIntersection(new Set(recentDraws[0].nums), new Set(recentDraws[1].nums));
                nums.forEach(n => { if (s2.has(n)) sPenalty *= 0.5; });
            }
            if (statsData.regression_signals) {
                var hiE = 0, mtch = 0, ctx = { last_3_draws: recentDraws.slice(0,3).map(d => d.nums), recent_draws: recentDraws };
                for (var label in statsData.regression_signals) {
                    var sig = statsData.regression_signals[label];
                    if (sig.energy >= 80) {
                        hiE++; var cfg = LottoConfig.INDICATORS.find(c => c.label === label || c.id === label.toLowerCase().replace(/ /g,'_'));
                        if (cfg) { var v = cfg.calc(nums, ctx), s = statsData.stats_summary[cfg.statKey || cfg.distKey]; if (s && Math.abs(v - s.mean) <= s.std) mtch++; }
                    }
                }
                if (hiE > 0) eBoost = 1.0 + (mtch / hiE) * 0.5;
            }
            var sim = this.runMonteCarlo(nums, false, statsData), sEdge = 1.0 + (sim.score - 50) / 200;
            var mult = hEdge * eBoost * sEdge * sPenalty;
            return { multiplier: Math.max(0.1, Math.min(3.5, mult)).toFixed(2), confidence: Math.min(99, 75 + (harmony.score > 0 ? 10 : -15) + (eBoost > 1.2 ? 10 : 0) - (sPenalty < 1.0 ? 30 : 0)), grade: mult >= 2.0 ? 'TOP' : (mult >= 1.3 ? 'HIGH' : 'NORMAL') };
        }
    }
};

function setIntersection(setA, setB) {
    var intersection = new Set();
    for (var elem of setB) { if (setA.has(elem)) { intersection.add(elem); } }
    return intersection;
}
