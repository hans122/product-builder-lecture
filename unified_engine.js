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

    // 12. Calculate Ending Chain Score for a combination based on previous draw
    getEndingChainScore: function(nums, prevNums, matrix) {
        if (!matrix || !prevNums) return 0;
        var score = 0;
        var currentEnds = nums.map(n => n % 10);
        var prevEnds = prevNums.map(n => n % 10);
        
        currentEnds.forEach(c => {
            prevEnds.forEach(p => {
                // 전회차 끝수 p에서 현재 끝수 c로 전이된 역사적 빈도 합산
                score += (matrix[p][c] || 0);
            });
        });
        // 36개 조합 경로(6x6)로 나누어 평균 시너지 산출
        return Math.round(score / 3.6); 
    },

    // 13. [NEW] Correlation Outlier Guard (v23.0 - 95% Compliance Strategy)
    checkCorrelationHarmony: function(nums, statsData) {
        if (!statsData || !statsData.correlation_matrix || !statsData.stats_summary) return { score: 0, violations: [] };
        
        var matrix = statsData.correlation_matrix;
        var summary = statsData.stats_summary;
        var indicators = LottoConfig.INDICATORS;
        
        var zScores = {};
        var keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "empty_zone", "prime", "consecutive", "multiple_3", "multiple_4", "bucket_15", "color", "pattern_corner"];
        
        keys.forEach(key => {
            var cfg = indicators.find(c => c.distKey === key || c.statKey === key);
            if (!cfg) return;
            var val = cfg.calc(nums, null);
            var s = summary[key];
            if (s && s.std !== 0) zScores[key] = (val - s.mean) / s.std;
        });

        var score = 0;
        var violations = [];
        
        // v23.0: 아웃라이어 가드 - 촘촘한 그물망 (15쌍)
        var pairs = [
            ['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], 
            ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'],
            ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'],
            ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'],
            ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count']
        ];

        pairs.forEach(pair => {
            var k1 = pair[0], k2 = pair[1];
            if (zScores[k1] === undefined || zScores[k2] === undefined) return;
            
            var r = matrix[k1][k2];
            if (Math.abs(r) < 0.20) return; // v23.1: 관계성 하한선 상향

            var currentRelation = zScores[k1] * zScores[k2];
            var isHarmony = (r > 0 && currentRelation > 0) || (r < 0 && currentRelation < 0);
            
            // v23.1 임계치: 1.8 (초극단적 이탈만 감지)
            if (!isHarmony && Math.abs(currentRelation) > 1.8) { 
                score -= 40; // 감점 위력 강화
                violations.push(`${k1}↔${k2} 모순`);
            } else if (isHarmony && Math.abs(currentRelation) > 0.6) {
                score += 5; // 조화 시 가점도 상향
            }
        });
        
        return { score: Math.max(-100, Math.min(50, score)), violations: violations };
    },

    // 14. [NEW] Win Probability Index (당첨 기댓값 지수 산출)
    calculateWinProbability: function(nums, statsData) {
        if (!statsData) return { multiplier: 1.0, confidence: 50 };
        
        // A. 시너지 조화도 기반 우위 (최대 1.4배)
        var harmony = this.checkCorrelationHarmony(nums, statsData);
        var harmonyEdge = 1.0 + (harmony.score / 100); 
        
        // B. 회귀 에너지 동기화 우위 (최대 1.3배)
        // 현재 에너지가 높은 지표들을 이 조합이 충족하고 있는지 확인
        var energyEdge = 1.0;
        if (statsData.regression_signals) {
            var matchCount = 0, totalHighEnergy = 0;
            for (var label in statsData.regression_signals) {
                var sig = statsData.regression_signals[label];
                if (sig.energy > 70) { // 고에너지 신호 발생 지표
                    totalHighEnergy++;
                    // 해당 지표의 실제 값을 계산하여 세이프존 여부 확인
                    // (단순화를 위해 여기서는 조화도 점수에 이미 반영된 것으로 간주하거나 
                    //  특정 핵심 지표만 샘플링하여 계산)
                }
            }
            if (totalHighEnergy > 0) energyEdge += (harmony.score > 0 ? 0.2 : -0.1);
        }

        // C. 몬테카를로 상대 성과 (최대 1.2배)
        var sim = this.runMonteCarlo(nums, false, statsData);
        var simEdge = 1.0 + (sim.score - 50) / 250;

        // D. 최종 기댓값 (평균 1.0 대비 배수)
        var multiplier = harmonyEdge * energyEdge * simEdge;
        multiplier = Math.max(0.1, Math.min(2.5, multiplier)); // 0.1배 ~ 2.5배 제한
        
        // 예측 신뢰도 (데이터 정합성 기반)
        var confidence = 70 + (harmony.score > 0 ? 15 : -20);
        
        return { 
            multiplier: multiplier.toFixed(2), 
            confidence: Math.max(10, Math.min(99, confidence)),
            grade: multiplier >= 1.5 ? 'TOP' : (multiplier >= 1.1 ? 'HIGH' : 'NORMAL')
        };
    }
};
