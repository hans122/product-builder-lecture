'use strict';

/**
 * AI Prediction Engine v6.0 - Synergy-AI Edition
 * - Integrated with Co-occurrence Synergy Matrix
 * - Advanced Multi-step Filtering (Statistical + Relational)
 */

var PredictionEngine = {
    statsData: null,
    synergyMatrix: null,
    endingChainMatrix: null,
    worker: null,

    init: function() {
        var self = this;
        // Web Worker 초기화
        if (window.Worker) {
            this.worker = new Worker('ai_worker.js');
            this.worker.onmessage = function(e) {
                if (e.data.type === 'GENERATE_COMBINATIONS') {
                    self.renderCombinations(e.data.result);
                }
            };
        }

        LottoDataManager.getStats(function(data) {
            if (!data) return;
            self.statsData = data;
            // 1. 궁합 및 끝수 전이 매트릭스 실시간 계산 (메인 스레드에서 수행 - 1회성)
            self.synergyMatrix = LottoAI.calculateSynergyMatrix(data.recent_draws, 300);
            self.endingChainMatrix = LottoAI.calculateEndingChainMatrix(data.recent_draws, 300);
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
        
        // 로딩 UI 표시
        container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1; padding: 50px;"><div class="spinner"></div><p style="margin-top:15px; color:#3182f6; font-weight:bold;">AI 딥 시너지 엔진이 최적의 조합을 연산 중입니다...</p></div>';

        var allStrategies = LottoConfig.STRATEGIES;
        var strategies = selectedStrategy === 'all' 
            ? allStrategies 
            : Array(10).fill(allStrategies.find(s => s.id === selectedStrategy));

        container.style.gridTemplateColumns = 'repeat(5, 1fr)';

        if (this.worker) {
            // Worker에 작업 위임
            this.worker.postMessage({
                type: 'GENERATE_COMBINATIONS',
                pools: pools,
                strategies: strategies,
                statsData: this.statsData,
                synergyMatrix: this.synergyMatrix,
                endingChainMatrix: this.endingChainMatrix
            });
        } else {
            // Fallback (Worker 미지원 브라우저)
            console.warn('Web Worker not supported. Running on main thread.');
            // ... (기존 동기 로직 유지 가능하지만 생략, 최신 브라우저 타겟)
        }
    },

    renderCombinations: function(results) {
        var container = document.getElementById('ai-combinations-container');
        if (!container) return;
        container.innerHTML = '';

        if (!results || results.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">조건에 맞는 조합을 찾지 못했습니다. 다시 시도해주세요.</div>';
            return;
        }

        results.forEach(res => {
            var card = LottoUI.createComboCard(res);
            card.onclick = () => {
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums));
                location.href = 'combination.html';
            };
            container.appendChild(card);
        });
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
