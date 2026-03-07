'use strict';

/**
 * AI Prediction Engine v6.0 - Synergy-AI Edition
 * - Integrated with Co-occurrence Synergy Matrix
 * - Advanced Multi-step Filtering (Statistical + Relational)
 */

var PredictionEngine = {
    statsData: null,
    synergyMatrix: null,

    init: function() {
        var self = this;
        LottoDataManager.getStats(function(data) {
            if (!data) return;
            self.statsData = data;
            // 1. 궁합 매트릭스 실시간 계산
            self.synergyMatrix = LottoAI.calculateSynergyMatrix(data.recent_draws, 300);
            self.renderAll();
            self.bindEvents();
        });
    },

    renderAll: function() {
        var pools = LottoAI.getComplexPools(this.statsData.recent_draws || [], -1);
        this.renderPoolGrid(pools);
        var strategy = document.getElementById('lotto-strategy-select')?.value || 'all';
        this.generateSmartCombinations(pools, strategy);
        if (typeof runBacktest === 'function') runBacktest(this.statsData.recent_draws || []);
    },

    bindEvents: function() {
        var self = this;
        var strategySelect = document.getElementById('lotto-strategy-select');
        if (strategySelect) {
            strategySelect.onchange = function() {
                var pools = LottoAI.getComplexPools(self.statsData.recent_draws || [], -1);
                self.generateSmartCombinations(pools, this.value);
            };
        }
        
        var refreshBtn = document.getElementById('refresh-recommendations-btn');
        if (refreshBtn) {
            refreshBtn.onclick = function() {
                var pools = LottoAI.getComplexPools(self.statsData.recent_draws || [], -1);
                var curS = document.getElementById('lotto-strategy-select')?.value || 'all';
                self.generateSmartCombinations(pools, curS);
            };
        }
    },

    generateSmartCombinations: function(pools, selectedStrategy) {
        var container = document.getElementById('ai-combinations-container');
        if (!container) return;
        container.innerHTML = '';

        var allStrategies = [
            { id: 'standard', label: "💎 다차원 최적화", desc: "평균값 수렴 정석 조합" },
            { id: 'trend', label: "📊 패턴 유사도형", desc: "최근 당첨 흐름 반영" },
            { id: 'hot', label: "🔥 기세 추종형", desc: "뜨거운 번호 집중 구성" },
            { id: 'balanced', label: "⚖️ 밸런스 가중형", desc: "대칭적 균형미 최적화" },
            { id: 'defensive', label: "🛡️ 데이터 방어형", desc: "미출현 번호 전략 포함" },
            { id: 'regression', label: "🚀 회귀 에너지형", desc: "출현 임박 시점 집중" },
            { id: 'neighbor', label: "🏠 이웃수 시너지", desc: "직전 당첨 연계 강화" },
            { id: 'prime', label: "🔢 소수/합성수형", desc: "수학적 확률 분포 설계" },
            { id: 'section', label: "🎨 섹션 컬러 배분", desc: "전 구간 균등 배분 밸런스" },
            { id: 'extreme', label: "📉 저빈도 역습형", desc: "희귀 패턴 기반 잭팟 목표" }
        ];

        var strategies = selectedStrategy === 'all' 
            ? allStrategies 
            : Array(10).fill(allStrategies.find(s => s.id === selectedStrategy));

        container.style.gridTemplateColumns = 'repeat(5, 1fr)';

        var stats = this.statsData.stats_summary;
        var results = [];
        var lastDraw = this.statsData.recent_draws[0];

        strategies.forEach(strategy => {
            var found = false, attempts = 0;
            while (!found && attempts < 1000) {
                attempts++;
                var pick = [];
                var pool = pools.hot.concat(pools.neutral);
                
                if (strategy.id === 'hot') pool = pools.hot.slice(0, 15);
                if (strategy.id === 'defensive') pool = pools.neutral.concat(pools.cold);
                if (strategy.id === 'extreme') pool = pools.cold.concat(pools.neutral.slice(0, 2));
                if (strategy.id === 'neighbor') {
                    var neighbors = [];
                    lastDraw.nums.forEach(n => { if (n > 1) neighbors.push(n-1); if (n < 45) neighbors.push(n+1); });
                    pool = neighbors.concat(pools.hot.slice(0, 10));
                }

                var localPool = [...new Set(pool)];
                
                // [Synergy-AI] 궁합 기반 스마트 추출
                while (pick.length < 6 && localPool.length > 0) {
                    if (pick.length === 0) {
                        var n = localPool.splice(Math.floor(Math.random() * localPool.length), 1)[0];
                        if (n >= 1 && n <= 45) pick.push(n);
                    } else {
                        // 현재까지 뽑힌 번호들과의 궁합 점수 합산 랭킹 산출
                        localPool.sort((a, b) => {
                            var scoreA = pick.reduce((sum, p) => sum + (this.synergyMatrix[p]?.[a] || 0), 0);
                            var scoreB = pick.reduce((sum, p) => sum + (this.synergyMatrix[p]?.[b] || 0), 0);
                            return scoreB - scoreA;
                        });
                        // 상위 3개 중 하나를 무작위 선택 (변별력 확보)
                        var topN = Math.min(3, localPool.length);
                        var pickedIdx = Math.floor(Math.random() * topN);
                        var n = localPool.splice(pickedIdx, 1)[0];
                        if (n >= 1 && n <= 45 && !pick.includes(n)) pick.push(n);
                    }
                }
                
                if (pick.length < 6) { for(var i=1; i<=45; i++) { if(pick.length < 6 && !pick.includes(i)) pick.push(i); } }

                pick.sort((a,b)=>a-b);
                var sum = pick.reduce((a,b)=>a+b, 0);
                var synergy = LottoSynergy.check(pick, this.statsData);
                var hasDanger = synergy.some(s => s.status === 'danger');
                var isDuplicate = results.some(r => JSON.stringify(r.nums) === JSON.stringify(pick));
                
                // [Relational Filtering] 궁합 점수 및 고급 지표 검증
                var compScore = LottoAI.getCompatibilityScore(pick, this.synergyMatrix);
                var advScore = LottoAI.getAdvancedScore(pick, this.statsData, this.synergyMatrix);
                
                var isPass = (Math.abs(sum - stats.sum.mean) <= 45 && !hasDanger && advScore >= 30);
                if (strategy.id === 'extreme') isPass = (sum < stats.sum.mean - 20 || sum > stats.sum.mean + 20);
                
                if ((isPass || attempts > 900) && !isDuplicate) {
                    results.push({ nums: pick, strategy: strategy, synergyScore: advScore });
                    found = true;
                }
            }
        });

        results.forEach(res => {
            var card = document.createElement('div');
            card.className = 'combo-card';
            var ballHtml = res.nums.map(n => LottoUI.createBall(n, true).outerHTML).join('');

            card.innerHTML = `
                <div class="combo-rank" style="background:${this.getStrategyColor(res.strategy.id)}; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); font-weight: 900;">${res.strategy.label}</div>
                <div class="ball-container">${ballHtml}</div>
                <div class="combo-meta">AI 시너지 <b>${res.synergyScore}pt</b> | 합계 ${res.nums.reduce((a,b)=>a+b,0)}</div>
                <div class="combo-desc">${res.strategy.desc}</div>
                <div class="analyze-badge">궁합 분석 완료 ➔</div>
            `;
            
            card.onclick = () => {
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums));
                location.href = 'combination.html';
            };
            container.appendChild(card);
        });
    },

    getStrategyColor: function(id) {
        var colors = {
            standard: '#3182f6', trend: '#00d084', hot: '#f04452', balanced: '#ff9500', 
            defensive: '#64748b', regression: '#8b5cf6', neighbor: '#ec4899', 
            prime: '#06b6d4', section: '#10b981', extreme: '#1e293b'
        };
        return colors[id] || '#3182f6';
    },

    renderPoolGrid: function(pools) {
        var mapping = [['hot-pool-container', pools.hot], ['neutral-pool-container', pools.neutral], ['cold-pool-container', pools.cold]];
        mapping.forEach(([id, nums]) => {
            var el = document.getElementById(id);
            if (el) {
                el.innerHTML = '';
                nums.forEach(n => el.appendChild(LottoUI.createBall(n, true)));
            }
        });
    }
};

function runBacktest(draws) {
    var body = document.getElementById('backtest-report-body');
    if (!body || !draws) return;
    body.innerHTML = '';
    
    var totalHits = 0, jackpotCount = 0, excludeSuccess = 0;
    var count = Math.min(20, draws.length);
    var targetDraws = draws.slice(0, count);

    targetDraws.forEach((draw, i) => {
        var pools = LottoAI.getComplexPools(draws, i);
        var hits = draw.nums.filter(n => pools.hot.includes(n));
        totalHits += hits.length;
        if (hits.length >= 5) jackpotCount++;
        
        var excludeHit = draw.nums.every(n => !pools.cold.includes(n));
        if (excludeHit) excludeSuccess++;

        var tr = document.createElement('tr');
        var winHtml = `<div class="ball-container">${draw.nums.map(n => LottoUI.createBall(n, true).outerHTML).join('')}</div>`;
        var hotHtml = `<div class="pool-grid-10">${pools.hot.map(n => {
            var b = LottoUI.createBall(n, true);
            if (!draw.nums.includes(n)) b.style.opacity = '0.2';
            return b.outerHTML;
        }).join('')}</div>`;

        tr.innerHTML = `
            <td><strong>${draw.no}회</strong></td>
            <td>${winHtml}</td>
            <td>${hotHtml}</td>
            <td><div class="pool-grid-mini">${pools.neutral.map(n => `<span class="pool-num">${n}</span>`).join('')}</div></td>
            <td><div class="pool-grid-mini">${pools.cold.map(n => `<span class="pool-num">${n}</span>`).join('')}</div></td>
            <td><div class="status-badge ${hits.length>=4?'safe':'warning'}">적중 ${hits.length}</div></td>
        `;
        body.appendChild(tr);
    });

    var board = document.getElementById('summary-stat-board');
    if (board) {
        board.style.display = 'block';
        document.getElementById('avg-hit-count').innerText = (totalHits / count).toFixed(1);
        document.getElementById('jackpot-count').innerText = jackpotCount;
        document.getElementById('total-exclude-success').innerText = excludeSuccess;
        document.getElementById('exclude-rate').innerText = Math.round((excludeSuccess / count) * 100);
    }
}

document.addEventListener('DOMContentLoaded', () => PredictionEngine.init());
