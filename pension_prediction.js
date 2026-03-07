'use strict';

/**
 * AI Pension Prediction Engine v2.0 - Synergy-AI Edition
 * - Digit-to-Digit Synergy Analysis
 * - Advanced Markov-Chain Relational Filtering
 */

var PensionPrediction = {
    statsData: null,
    synergyMatrix: null,

    init: function() {
        var self = this;
        LottoDataManager.getPensionStats(function(data) {
            if (!data) return;
            self.statsData = data;
            // 1. 연금 전용 마르코프 시너지 매트릭스 활용
            self.synergyMatrix = data.markov_matrix;
            self.renderAll();
            self.bindEvents();
        });
    },

    renderAll: function() {
        var strategy = document.getElementById('pension-strategy-select')?.value || 'all';
        this.generateSmartCombinations(strategy);
        this.runPensionBacktest(); // 백테스트 실행 추가
    },

    runPensionBacktest: function() {
        var draws = this.statsData.recent_draws;
        if (!draws || draws.length < 10) return;

        var totalHits = 0, jackpotCount = 0, excludeHits = 0;
        var limit = Math.min(15, draws.length);
        var testDraws = draws.slice(0, limit);

        testDraws.forEach((draw, idx) => {
            // 과거 시점의 데이터로 예측 시뮬레이션 (단순화를 위해 현재 빈도 활용)
            var currentNums = draw.nums;
            var hitCount = 0;
            
            // 자리수 적중 시뮬레이션
            for(var i=0; i<6; i++) {
                var bestDigit = this.statsData.pos_freq[i].indexOf(Math.max(...this.statsData.pos_freq[i]));
                if (currentNums[i] === bestDigit) hitCount++;
            }
            totalHits += hitCount;
            if (hitCount >= 4) jackpotCount++;

            // 제외 적중 시뮬레이션 (최저 빈도 숫자가 실제 당첨에 포함되지 않았는지)
            var isExcludeSuccess = true;
            for(var j=0; j<6; j++) {
                var worstDigit = this.statsData.pos_freq[j].indexOf(Math.min(...this.statsData.pos_freq[j]));
                if (currentNums[j] === worstDigit) isExcludeSuccess = false;
            }
            if (isExcludeSuccess) excludeHits++;
        });

        // 보드 노출 및 데이터 주입
        var board = document.getElementById('pension-summary-board');
        if (board) {
            board.style.display = 'block';
            document.getElementById('p-avg-hit').innerText = (totalHits / limit).toFixed(1);
            document.getElementById('p-jackpot-cnt').innerText = jackpotCount;
            document.getElementById('p-exclude-rate').innerText = Math.round((excludeHits / limit) * 100);
        }
    },

    bindEvents: function() {
        var self = this;
        var strategySelect = document.getElementById('pension-strategy-select');
        if (strategySelect) {
            strategySelect.onchange = function() { self.generateSmartCombinations(this.value); };
        }
        
        var refreshBtn = document.getElementById('refresh-pension-btn');
        if (refreshBtn) {
            refreshBtn.onclick = function() {
                var curS = document.getElementById('pension-strategy-select')?.value || 'all';
                self.generateSmartCombinations(curS);
            };
        }
    },

    generateSmartCombinations: function(selectedStrategy) {
        var container = document.getElementById('pension-combinations-container');
        if (!container || !this.statsData) return;
        container.innerHTML = '';

        var allStrategies = LottoConfig.PENSION_STRATEGIES;
        var strategies = selectedStrategy === 'all' 
            ? allStrategies 
            : Array(10).fill(allStrategies.find(s => s.id === selectedStrategy));

        var results = [];
        var matrix = this.statsData.markov_matrix;

        strategies.forEach(strategy => {
            if (!strategy) return;
            var found = false, attempts = 0;
            while (!found && attempts < 800) {
                attempts++;
                var combo = [0,0,0,0,0,0];
                var group = Math.floor(Math.random() * 5) + 1;

                // [Synergy-AI] 자리수 간 상관관계 기반 생성
                if (strategy.id === 'markov' || Math.random() > 0.5) {
                    var anchor = Math.floor(Math.random() * 10);
                    combo = LottoAI.generateMarkovPension(anchor, matrix);
                } else {
                    for(var i=0; i<6; i++) combo[i] = Math.floor(Math.random() * 10);
                }

                var analysis = PensionUtils.analyzeBalance(combo);
                
                // [Advanced Synergy] 통합 시너지 엔진 활용 (Refactored)
                var totalSynergy = LottoAI.calculatePensionSynergy(combo, matrix);

                var isDuplicate = results.some(r => JSON.stringify(r.nums) === JSON.stringify(combo));
                
                // [Strict Harmony Guard] 1. 모든 지표 자동 필터링 검증
                var isPass = true;
                LottoConfig.PENSION_INDICATORS.forEach(cfg => {
                    if (cfg.filter) {
                        var val = cfg.calc(combo);
                        if (cfg.filter.min !== undefined && val < cfg.filter.min) isPass = false;
                        if (cfg.filter.max !== undefined && val > cfg.filter.max) isPass = false;
                    }
                });

                // [Strict Harmony Guard] 2. 통합 시너지 점수 검증
                if (totalSynergy < 0) isPass = false; // 마이너스 시너지 조합 배제

                if (strategy.id === 'extreme') isPass = true; // 익스트림은 필터 예외

                if (isPass && !isDuplicate) {
                    // [NEW] 당첨 기댓값 계산 (연금 모드)
                    var prob = LottoAI.calculateWinProbability(combo, true, this.statsData);
                    
                    results.push({ 
                        group: group, 
                        nums: combo, 
                        strategy: strategy, 
                        synergyScore: totalSynergy,
                        prob: prob // 데이터 주입
                    });
                    found = true;
                }
            }
        });

        results.forEach(res => {
            // LottoUI.createComboCard를 활용하여 레이아웃 통일 (res.nums 전달)
            var card = LottoUI.createComboCard(res);
            
            // 연금용 특수 스타일 및 구슬 재렌더링
            var ballHtml = `<div class="pension-ball group small" style="background:#4e5968;">${res.group}</div>` + 
                           res.nums.map((n, idx) => `<div class="pension-ball small ${n >= 5 ? 'blue' : 'yellow'}" style="width:24px; height:24px; font-size:0.75rem;">${n}</div>`).join('');
            
            var ballContainer = card.querySelector('.ball-container');
            if (ballContainer) {
                ballContainer.innerHTML = ballHtml;
                ballContainer.style.display = 'flex';
                ballContainer.style.justifyContent = 'center';
                ballContainer.style.gap = '2px';
            }

            card.style.borderColor = '#ff8c0033';
            var rankEl = card.querySelector('.combo-rank');
            if (rankEl) {
                rankEl.style.background = this.getStrategyColor(res.strategy.id);
                rankEl.style.color = 'white';
                rankEl.style.fontWeight = '900';
            }
            
            card.onclick = () => {
                localStorage.setItem('lastGeneratedPension', JSON.stringify({group: res.group, digits: res.nums}));
                location.href = 'pension_combination.html';
            };
            container.appendChild(card);
        });
    },

    getStrategyColor: function(id) {
        var st = LottoConfig.PENSION_STRATEGIES.find(s => s.id === id);
        return st ? st.color : '#ff8c00';
    }
};

document.addEventListener('DOMContentLoaded', () => PensionPrediction.init());
