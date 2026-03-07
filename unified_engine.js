'use strict';

/**
 * AI Unified Logic Engine v1.0
 * - Centrally manages all Lotto & Pension algorithms
 * - Pure Logic focus (No DOM dependency)
 */

var LottoAI = {
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
            // 222 hits is roughly the expected value for 3+ matches in 10k trials
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

    // 2. Markov Chain Strategy (GP9)
    generateMarkovPension: function(anchor, matrix) {
        if (!matrix) return [0,0,0,0,0,anchor];
        var combo = [0, 0, 0, 0, 0, anchor];
        for (var i = 4; i >= 0; i--) {
            var prev = combo[i + 1];
            var row = matrix[prev];
            var total = row.reduce((a, b) => a + b, 0);
            if (total === 0) { combo[i] = Math.floor(Math.random()*10); continue; }
            
            var rand = Math.random() * total, sum = 0, picked = 0;
            for (var n = 0; n < 10; n++) {
                sum += row[n];
                if (rand <= sum) { picked = n; break; }
            }
            combo[i] = picked;
        }
        return combo;
    },

    // 3. Combined Score Calculator
    calculateTotalScore: function(baseScore, synergyResults, indicatorStatuses) {
        var total = 100 + (baseScore - 50) / 5;
        
        // synergy penalty
        if (synergyResults) {
            synergyResults.forEach(s => { if(s.status === 'danger') total -= 15; });
        }
        
        // individual indicator penalty
        if (indicatorStatuses) {
            indicatorStatuses.forEach(st => { if(st === 'danger') total -= 12; });
        }
        
        return Math.max(0, Math.min(100, Math.round(total)));
    },

    // 4. Grade Determination
    getGrade: function(score) {
        if (score >= 90) return { grade: 'S', comment: '통계적 황금 밸런스 조합입니다.' };
        if (score >= 80) return { grade: 'A', comment: '확률적으로 매우 균형 잡힌 조합입니다.' };
        if (score >= 70) return { grade: 'B', comment: '무난하나 일부 지표가 범위를 벗어납니다.' };
        return { grade: 'C', comment: '통계적으로 당첨 빈도가 낮은 희귀 패턴입니다.' };
    },

    // 5. Complex Number Pooling (Analysis & Prediction Hub)
    getComplexPools: function(allDraws, currentIndex) {
        var history = allDraws.slice(currentIndex + 1);
        if (history.length < 10) return { hot: [], neutral: [], cold: [] };
        
        var lastDraw = history[0];
        var scores = [];

        for (var i = 1; i <= 45; i++) {
            var score = 0;
            var freq10 = history.slice(0, 10).filter(d => d.nums.indexOf(i) !== -1).length;
            score += freq10 * 15;

            var gap = history.findIndex(d => d.nums.indexOf(i) !== -1);
            var recent5 = history.slice(0, 5).filter(d => d.nums.indexOf(i) !== -1).length;
            var recent7 = history.slice(0, 7).filter(d => d.nums.indexOf(i) !== -1).length;
            var recent10 = history.slice(0, 10).filter(d => d.nums.indexOf(i) !== -1).length;
            
            var streak5 = history.slice(0, 5).every(d => d.nums.indexOf(i) !== -1);

            if (streak5 || recent7 >= 5 || recent10 >= 6) { score -= 150; } 
            else if (recent5 >= 4) { score -= 80; } 
            else if (recent5 === 3) { score -= 30; } 
            else {
                if (gap <= 4) score += 40;
                else if (gap >= 5 && gap <= 14) score += 25;
                else if (gap >= 30) score -= 30;
            }

            if (lastDraw.nums.indexOf(i) !== -1) score += 10;
            
            var isNeighbor = lastDraw.nums.some(n => Math.abs(n - i) === 1);
            if (isNeighbor) score += 20;

            scores.push({ num: i, score: score });
        }
        
        scores.sort((a, b) => b.score - a.score);
        return {
            hot: scores.slice(0, 30).map(s => s.num).sort((a,b)=>a-b),
            neutral: scores.slice(30, 35).map(s => s.num).sort((a,b)=>a-b),
            cold: scores.slice(35, 45).map(s => s.num).sort((a,b)=>a-b)
        };
    }
};
