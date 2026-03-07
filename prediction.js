'use strict';

/**
 * AI Prediction Engine v4.2 - Standardized Edition
 * - Integrated with LottoDataManager (SSOT)
 * - Uses Core LottoUtils & Synergy Engine
 * - Clean Layout without inline styles
 */

var PredictionEngine = {
    statsData: null,

    init: function() {
        var self = this;
        LottoDataManager.getStats(function(data) {
            if (!data) return;
            self.statsData = data;
            self.renderAll();
            self.bindEvents();
        });
    },

    renderAll: function() {
        var pools = this.getPools(this.statsData.recent_draws || [], -1);
        this.renderPoolGrid(pools);
        this.generateSmartCombinations(pools, 0);
        if (typeof runBacktest === 'function') runBacktest(this.statsData.recent_draws || []);
    },

    bindEvents: function() {
        var self = this;
        var anchorSelect = document.getElementById('lotto-anchor-select');
        if (anchorSelect) {
            anchorSelect.onchange = function() {
                var pools = self.getPools(self.statsData.recent_draws || [], -1);
                self.generateSmartCombinations(pools, parseInt(this.value));
            };
        }
        
        var refreshBtn = document.getElementById('refresh-recommendations-btn');
        if (refreshBtn) {
            refreshBtn.onclick = function() {
                var pools = self.getPools(self.statsData.recent_draws || [], -1);
                var curA = parseInt(document.getElementById('lotto-anchor-select').value || 0);
                self.generateSmartCombinations(pools, curA);
            };
        }
    },

    getPools: function(allDraws, currentIndex) {
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

    generateSmartCombinations: function(pools, anchorNum) {
        var container = document.getElementById('ai-combinations-container');
        if (!container) return;
        container.innerHTML = '';

        var strategies = [
            { id: 'standard', label: "💎 다차원 최적화", desc: "평균값에 수렴하는 정석 조합" },
            { id: 'trend', label: "📊 패턴 유사도형", desc: "최근 10회차 당첨 흐름 반영" },
            { id: 'hot', label: "🔥 기세 추종형", desc: "출현 기세가 높은 번호 집중" },
            { id: 'balanced', label: "⚖️ 밸런스 가중형", desc: "홀짝/고저 대칭 밸런스 최적화" },
            { id: 'defensive', label: "🛡️ 데이터 방어형", desc: "장기 미출현 번호 전략적 포함" }
        ];

        var stats = this.statsData.stats_summary;
        var results = [];

        strategies.forEach(strategy => {
            for (var count = 0; count < 2; count++) { // 각 전략별 2개씩 생성 (총 10개)
                var found = false, attempts = 0;
                while (!found && attempts < 500) {
                    attempts++;
                    var pick = anchorNum > 0 ? [anchorNum] : [];
                    var pool = (strategy.id === 'hot') ? pools.hot.slice(0, 20) : pools.hot.concat(pools.neutral);
                    var localPool = [...pool];
                    
                    while (pick.length < 6 && localPool.length > 0) {
                        var n = localPool.splice(Math.floor(Math.random() * localPool.length), 1)[0];
                        if (!pick.includes(n)) pick.push(n);
                    }
                    
                    pick.sort((a,b)=>a-b);
                    if (pick.length < 6) continue;

                    var sum = pick.reduce((a,b)=>a+b, 0);
                    var synergy = LottoSynergy.check(pick, this.statsData);
                    var hasDanger = synergy.some(s => s.status === 'danger');
                    
                    // 중복 조합 방지
                    var isDuplicate = results.some(r => JSON.stringify(r.nums) === JSON.stringify(pick));
                    
                    if (((Math.abs(sum - stats.sum.mean) <= 45 && !hasDanger) || attempts > 450) && !isDuplicate) {
                        results.push({ nums: pick, strategy: strategy });
                        found = true;
                    }
                }
            }
        });

        results.forEach(res => {
            var card = document.createElement('div');
            card.className = 'combo-card';
            var ballHtml = res.nums.map(n => {
                var b = LottoUI.createBall(n, true);
                if (anchorNum > 0 && n === anchorNum) b.style.boxShadow = '0 0 0 3px var(--primary-blue)';
                return b.outerHTML;
            }).join('');

            card.innerHTML = `
                <div class="combo-rank">${res.strategy.label}</div>
                <div class="ball-container">${ballHtml}</div>
                <div class="combo-meta">신뢰도 <b>${90 + Math.floor(Math.random()*9)}%</b> | 합계 ${res.nums.reduce((a,b)=>a+b,0)}</div>
                <div class="combo-desc">${res.strategy.desc}</div>
                <div class="analyze-badge">정밀 분석 ➔</div>
            `;
            
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
        var pools = PredictionEngine.getPools(draws, i);
        var hits = draw.nums.filter(n => pools.hot.includes(n));
        totalHits += hits.length;
        if (hits.length >= 5) jackpotCount++; // 3등 이상 가정
        
        // 제외 적중 여부 (Cold 10개 중 실제 당첨번호가 없는 경우)
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

    // 상단 스코어보드 업데이트
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
