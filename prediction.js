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
            self.renderArchive(); // [v32.25] 초기화 시 아카이브 표시
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
        
        container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1; padding: 50px;"><div class="spinner"></div><p style="margin-top:15px; color:#3182f6; font-weight:bold;">AI 아카이브 및 딥 엔진에서 최적의 조합을 선별 중입니다...</p></div>';

        // [v32.26/v32.28] 아카이브 우선 선별 로직 (기댓값 정렬 추가)
        var rawArchive = localStorage.getItem('lotto_ai_archive');
        var archive = rawArchive ? JSON.parse(rawArchive) : [];
        var filteredArchive = [];
        
        if (selectedStrategy !== 'all') {
            filteredArchive = archive.filter(item => item.strategy && item.strategy.id === selectedStrategy);
            // v32.28: 기댓값 높은 순으로 정렬
            filteredArchive.sort((a, b) => (parseFloat(b.prob?.multiplier) || 0) - (parseFloat(a.prob?.multiplier) || 0));
        } else {
            // 전체 전략일 경우 최신순 유지
            filteredArchive = archive.slice(0, 10);
        }

        // 최대 10개 추출
        var existingResults = filteredArchive.slice(0, 10);
        var neededCount = 10 - existingResults.length;

        if (neededCount <= 0) {
            // 아카이브에 충분한 조합이 있으면 즉시 렌더링
            setTimeout(() => this.renderCombinations(existingResults), 300);
            return;
        }

        // 부족한 수량만큼만 AI 엔진 가동
        var allStrategies = LottoConfig.STRATEGIES;
        var strategiesToGenerate = [];
        for (var i = 0; i < neededCount; i++) {
            if (selectedStrategy === 'all') {
                strategiesToGenerate.push(allStrategies[i % allStrategies.length]);
            } else {
                strategiesToGenerate.push(allStrategies.find(s => s.id === selectedStrategy));
            }
        }

        if (this.worker) {
            this.worker.postMessage({
                type: 'GENERATE_COMBINATIONS',
                pools: pools,
                strategies: strategiesToGenerate,
                statsData: this.statsData,
                synergyMatrix: this.synergyMatrix,
                endingChainMatrix: this.endingChainMatrix,
                // 기존 결과 전달하여 중복 생성 방지
                existingNums: existingResults.map(r => r.nums)
            });
            
            // 기존 결과 임시 저장 (Worker 결과와 합치기 위함)
            this._tempArchiveResults = existingResults;
        }
    },

    renderCombinations: function(newResults) {
        var container = document.getElementById('ai-combinations-container');
        if (!container) return;
        container.innerHTML = '';

        // [v32.26] 아카이브 추출물과 신규 생성물 병합
        var finalResults = (this._tempArchiveResults || []).concat(newResults || []);
        this._tempArchiveResults = []; // 초기화

        if (!finalResults || finalResults.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">조건에 맞는 조합을 찾지 못했습니다. 다시 시도해주세요.</div>';
            return;
        }

        // 결과 렌더링
        finalResults.forEach(res => {
            var card = LottoUI.createComboCard(res);
            card.onclick = () => {
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums));
                location.href = 'combination.html';
            };
            container.appendChild(card);
        });

        // 신규로 생성된 것들만 아카이브에 추가 저장
        if (newResults && newResults.length > 0) {
            this.saveToArchive(newResults);
        }
    },

    /** [v32.25] 아카이브 저장 및 렌더링 로직 */
    saveToArchive: function(newResults) {
        var raw = localStorage.getItem('lotto_ai_archive');
        var archive = raw ? JSON.parse(raw) : [];
        
        newResults.forEach(res => {
            // 중복 체크 (숫자 배열 기반)
            var isDuplicate = archive.some(item => JSON.stringify(item.nums.slice().sort()) === JSON.stringify(res.nums.slice().sort()));
            if (!isDuplicate) {
                // 저장 시점 및 메타데이터 추가
                var saveItem = {
                    nums: res.nums,
                    strategy: res.strategy,
                    prob: res.prob,
                    synergyScore: res.synergyScore,
                    ensembleCount: res.ensembleCount,
                    timestamp: new Date().getTime()
                };
                archive.unshift(saveItem); // 최신순 저장
            }
        });

        // 최대 100개까지만 유지
        archive = archive.slice(0, 100);
        localStorage.setItem('lotto_ai_archive', JSON.stringify(archive));
        this.renderArchive();
    },

    renderArchive: function() {
        var container = document.getElementById('ai-archive-container');
        if (!container) return;
        
        var raw = localStorage.getItem('lotto_ai_archive');
        var archive = raw ? JSON.parse(raw) : [];
        if (archive.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">저장된 조합이 없습니다.</div>';
            return;
        }
        
        // v32.30: 아카이브 표시 시에도 기댓값 높은 순 정렬
        archive.sort((a, b) => (parseFloat(b.prob?.multiplier) || 0) - (parseFloat(a.prob?.multiplier) || 0));
        
        container.innerHTML = '';
        archive.forEach((res, idx) => {
            var cardWrapper = document.createElement('div');
            cardWrapper.className = 'archive-card-wrapper';
            
            var card = LottoUI.createComboCard(res);
            card.style.opacity = '0.9';
            card.onclick = () => {
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(res.nums));
                location.href = 'combination.html';
            };
            
            // v32.31 애니메이션 지원 삭제 버튼
            var delBtn = document.createElement('button');
            delBtn.className = 'archive-del-btn';
            delBtn.innerHTML = '×';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('이 조합을 삭제하시겠습니까?')) {
                    cardWrapper.classList.add('removing');
                    setTimeout(() => {
                        this.removeFromArchive(res.nums);
                    }, 400); // 애니메이션 시간(0.4s) 대기
                }
            };
            
            cardWrapper.appendChild(delBtn);
            cardWrapper.appendChild(card);
            container.appendChild(cardWrapper);
        });

        var clearBtn = document.getElementById('clear-archive-btn');
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('저장된 모든 아카이브를 삭제하시겠습니까?')) {
                    localStorage.removeItem('lotto_ai_archive');
                    this.renderArchive();
                }
            };
        }
    },

    /** [v32.30] 개별 조합 삭제 로직 */
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
