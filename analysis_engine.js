'use strict';

/**
 * AI Analysis Engine v3.0 (High-Performance Rendering)
 * - Sequential Chunked Rendering to prevent browser tab crashes (Error 5)
 * - Integrated AI Regression Timing & Multi-dimensional State Analysis
 */

var AnalysisEngine = {
    statsData: null,
    isPension: false,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) { self.statsData = data; self.runPensionAnalysis(data); }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) { self.statsData = data; self.runLottoAnalysis(data); }
            });
        }
    },

    /** [v30.0] 로또 분석 순차 렌더링 (Chrome Error 5 해결) */
    runLottoAnalysis: function(data) {
        var root = document.getElementById('dynamic-analysis-root');
        if (!root) return;
        root.innerHTML = '';

        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.analysis);
        var index = 0;
        var self = this;

        function renderNext() {
            if (index >= indicators.length) {
                // 마무리 분석 로직
                self.renderStrategyGroups(data.recent_draws);
                if (window.renderOverAppearanceAlert) renderOverAppearanceAlert(data.recent_draws);
                var markovMatrix = LottoAI.calculateEndingChainMatrix(data.recent_draws, 300);
                LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', markovMatrix, { color: '49, 130, 246', rowLabel: '끝수 ' });
                if (data.regression_signals) self.renderRegressionSignals('lotto-regression-container', data.regression_signals);
                if (data.frequency) self.renderFrequencyChart('full-frequency-chart', data.frequency);
                return;
            }

            var cfg = indicators[index];
            var displayLabel = `${LottoUtils.padLeft(index + 1, 2, '0')}) ${cfg.label}`;
            var section = document.createElement('section');
            section.className = 'analysis-card';
            section.innerHTML = `
                <div class="card-header"><h3>📍 ${displayLabel} 분석</h3></div>
                <div class="analysis-layout-split" style="padding: 20px;">
                    <div class="chart-wrapper"><div id="${cfg.id}-chart" class="dist-bar-chart" style="height: 200px;"></div></div>
                    <div class="mini-table-wrapper">
                        <h4>📊 최근 ${cfg.label} 리포트</h4>
                        <table class="mini-table"><tbody id="${cfg.id}-mini-body"></tbody></table>
                    </div>
                </div>
            `;
            root.appendChild(section);

            var dist = data.distributions ? data.distributions[cfg.distKey] : null;
            var stat = data.stats_summary ? data.stats_summary[cfg.statKey] : null;
            
            if (dist && stat) {
                LottoUI.createCurveChart(cfg.id + '-chart', dist, cfg.unit, stat, cfg);
            }
            LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);

            index++;
            // 20ms 간격으로 순차 렌더링하여 브라우저 부담 완화
            setTimeout(renderNext, 20);
        }

        renderNext();
    },

    /** [v30.0] 연금 분석 순차 렌더링 */
    runPensionAnalysis: function(data) {
        var root = document.getElementById('dynamic-pension-root');
        if (!root) return;
        root.innerHTML = '';

        var indicators = LottoConfig.PENSION_INDICATORS.filter(cfg => cfg.visible && cfg.visible.analysis);
        var index = 0;
        var self = this;

        function renderNext() {
            if (index >= indicators.length) {
                if (data.regression_signals) self.renderRegressionSignals('pension-regression-container', data.regression_signals);
                return;
            }

            var cfg = indicators[index];
            var displayLabel = `P${LottoUtils.padLeft(index + 1, 2, '0')}) ${cfg.label}`;
            var section = document.createElement('section');
            section.className = 'analysis-card';
            section.innerHTML = `
                <div class="card-header"><h3>📍 ${displayLabel} 분석</h3></div>
                <div class="analysis-layout-split" style="padding: 20px;">
                    <div class="chart-wrapper"><div id="${cfg.id}-chart" class="dist-bar-chart" style="height: 200px;"></div></div>
                    <div class="mini-table-wrapper">
                        <h4>📊 최근 ${cfg.label} 리포트</h4>
                        <table class="mini-table"><tbody id="${cfg.id}-mini-body"></tbody></table>
                    </div>
                </div>
            `;
            root.appendChild(section);

            var dist = data.distributions ? data.distributions[cfg.distKey] : null;
            var stat = data.stats_summary ? data.stats_summary[cfg.statKey] : null;
            
            if (dist && stat) {
                LottoUI.createCurveChart(cfg.id + '-chart', dist, cfg.unit, stat, cfg);
            }
            LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);

            index++;
            setTimeout(renderNext, 20);
        }

        renderNext();
    },

    renderFrequencyChart: function(containerId, freqData) {
        var container = document.getElementById(containerId);
        if (!container || !freqData) return;
        var maxFreq = Math.max.apply(null, Object.values(freqData));
        var html = '';
        for (var i = 1; i <= 45; i++) {
            var f = freqData[i] || 0;
            var h = (f / maxFreq) * 100;
            var color = LottoUtils.getBallColorClass(i);
            html += `<div class="bar-wrapper">
                <div class="bar ${color}" style="height:${h}%; min-height:2px;">
                    <span class="bar-value">${f}</span>
                </div>
                <span class="bar-label">${i}</span>
            </div>`;
        }
        container.innerHTML = html;
        container.className = 'frequency-chart';
    },

    renderStrategyGroups: function(recentDraws) {
        if (!recentDraws) return;
        var pools = LottoAI.getComplexPools(recentDraws, -1);
        var mapping = [{ id: 'hot', data: pools.hot }, { id: 'warm', data: pools.neutral }, { id: 'cold', data: pools.cold }];
        mapping.forEach(function(m) {
            var container = document.getElementById('group-' + m.id + '-container');
            var countEl = document.getElementById(m.id + '-count');
            if (container) {
                container.innerHTML = '';
                m.data.forEach(function(n) { container.appendChild(LottoUI.createBall(n, true)); });
            }
            if (countEl) countEl.innerText = m.data.length + '개';
        });
    },

    renderRegressionSignals: function(containerId, signals) {
        var container = document.getElementById(containerId);
        if (!container || !signals) return;
        var html = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:12px;">';
        Object.keys(signals).forEach(function(label) {
            var sig = signals[label];
            var energyColor = sig.energy >= 70 ? '#f04452' : (sig.energy >= 40 ? '#ff9500' : '#3182f6');
            html += `<div style="padding:15px; border-radius:12px; background:white; border:1px solid #edf2f7; text-align:center;">
                <div style="font-size:0.7rem; color:#64748b; margin-bottom:5px;">${label}</div>
                <div style="font-size:1.2rem; font-weight:900; color:${energyColor};">${sig.energy}%</div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', function() { AnalysisEngine.init(); });
