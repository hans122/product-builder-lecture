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
    },

    // 6. Number Compatibility (Synergy) Matrix
    calculateSynergyMatrix: function(draws, limit) {
        var matrix = {};
        var targetDraws = (draws || []).slice(0, limit || 200); // 최근 200회차 중심 분석
        
        targetDraws.forEach(d => {
            var nums = d.nums;
            for (var i = 0; i < nums.length; i++) {
                for (var j = i + 1; j < nums.length; j++) {
                    var n1 = nums[i], n2 = nums[j];
                    if (!matrix[n1]) matrix[n1] = {};
                    if (!matrix[n2]) matrix[n2] = {};
                    matrix[n1][n2] = (matrix[n1][n2] || 0) + 1;
                    matrix[n2][n1] = (matrix[n2][n1] || 0) + 1;
                }
            }
        });
        return matrix;
    },

    // 7. Calculate Compatibility Score for a given combination
    getCompatibilityScore: function(nums, matrix) {
        if (!matrix) return 0;
        var score = 0;
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) {
                var n1 = nums[i], n2 = nums[j];
                if (matrix[n1] && matrix[n1][n2]) score += matrix[n1][n2];
            }
        }
        return score; 
    },

    // 8. Advanced Metrics Calculation
    calculateMeanGap: function(nums) {
        var sorted = [...nums].sort((a,b)=>a-b);
        var gaps = [];
        for (var i = 0; i < sorted.length - 1; i++) {
            gaps.push(sorted[i+1] - sorted[i]);
        }
        var sum = gaps.reduce((a, b) => a + b, 0);
        return sum / gaps.length;
    },

    // 9. Multi-Layer Scoring (Frequency + Synergy + Advanced Metrics)
    getAdvancedScore: function(nums, statsData, synergyMatrix) {
        var baseScore = 0;
        
        // A. Frequency Score (Hot/Cold)
        // (단순화를 위해 여기선 생략하고 외부에서 처리하거나 추후 통합)

        // B. Synergy Score
        if (synergyMatrix) baseScore += this.getCompatibilityScore(nums, synergyMatrix) * 0.5;

        // C. Mean Gap Score (Ideal range: 6 ~ 9)
        var gap = this.calculateMeanGap(nums);
        if (gap >= 6 && gap <= 9) baseScore += 20;
        else if (gap >= 4 && gap <= 11) baseScore += 10;
        
        // D. AC Value Score (Ideal: >= 7)
        if (typeof LottoUtils !== 'undefined') {
            var ac = LottoUtils.calculateAC(nums);
            if (ac >= 7) baseScore += 15;
        }

        return Math.round(baseScore);
    },

    // 10. Pension Advanced Metrics
    calculateFlowScore: function(nums) {
        var score = 0;
        for (var i = 0; i < 5; i++) {
            var diff = Math.abs(nums[i] - nums[i+1]);
            if (diff === 1) score += 10; // 연속
            if (diff === 0) score -= 5;  // 중복 (과도하면 감점)
            if (diff >= 2 && diff <= 4) score += 5; // 적절한 간격
        }
        return score;
    },

    /** [NEW] 연금복권 통합 시너지 점수 산출 */
    calculatePensionSynergy: function(nums, matrix) {
        var synergyScore = 0;
        if (matrix) {
            for(var j=5; j>0; j--) {
                var next = nums[j], prev = nums[j-1];
                if(matrix[next]) synergyScore += (matrix[next][prev] || 0);
            }
        }
        var flowScore = this.calculateFlowScore(nums);
        return Math.round(synergyScore + flowScore);
    },

    // 11. Lotto Ending Digit Chain Analysis
    calculateEndingChainMatrix: function(draws, limit) {
        var matrix = Array.from({length: 10}, () => Array(10).fill(0));
        var targetDraws = (draws || []).slice(0, limit || 300);
        
        for (var i = 0; i < targetDraws.length - 1; i++) {
            var currentEnds = targetDraws[i].nums.map(n => n % 10);
            var nextEnds = targetDraws[i+1].nums.map(n => n % 10);
            
            currentEnds.forEach(c => {
                nextEnds.forEach(n => {
                    matrix[c][n]++;
                });
            });
        }
        return matrix;
    },

    // 12. [UPGRADE] Hyper-Markov Chain Score (v27.0 - 3D State Transition)
    calculateMarkovScore: function(nums, prevNums, statsData) {
        if (!statsData || !prevNums) return 0;
        
        var mEnd = statsData.markov_ending_matrix;
        var mP9 = statsData.markov_p9_matrix;
        var mSec = statsData.markov_section_matrix;
        
        var score = 0;
        
        // 1. 끝수 전이 (Ending)
        if (mEnd) {
            var cEnds = nums.map(n => n % 10);
            var pEnds = prevNums.map(n => n % 10);
            cEnds.forEach(c => { pEnds.forEach(p => score += (mEnd[p][c] || 0)); });
        }
        
        // 2. 9궁도 전이 (Space)
        if (mP9) {
            var cP9 = nums.map(n => (n-1)%9);
            var pP9 = prevNums.map(n => (n-1)%9);
            cP9.forEach(c => { pP9.forEach(p => score += (mP9[p][c] || 0)); });
        }
        
        // 3. 3분할 전이 (Section Flow)
        if (mSec) {
            var getSec = ns => { var cnt=[0,0,0]; ns.forEach(n=>cnt[Math.floor((n-1)/15)]++); return cnt.indexOf(Math.max(...cnt)); };
            var cSec = getSec(nums);
            var pSec = getSec(prevNums);
            score += (mSec[pSec][cSec] || 0) * 10; // 구간 흐름 가중치
        }

        return Math.round(score / 5); // 정규화
    },

    // [NEW] Adaptive Weighting System (v27.0)
    getTrendWeight: function(k1, k2, statsData) {
        // 최근 10회차의 상관관계 적중률을 분석하여 가중치 조절
        // (성능을 위해 간소화된 버전: 최근 3회차만 체크)
        var draws = (statsData.recent_draws || []).slice(0, 3);
        if (draws.length === 0) return 1.0;
        
        var r = statsData.correlation_matrix[k1][k2];
        var hit = 0;
        var summary = statsData.stats_summary;
        
        draws.forEach(d => {
            var z1 = (d[k1] - summary[k1].mean) / summary[k1].std;
            var z2 = (d[k2] - summary[k2].mean) / summary[k2].std;
            var rel = z1 * z2;
            if ((r > 0 && rel > 0) || (r < 0 && rel < 0)) hit++;
        });
        
        var rate = hit / draws.length;
        if (rate >= 0.9) return 1.5; // 최근 트렌드와 완벽 일치 시 가중치 50% UP
        if (rate <= 0.3) return 0.7; // 트렌드 이탈 시 가중치 감소
        return 1.0;
    },

    // 13. [NEW] Deep Synergy Engine (v26.0 - 29 Indicators, 40+ Pairs)
    checkCorrelationHarmony: function(nums, statsData) {
        if (!statsData || !statsData.correlation_matrix || !statsData.stats_summary) return { score: 0, violations: [] };
        
        var matrix = statsData.correlation_matrix;
        var summary = statsData.stats_summary;
        var indicators = LottoConfig.INDICATORS;
        
        var zScores = {};
        // v26.0 전수 지표 세트 (29개)
        var keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "period_1", "period_2", "period_3", "neighbor", "consecutive", "prime", "composite", "multiple_3", "multiple_4", "square", "double_num", "mirror", "bucket_15", "bucket_9", "bucket_7", "bucket_5", "p9", "empty_zone", "color", "pattern_corner", "pattern_center", "same_end"];
        
        keys.forEach(key => {
            var cfg = indicators.find(c => (c.distKey === key || c.statKey === key || c.id === key.replace('_','-')));
            if (!cfg) return;
            // Relative indicators need context
            var context = { last_3_draws: (statsData.recent_draws || []).slice(0,3).map(d => d.nums) };
            var val = cfg.calc(nums, context);
            var s = summary[key];
            if (s && s.std !== 0) zScores[key] = (val - s.mean) / s.std;
        });

        var score = 0;
        var violations = [];
        
        // v26.0: 딥 시너지 - 촘촘한 분석망 (40쌍 이상)
        var pairs = [
            ['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], 
            ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'],
            ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'],
            ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'],
            ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count'],
            ['bucket_9', 'bucket_5'], ['pattern_center', 'pattern_corner'], ['same_end', 'end_sum'],
            ['square', 'prime'], ['double_num', 'mirror'], ['ac', 'mean_gap'],
            ['multiple_3', 'multiple_4'], ['color', 'bucket_15'], ['span', 'consecutive'],
            ['bucket_9', 'low_count'], ['end_sum', 'multiple_3'],
            ['period_1', 'neighbor'], ['period_1', 'sum'], ['neighbor', 'ac'],
            ['bucket_7', 'empty_zone'], ['p9', 'color'], ['composite', 'low_count'],
            ['period_2', 'period_3'], ['multiple_3', 'prime'], ['square', 'pattern_center'],
            ['double_num', 'same_end'], ['bucket_15', 'bucket_7'], ['mean_gap', 'color'],
            ['span', 'p9'], ['period_1', 'consecutive']
        ];

        pairs.forEach(pair => {
            var k1 = pair[0], k2 = pair[1];
            if (zScores[k1] === undefined || zScores[k2] === undefined) return;
            
            var r = matrix[k1][k2];
            if (Math.abs(r) < 0.12) return; 

            var currentRelation = zScores[k1] * zScores[k2];
            var isHarmony = (r > 0 && currentRelation > 0) || (r < 0 && currentRelation < 0);
            
            // v27.0 동적 가중치 적용
            var weight = this.getTrendWeight(k1, k2, statsData);
            
            if (!isHarmony && Math.abs(currentRelation) > 1.8) { 
                score -= 20 * weight; 
                violations.push(`${k1}↔${k2} 모순`);
            } else if (isHarmony && Math.abs(currentRelation) > 0.8) {
                score += 3 * weight; 
            }
        });
        
        return { score: Math.max(-100, Math.min(80, score)), violations: violations };
    },

    // 14. [NEW] Win Probability Index (v26.0 - Energy Sync Edition)
    calculateWinProbability: function(nums, isPension, statsData) {
        if (!statsData) return { multiplier: 1.0, confidence: 50 };
        
        if (isPension) {
            var sim = this.runMonteCarlo(nums, true, statsData);
            var simEdge = 1.0 + (sim.score - 50) / 150; 
            var balanceScore = this.calculateFlowScore(nums);
            var balanceEdge = 1.0 + (balanceScore / 100);
            var multiplier = simEdge * balanceEdge;
            return { multiplier: Math.max(0.1, Math.min(3.0, multiplier)).toFixed(2), confidence: 85, grade: multiplier >= 1.8 ? 'TOP' : 'HIGH' };
        } else {
            // [Lotto Mode - Energy Sync Analysis]
            var harmony = this.checkCorrelationHarmony(nums, statsData);
            var harmonyEdge = 1.0 + (harmony.score / 100); 
            
            // v26.0 핵심: 회귀 에너지 동기화 (Energy Sync)
            var energyBoost = 1.0;
            if (statsData.regression_signals) {
                var highEnergyCount = 0, matchedCount = 0;
                var context = { last_3_draws: (statsData.recent_draws || []).slice(0,3).map(d => d.nums) };
                
                for (var label in statsData.regression_signals) {
                    var sig = statsData.regression_signals[label];
                    if (sig.energy >= 80) { // 출현 임박 지표
                        highEnergyCount++;
                        var cfg = LottoConfig.INDICATORS.find(c => c.label === label || c.id === label.toLowerCase().replace(/ /g,'_'));
                        if (cfg) {
                            var val = cfg.calc(nums, context);
                            var stat = statsData.stats_summary[cfg.statKey || cfg.distKey];
                            if (stat && Math.abs(val - stat.mean) <= stat.std) { 
                                matchedCount++;
                            }
                        }
                    }
                }
                if (highEnergyCount > 0) {
                    energyBoost = 1.0 + (matchedCount / highEnergyCount) * 0.5;
                }
            }

            var sim = this.runMonteCarlo(nums, false, statsData);
            var simEdge = 1.0 + (sim.score - 50) / 200;

            var multiplier = harmonyEdge * energyBoost * simEdge;
            multiplier = Math.max(0.1, Math.min(3.5, multiplier)); 
            
            var confidence = 75 + (harmony.score > 0 ? 10 : -15) + (energyBoost > 1.2 ? 10 : 0);
            
            return { 
                multiplier: multiplier.toFixed(2), 
                confidence: Math.min(99, confidence),
                grade: multiplier >= 2.0 ? 'TOP' : (multiplier >= 1.3 ? 'HIGH' : 'NORMAL')
            };
        }
    }
};
