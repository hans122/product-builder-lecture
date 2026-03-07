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
        var tbody = document.getElementById('history-table-body');
        if (!thead || !tbody) return;

        var draws = this.statsData.recent_draws || [];
        var activeIndicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.history);

        // 1. 헤더 생성
        var headerHtml = `<tr>
            <th class="sticky-col first" style="width:60px;">회차</th>
            <th class="sticky-col second" style="width:180px;">당첨번호</th>
            ${activeIndicators.map(cfg => `<th class="slant-column"><div class="slant-wrapper"><span>${cfg.label}</span></div></th>`).join('')}
        </tr>`;
        thead.innerHTML = headerHtml;

        // 2. 바디 데이터 렌더링
        tbody.innerHTML = '';
        draws.forEach(draw => {
            var tr = document.createElement('tr');
            var ballsHtml = draw.nums.map(n => LottoUI.createBall(n, true).outerHTML).join('');
            
            var rowHtml = `
                <td class="sticky-col first"><strong>${draw.no}</strong></td>
                <td class="sticky-col second"><div class="ball-container mini">${ballsHtml}</div></td>
                ${activeIndicators.map(cfg => {
                    var val = cfg.calc(draw.nums, this.statsData);
                    return `<td>${val}</td>`;
                }).join('')}
            `;
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
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
                ${activeIndicators.map(cfg => `<th>${cfg.label}</th>`).join('')}
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
