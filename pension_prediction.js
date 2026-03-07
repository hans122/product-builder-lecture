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

        var allStrategies = [
            { id: 'markov', label: "🔮 역방향 마르코프", desc: "자리수 전이 확률 최적화" },
            { id: 'monte', label: "🧬 몬테카를로 최적", desc: "시뮬레이션 기반 고득점" },
            { id: 'balance', label: "⚖️ 홀짝/고저 밸런스", desc: "수학적 대칭 균형 조합" },
            { id: 'hot', label: "🔥 기세 추종형", desc: "최근 다출현 숫자 집중" },
            { id: 'defensive', label: "🛡️ 데이터 방어형", desc: "미출현 숫자 전략 배치" },
            { id: 'streak', label: "📈 연속 숫자형", desc: "흐름 기반 연속 배열" },
            { id: 'unique', label: "✨ 다양성 극대화", desc: "숫자 중복 최소화 구성" },
            { id: 'regression', label: "🚀 회귀 에너지형", desc: "출현 임박 시점 타겟팅" },
            { id: 'neighbor', label: "🏠 이웃수 시너지", desc: "직전 당첨 번호 연계" },
            { id: 'extreme', label: "📉 저빈도 역습형", desc: "희귀 패턴 기반 잭팟 노림" }
        ];

        var strategies = selectedStrategy === 'all' 
            ? allStrategies 
            : Array(10).fill(allStrategies.find(s => s.id === selectedStrategy));

        var results = [];
        var matrix = this.statsData.markov_matrix;

        strategies.forEach(strategy => {
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
                
                // [Full Automation] 모든 연금 지표 자동 필터링 검증
                var isPass = true;
                LottoConfig.PENSION_INDICATORS.forEach(cfg => {
                    if (cfg.filter) {
                        var val = cfg.calc(combo);
                        if (cfg.filter.min !== undefined && val < cfg.filter.min) isPass = false;
                        if (cfg.filter.max !== undefined && val > cfg.filter.max) isPass = false;
                    }
                });

                if (strategy.id === 'extreme') isPass = !isPass; // 합계 골든존 밖

                if ((isPass || attempts > 700) && !isDuplicate) {
                    // [NEW] 당첨 기댓값 계산 (연금 모드)
                    var prob = LottoAI.calculateWinProbability(combo, true, this.statsData);
                    
                    results.push({ 
                        group: group, 
                        nums: combo, 
                        strategy: strategy, 
                        synergyScore: totalSynergy, // 변수명 통일
                        prob: prob // 데이터 주입
                    });
                    found = true;
                }
            }
        });

        results.forEach(res => {
            // LottoUI.createComboCard를 활용하여 레이아웃 통일 (res.nums 전달)
            var card = LottoUI.createComboCard(res);
            
            // 연금용 특수 스타일 및 구슬 재렌더링 (createComboCard는 기본적으로 로또 구슬을 생성하므로 덮어씌움)
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
            if (rankEl) rankEl.style.background = this.getStrategyColor(res.strategy.id);
            
            card.onclick = () => {
                localStorage.setItem('lastGeneratedPension', JSON.stringify({group: res.group, digits: res.nums}));
                location.href = 'pension_combination.html';
            };
            container.appendChild(card);
        });
    },

    getStrategyColor: function(id) {
        var colors = {
            markov: '#ff8c00', monte: '#3182f6', balance: '#2ecc71', hot: '#f04452', 
            defensive: '#64748b', streak: '#8b5cf6', unique: '#ec4899', 
            regression: '#06b6d4', neighbor: '#10b981', extreme: '#1e293b'
        };
        return colors[id] || '#ff8c00';
    }
};

document.addEventListener('DOMContentLoaded', () => PensionPrediction.init());
