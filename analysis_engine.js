'use strict';

/**
 * AI Analysis Engine v2.1 (Stabilized)
 * - Dynamic Section Generation based on LottoConfig
 * - Seamless Chart & Table Integration
 * - Fixed Syntax Error in renderRegressionSignals
 */

var AnalysisEngine = {
    isPension: false,
    statsData: null,

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

    runLottoAnalysis: function(data) {
        var root = document.getElementById('dynamic-analysis-root');
        if (!root) return;
        root.innerHTML = '';

        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.analysis);
        
        indicators.forEach(cfg => {
            var section = document.createElement('section');
            section.className = 'analysis-card';
            section.innerHTML = `
                <div class="card-header"><h3>📍 ${cfg.label} 분석</h3></div>
                <div class="analysis-layout-split" style="padding: 20px;">
                    <div class="chart-wrapper"><div id="${cfg.id}-chart" style="height: 200px;"></div></div>
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
            } else {
                var chartBox = document.getElementById(cfg.id + '-chart');
                if (chartBox) chartBox.innerHTML = '<div style="padding:50px; text-align:center; color:#94a3b8; font-size:0.8rem;">데이터 집계 중입니다...</div>';
            }
            LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);
        });

        if (window.renderOverAppearanceAlert) renderOverAppearanceAlert(data.recent_draws);
        var markovMatrix = LottoAI.calculateEndingChainMatrix(data.recent_draws, 300);
        LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', markovMatrix, { color: '49, 130, 246', rowLabel: '끝수 ' });
        
        if (data.regression_signals) this.renderRegressionSignals('lotto-regression-container', data.regression_signals);
        
        // [NEW] 번호별 전체 빈도 차트 렌더링
        if (data.frequency) this.renderFrequencyChart('full-frequency-chart', data.frequency);
    },

    renderFrequencyChart: function(containerId, freqData) {
        var container = document.getElementById(containerId);
        if (!container || !freqData) return;
        
        var maxFreq = Math.max(...Object.values(freqData));
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
        container.className = 'frequency-chart'; // 스타일 클래스 보장
    },

    runPensionAnalysis: function(data) {
        var root = document.getElementById('dynamic-pension-root');
        if (!root) return;
        root.innerHTML = '';

        var indicators = LottoConfig.PENSION_INDICATORS.filter(cfg => cfg.visible && cfg.visible.analysis);
        
        indicators.forEach(cfg => {
            var section = document.createElement('section');
            section.className = 'analysis-card';
            section.innerHTML = `
                <div class="card-header"><h3>📍 ${cfg.label} 분석</h3></div>
                <div class="analysis-layout-split" style="padding: 20px;">
                    <div class="chart-wrapper"><div id="${cfg.id}-chart" style="height: 200px;"></div></div>
                    <div class="mini-table-wrapper">
                        <h4>📊 최근 ${cfg.label} 리포트</h4>
                        <table class="mini-table"><tbody id="${cfg.id}-mini-body"></tbody></table>
                    </div>
                </div>
            `;
            root.appendChild(section);

            var dist = data.distributions ? data.distributions[cfg.distKey] : null;
            var stat = data.stats_summary ? data.stats_summary[cfg.statKey] : null;
            if (dist && stat) LottoUI.createCurveChart(cfg.id + '-chart', dist, cfg.unit, stat, cfg);
            LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);
        });

        if (window.renderFlowMap) renderFlowMap(data.recent_draws.slice(0, 15));
        if (data.markov_matrix) LottoUI.renderMarkovHeatmap('markov-heatmap-container', data.markov_matrix, { color: '255, 140, 0', rowLabel: '숫자 ' });
        if (data.regression_signals) this.renderRegressionSignals('pension-regression-container', data.regression_signals);
    },

    renderRegressionSignals: function(containerId, signals) {
        var container = document.getElementById(containerId);
        if (!container || !signals) return;
        
        var html = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:10px; padding:10px;">';
        Object.entries(signals).forEach(([key, sig]) => {
            var energyColor = sig.energy > 70 ? '#f04452' : (sig.energy > 40 ? '#ff9500' : '#3182f6');
            html += `<div class="analysis-card" style="padding:12px; text-align:center; border-bottom:3px solid ${energyColor};">
                <div style="font-size:0.7rem; color:#64748b; margin-bottom:5px;">${key} 회귀에너지</div>
                <div style="font-size:1.1rem; font-weight:900; color:${energyColor};">${sig.energy}%</div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => AnalysisEngine.init());
