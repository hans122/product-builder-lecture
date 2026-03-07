'use strict';

/**
 * AI Data Viewer v2.0 - Fully Automated Table Engine
 * - Dynamic Column Generation using LottoConfig.INDICATORS
 * - Responsive Expert Layout with Sticky Headers
 */

var DataViewer = {
    isPension: false,
    statsData: null,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) { self.statsData = data; self.renderPensionHistory(); }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) { self.statsData = data; self.renderLottoHistory(); }
            });
        }
    },

    renderLottoHistory: function() {
        var thead = document.getElementById('history-table-head');
        var tbody = document.getElementById('history-analysis-body'); // ID 수정: history-table-body -> history-analysis-body
        if (!thead || !tbody) return;

        var draws = this.statsData.recent_draws || [];
        var activeIndicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.history);

        // [NEW] 최근 30회차 이월수 누적 출현 분포 렌더링
        this.renderCumulativePeriod1(draws.slice(0, 30));

        // 1. 헤더 생성
        var headerHtml = `<tr>
            <th class="sticky-col first" style="width:60px; background: #f8fafc; z-index: 11;">회차</th>
            <th class="sticky-col second" style="width:180px; background: #f8fafc; z-index: 11;">당첨번호</th>
            ${activeIndicators.map((cfg, idx) => {
                var displayLabel = `${LottoUtils.padLeft(idx + 1, 2, '0')}) ${cfg.label}`;
                return `<th class="slant-column"><div class="slant-wrapper"><span>${displayLabel}</span></div></th>`;
            }).join('')}
        </tr>`;
        thead.innerHTML = headerHtml;

        // 2. 바디 데이터 렌더링
        tbody.innerHTML = '';
        draws.forEach((draw, idx) => {
            var tr = document.createElement('tr');
            var ballsHtml = draw.nums.map(n => LottoUI.Ball.create(n, true).outerHTML).join('');
            
            // 전회차 데이터를 넘겨주어 이월수 등 상대 지표 계산 가능하게 함
            var context = { 
                last_3_draws: [
                    draws[idx + 1]?.nums,
                    draws[idx + 2]?.nums,
                    draws[idx + 3]?.nums
                ].filter(d => d) 
            };

            var rowHtml = `
                <td class="sticky-col first"><strong>${draw.no}</strong></td>
                <td class="sticky-col second"><div class="ball-container mini">${ballsHtml}</div></td>
                ${activeIndicators.map(cfg => {
                    var val = cfg.calc(draw.nums, context);
                    var status = 'safe';
                    if (this.statsData.stats_summary && this.statsData.stats_summary[cfg.statKey]) {
                        status = LottoUtils.getZStatus(val, this.statsData.stats_summary[cfg.statKey]);
                    }
                    var color = status === 'danger' ? '#f04452' : (status === 'warning' ? '#ff9500' : '#1e293b');
                    var weight = status !== 'safe' ? '900' : '400';
                    return `<td style="color:${color}; font-weight:${weight};">${val}</td>`;
                }).join('')}
            `;
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    },

    /** [NEW] 이월수 누적 출현 분포 (최근 30회차) */
    renderCumulativePeriod1: function(draws) {
        var container = document.getElementById('history-p1-cum-container');
        if (!container) return;

        var counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        var p1Config = LottoConfig.INDICATORS.find(c => c.id === 'period_1');
        
        draws.forEach((d, idx) => {
            var prevNums = draws[idx + 1]?.nums;
            if (prevNums) {
                var p1 = d.nums.filter(n => new Set(prevNums).has(n)).length;
                if (counts[p1] !== undefined) counts[p1]++;
            }
        });

        var total = Object.values(counts).reduce((a, b) => a + b, 0);
        var html = '';
        
        Object.entries(counts).forEach(([val, cnt]) => {
            if (cnt === 0) return;
            var per = Math.round((cnt / total) * 100);
            html += `<div style="background:white; border:1px solid #e2e8f0; padding:8px 12px; border-radius:8px; display:flex; align-items:center; gap:8px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <span style="font-size:0.7rem; color:#64748b; font-weight:800;">${val}개</span>
                <span style="font-size:0.9rem; font-weight:900; color:#1e293b;">${cnt}회</span>
                <span style="font-size:0.65rem; color:#3182f6; font-weight:700;">(${per}%)</span>
            </div>`;
        });
        
        container.innerHTML = html || '<div style="font-size:0.7rem; color:#94a3b8;">데이터가 충분하지 않습니다.</div>';
    },

    renderPensionHistory: function() {
        var table = document.getElementById('pension-history-table');
        if (!table) return;

        var draws = this.statsData.recent_draws || [];
        var activeIndicators = LottoConfig.PENSION_INDICATORS.filter(cfg => cfg.visible && cfg.visible.history);

        // 1. 헤더 생성
        var thead = table.querySelector('thead');
        if (thead) {
            var headerHtml = `<tr>
                <th style="width:70px;">회차</th>
                <th style="width:200px;">당첨번호</th>
                ${activeIndicators.map((cfg, idx) => {
                    var displayLabel = `P${LottoUtils.padLeft(idx + 1, 2, '0')}) ${cfg.label}`;
                    return `<th>${displayLabel}</th>`;
                }).join('')}
            </tr>`;
            thead.innerHTML = headerHtml;
        }

        // 2. 데이터 렌더링
        var tbody = table.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        draws.forEach(draw => {
            var tr = document.createElement('tr');
            var ballsHtml = `<div class="pension-ball group small">${draw.group}</div>` + 
                           draw.nums.map(n => `<div class="pension-ball small ${n >= 5 ? 'blue' : 'yellow'}">${n}</div>`).join('');
            
            var rowHtml = `
                <td><strong>${draw.no}회</strong></td>
                <td><div class="ball-container mini">${ballsHtml}</div></td>
                ${activeIndicators.map(cfg => {
                    var val = cfg.calc(draw.nums, { last_draw: draws[draws.indexOf(draw) + 1]?.nums });
                    return `<td>${val}</td>`;
                }).join('')}
            `;
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => DataViewer.init());
