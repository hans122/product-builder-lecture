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

    // 13. [NEW] Correlation Harmony Check (지표 간 상관관계 정합성 검사)
    checkCorrelationHarmony: function(nums, statsData) {
        if (!statsData || !statsData.correlation_matrix || !statsData.stats_summary) return { score: 0, violations: [] };
        
        var matrix = statsData.correlation_matrix;
        var summary = statsData.stats_summary;
        var indicators = LottoConfig.INDICATORS; // Use SSOT configs to calc values
        
        // 1. 현재 조합의 지표 값 계산 (Z-Score 변환)
        var zScores = {};
        var keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count"]; // Python 키와 일치
        
        keys.forEach(key => {
            var cfg = indicators.find(c => c.distKey === key || c.statKey === key);
            if (!cfg) return;
            var val = cfg.calc(nums, null); // Context 불필요한 기본 지표 위주
            var mean = summary[key].mean;
            var std = summary[key].std;
            zScores[key] = (val - mean) / std; // 표준화 점수
        });

        // 2. 상관관계 위배 여부 검사
        var score = 0;
        var violations = [];
        
        // 주요 상관관계 쌍 검사
        var pairs = [
            ['sum', 'low_count'], // 강한 역상관 (r=-0.88)
            ['ac', 'sum'],
            ['span', 'mean_gap']
        ];

        pairs.forEach(pair => {
            var k1 = pair[0], k2 = pair[1];
            if (zScores[k1] === undefined || zScores[k2] === undefined) return;
            
            var r = matrix[k1][k2]; // 역사적 상관계수
            var currentRelation = zScores[k1] * zScores[k2]; // 현재 조합의 방향성 (부호)
            
            // 역사적 상관관계가 강한 경우 (|r| > 0.5)
            if (Math.abs(r) > 0.5) {
                // r이 양수인데 현재 부호가 반대이거나, r이 음수인데 현재 부호가 같은 경우 (모순)
                // 예: sum과 low_count는 r=-0.88 (반대여야 함). 
                // 만약 sum이 높고(+Z) low_count도 높으면(+Z) -> 곱은 양수(+) -> 모순!
                
                // 모순 조건: r의 부호와 currentRelation의 부호가 다름 (즉, 곱이 음수)
                // 하지만 위 예시는 r(-)*curr(+) -> 음수. 
                // r과 curr가 '다른 방향'이어야 모순이다? 
                // 정확히는: Z1, Z2의 관계가 r의 경향을 따르는가?
                
                // 단순화: 
                // r < -0.5 (역상관) -> Z1과 Z2 부호가 달라야 함. 같으면 감점.
                // r > 0.5 (양의상관) -> Z1과 Z2 부호가 같아야 함. 다르면 감점.
                
                var isHarmony = (r > 0 && currentRelation > 0) || (r < 0 && currentRelation < 0);
                
                if (!isHarmony && Math.abs(currentRelation) > 0.5) { // 의미있는 수준의 이탈일 때만
                    score -= 20;
                    violations.push(`${k1} ↔ ${k2} (r=${r}) 불일치`);
                } else {
                    score += 10;
                }
            }
        });
        
        return { score: Math.max(-50, Math.min(50, score)), violations: violations };
    }
};
