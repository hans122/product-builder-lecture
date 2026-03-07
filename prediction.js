'use strict';

/**
 * AI Prediction Engine v7.0 (Performance & Quantity Optimized)
 * - Hybrid Recommendation (Archive + Real-time Worker)
 * - 100% Quantity Guarantee (10 items always)
 * - Smooth Animation & Error Handling
 */

var PredictionEngine = {
    statsData: null,
    synergyMatrix: null,
    endingChainMatrix: null,
    worker: null,
    _tempArchiveResults: [],

    init: function() {
        var self = this;
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
            self.synergyMatrix = LottoAI.calculateSynergyMatrix(data.recent_draws, 300);
            self.endingChainMatrix = LottoAI.calculateEndingChainMatrix(data.recent_draws, 300);
            self.renderAll();
            self.renderArchive();
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

    /** [v32.65] 지능형 추천 생성 로직 (저장소 완전 분리 버전) 
     *  - lotto_system_pool: AI의 빠른 응답을 위한 시스템 캐시 (자동 관리)
     *  - lotto_ai_archive: 사용자님의 소중한 찜 목록 (수동 관리)
     */
    generateSmartCombinations: function(pools, selectedStrategy) {
        var container = document.getElementById('ai-combinations-container');
        if (!container || !this.statsData) return;
        
        container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1; padding: 50px;"><div class="spinner"></div><p style="margin-top:15px; color:#3182f6; font-weight:bold;">AI 엔진이 최적의 조합을 선별 중입니다...</p></div>';

        // 1. AI 시스템 캐시(Pool) 로드 및 검증
        var rawPool = localStorage.getItem('lotto_system_pool');
        var pool = rawPool ? JSON.parse(rawPool) : [];
        var self = this;

        // 현재 데이터 기준으로 시스템 풀 정화 (Purge)
        var validPool = pool.filter(function(item) {
            var lastDraw = self.statsData.recent_draws[0]?.nums;
            if (lastDraw && JSON.stringify(item.nums.slice().sort()) === JSON.stringify(lastDraw.slice().sort())) return false;
            if ((item.score || 0) < 70) return false;
            if (selectedStrategy !== 'all' && selectedStrategy !== 'ensemble') {
                if (!item.strategy || item.strategy.id !== selectedStrategy) return false;
            }
            return true;
        });

        // 2. 하이브리드 추출 (시스템 풀에서 8개 가져오기)
        var shuffled = validPool.sort(() => 0.5 - Math.random());
        var existing = shuffled.slice(0, 8); 
        var needed = 10 - existing.length;
        var requestCount = Math.max(2, needed); // 항상 최소 2개는 신규 생성

        var allStrats = LottoConfig.STRATEGIES;
        var targets = [];
        for (var j = 0; j < requestCount; j++) {
            if (selectedStrategy === 'all' || selectedStrategy === 'ensemble') {
                targets.push(allStrats[Math.floor(Math.random() * allStrats.length)]);
            } else {
                var found = allStrats.find(s => s.id === selectedStrategy);
                targets.push(found || allStrats[0]);
            }
        }

        if (this.worker) {
            this._tempArchiveResults = existing;
            this.worker.postMessage({
                type: 'GENERATE_COMBINATIONS',
                pools: pools,
                strategies: targets,
                statsData: this.statsData,
                synergyMatrix: this.synergyMatrix,
                existingNums: existing.map(r => r.nums)
            });
        }
    },

    renderCombinations: function(newResults) {
        var container = document.getElementById('ai-combinations-container');
        if (!container) return;
        
        var final = (this._tempArchiveResults || []).concat(newResults || []);
        this._tempArchiveResults = []; 
        final = final.slice(0, 10);
        container.innerHTML = '';

        if (final.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">조합을 생성할 수 없습니다.</div>';
            return;
        }

        final.forEach(res => {
            var card = LottoUI.createComboCard(res);
            card.onclick = () => {
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums));
                location.href = 'combination.html';
            };
            container.appendChild(card);
        });

        // [시스템 풀 자동 증식] 에이스 조합은 AI 전용 풀에 보관 (사용자 아카이브와 무관)
        if (newResults && newResults.length > 0) {
            var aceResults = newResults.filter(r => {
                var actualScore = r.score || r.synergyScore || 0;
                return actualScore >= 80 || (r.ensembleCount || 0) >= 3;
            });
            if (aceResults.length > 0) this.saveToSystemPool(aceResults);
        }
    },

    /** AI 시스템 전용 풀 저장 (자동 관리) */
    saveToSystemPool: function(newResults) {
        var raw = localStorage.getItem('lotto_system_pool');
        var pool = raw ? JSON.parse(raw) : [];
        newResults.forEach(res => {
            var isDup = pool.some(item => JSON.stringify(item.nums.slice().sort()) === JSON.stringify(res.nums.slice().sort()));
            if (!isDup) pool.unshift(res);
        });
        if (pool.length > 100) pool = pool.slice(0, 100);
        localStorage.setItem('lotto_system_pool', JSON.stringify(pool));
    },

    /** 사용자 전용 아카이브 저장 (⭐ 버튼 클릭 시 호출) */
    saveToArchive: function(newResults) {
        var raw = localStorage.getItem('lotto_ai_archive');
        var archive = raw ? JSON.parse(raw) : [];
        newResults.forEach(res => {
            var isDup = archive.some(item => JSON.stringify(item.nums.slice().sort()) === JSON.stringify(res.nums.slice().sort()));
            if (!isDup) archive.unshift({ ...res, timestamp: Date.now() });
        });
        if (archive.length > 200) archive = archive.slice(0, 200);
        localStorage.setItem('lotto_ai_archive', JSON.stringify(archive));
        this.renderArchive();
    },

    renderArchive: function() {
        var container = document.getElementById('ai-archive-container');
        if (!container) return;
        
        // [v32.63] 전체 삭제 버튼 이벤트는 데이터 유무와 상관없이 항상 바인딩
        var clearBtn = document.getElementById('clear-archive-btn');
        if (clearBtn) {
            clearBtn.onclick = () => { 
                if(confirm('보관소의 모든 조합을 삭제하시겠습니까?')) { 
                    localStorage.removeItem('lotto_ai_archive'); 
                    this.renderArchive(); 
                } 
            };
        }

        var raw = localStorage.getItem('lotto_ai_archive');
        var archive = raw ? JSON.parse(raw) : [];
        if (archive.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">저장된 조합이 없습니다.</div>';
            return;
        }
        archive.sort((a, b) => (parseFloat(b.prob?.multiplier) || 0) - (parseFloat(a.prob?.multiplier) || 0));
        container.innerHTML = '';
        archive.forEach(res => {
            var wrapper = document.createElement('div');
            wrapper.className = 'archive-card-wrapper';
            var card = LottoUI.createComboCard(res);
            card.onclick = () => { localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums)); location.href = 'combination.html'; };
            var delBtn = document.createElement('button');
            delBtn.className = 'archive-del-btn';
            delBtn.innerHTML = '×';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('삭제하시겠습니까?')) {
                    wrapper.classList.add('removing');
                    setTimeout(() => { this.removeFromArchive(res.nums); }, 400);
                }
            };
            wrapper.appendChild(delBtn);
            wrapper.appendChild(card);
            container.appendChild(wrapper);
        });
    },

    removeFromArchive: function(nums) {
        var raw = localStorage.getItem('lotto_ai_archive');
        var archive = raw ? JSON.parse(raw) : [];
        var numsStr = JSON.stringify(nums.slice().sort());
        var filtered = archive.filter(item => JSON.stringify(item.nums.slice().sort()) !== numsStr);
        localStorage.setItem('lotto_ai_archive', JSON.stringify(filtered));
        this.renderArchive();
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
            var b = LottoUI.createBall(n, true); if (!draw.nums.includes(n)) b.style.opacity = '0.2'; return b.outerHTML;
        }).join('')}</div>`;
        tr.innerHTML = `<td><strong>${draw.no}회</strong></td><td>${winHtml}</td><td>${hotHtml}</td><td><div class="pool-grid-mini">${pools.neutral.map(n => `<span class="pool-num">${n}</span>`).join('')}</div></td><td><div class="pool-grid-mini">${pools.cold.map(n => `<span class="pool-num">${n}</span>`).join('')}</div></td><td><div class="status-badge ${hits.length>=4?'safe':'warning'}">적중 ${hits.length}</div></td>`;
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
