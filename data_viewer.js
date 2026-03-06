'use strict';

/**
 * AI Data Viewer Engine v1.0 (History & Stats Viewer Combined)
 * - Optimized for Expert-Grade Tables
 * - Unified Logic for Sticky Columns & Slanted Headers
 */

var DataViewer = {
    isPension: false,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data && data.recent_draws) self.renderPensionHistory(data.recent_draws);
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) {
                    if (data.recent_draws) self.renderLottoHistory(data.recent_draws, data.stats_summary);
                    self.renderHistorySummary(data);
                }
            });
        }
    },

    // --- Lotto History Logic ---
    renderLottoHistory: function(draws, statsSummary) {
        var thead = document.getElementById('history-table-head');
        var tbody = document.getElementById('history-analysis-body');
        if (!thead || !tbody) return;

        var indicators = LottoConfig.INDICATORS;
        var headHtml = '<tr><th style="width: 65px;">회차</th><th style="width: 155px;">당첨번호</th>';
        indicators.forEach(cfg => {
            headHtml += '<th class="slant-column"><div class="slant-wrapper"><span>' + cfg.label + '</span></div></th>';
        });
        headHtml += '</tr>';
        thead.innerHTML = headHtml;

        tbody.innerHTML = '';
        draws.forEach(draw => {
            var tr = document.createElement('tr');
            var ballsHtml = draw.nums.map(n => LottoUI.createBall(n, true).outerHTML).join('');
            var rowHtml = '<td><strong>' + draw.no + '</strong><br><small style="color:#94a3b8">' + draw.date + '</small></td><td><div class="table-nums">' + ballsHtml + '</div></td>';
            
            indicators.forEach(cfg => {
                var val = draw[cfg.drawKey] !== undefined ? draw[cfg.drawKey] : '-';
                var status = LottoUtils.getZStatus(val, statsSummary[cfg.statKey]);
                rowHtml += '<td class="stat-val text-' + status + '">' + val + '</td>';
            });
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });
    },

    renderHistorySummary: function(data) {
        var container = document.getElementById('history-p1-cum-container');
        if (!container || !data.distributions.period_1_3) return;
        var stats = data.distributions.period_1_3;
        container.innerHTML = '';
        Object.keys(stats).sort((a,b)=>a-b).forEach(label => {
            var prob = ((stats[label] / data.total_draws) * 100).toFixed(1);
            var item = document.createElement('div');
            item.className = 'analysis-card'; item.style.cssText = 'padding:10px; text-align:center; min-width:80px;';
            item.innerHTML = '<span style="font-size:0.65rem; color:#64748b;">1~3회전 ' + label + '개</span><br><strong>' + prob + '%</strong>';
            container.appendChild(item);
        });
    },

    // --- Pension History Logic ---
    renderPensionHistory: function(records) {
        var tbody = document.getElementById('pension-history-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        records.forEach(draw => {
            var tr = document.createElement('tr');
            var balance = PensionUtils.analyzeBalance(draw.nums);
            var pattern = PensionUtils.analyzePatterns(draw.nums);
            
            var dateStr = draw.date;
            if (dateStr && dateStr.length === 8) {
                dateStr = dateStr.substring(0,4) + '.' + dateStr.substring(4,6) + '.' + dateStr.substring(6,8);
            }

            var html = '<td class="sticky-col first"><strong>' + draw.no + '회</strong></td>' +
                       '<td class="sticky-col date-col">' + dateStr + '</td>' +
                       '<td class="sticky-col second"><div class="pension-ball group small">' + draw.group + '</div></td>';
            
            draw.nums.forEach(n => {
                var color = n >= 5 ? 'blue' : 'yellow';
                html += '<td><div class="pension-ball small ' + color + '">' + n + '</div></td>';
            });
            
            var sumClass = balance.sum >= 20 && balance.sum <= 34 ? 'c-blue' : 'c-red';
            html += '<td class="' + sumClass + '"><strong>' + balance.sum + '</strong></td>' +
                    '<td>' + (6 - balance.odd) + ':' + balance.odd + '</td>' +
                    '<td><span class="status-tag ' + (pattern.maxOccur >= 3 ? 'fail' : 'excellent') + '">' + 
                    (pattern.maxOccur >= 3 ? '편중' : '균형') + '</span></td>';
            
            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() { DataViewer.init(); });
