'use strict';

/**
 * AI Analysis Engine v3.1 (Intelligent Tab Edition)
 * - Dynamic Group Filtering via Tabs
 * - Chunked Rendering for Performance
 * - Regression Energy Visualization
 */

var AnalysisEngine = {
    statsData: null,

    init: function() {
        var self = this;
        var isPension = document.getElementById('dynamic-pension-root') !== null;
        
        if (isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) {
                    self.statsData = data;
                    self.renderPensionRegression();
                    self.initDynamicPensionAnalysis();
                    // 추가 연금 전용 차트들...
                }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) {
                    self.statsData = data;
                    self.renderRegressionBoard();
                    self.renderStrategyPools();
                    self.initDynamicAnalysis();
                    self.renderFrequencyChart();
                    self.renderMarkovBoard();
                }
            });
        }
    },

    /** 1-P. 연금 회귀 시점 분석 보드 */
    renderPensionRegression: function() {
        var container = document.getElementById('pension-regression-container');
        if (!container || !this.statsData.regression_signals) return;
        this.renderRegressionUI(container, this.statsData.regression_signals);
    },

    renderRegressionUI: function(container, signals) {
        var html = '<div class="regression-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:12px;">';
        for (var label in signals) {
            var s = signals[label];
            var color = s.energy >= 90 ? '#f04452' : (s.energy >= 60 ? '#ff9500' : '#3182f6');
            html += `
                <div class="reg-item" style="background:white; padding:15px; border-radius:16px; border:1px solid #f1f5f9; text-align:center;">
                    <div style="font-size:0.7rem; color:#8b95a1; font-weight:700; margin-bottom:8px;">${label}</div>
                    <div style="position:relative; width:60px; height:60px; margin:0 auto;">
                        <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" stroke-width="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${s.energy}, 100" stroke-linecap="round" />
                        </svg>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:0.8rem; font-weight:900; color:#191f28;">${s.energy}%</div>
                    </div>
                    <div style="font-size:0.6rem; color:${color}; font-weight:800; margin-top:8px;">${s.energy >= 90 ? '출현 임박' : (s.energy >= 60 ? '에너지 상승' : '안정 상태')}</div>
                </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    /** 3-P. [v32.18] 연금 지능형 탭 시스템 및 동적 지표 분석 */
    initDynamicPensionAnalysis: function() {
        var root = document.getElementById('dynamic-pension-root');
        if (!root) return;
        var indicators = LottoConfig.PENSION_INDICATORS.filter(function(c) { return c.visible && c.visible.analysis; });
        this.renderTabs(indicators, 'pension-analysis-tabs', 'dynamic-pension-root');
        this.filterByGroup('ALL', 'dynamic-pension-root', indicators);
    },

    renderTabs: function(indicators, containerId, rootId) {
        var tabContainer = document.getElementById(containerId || 'analysis-tabs');
        if (!tabContainer) return;
        
        var self = this;
        var uniqueGroups = ['ALL'];
        indicators.forEach(function(c) { if (uniqueGroups.indexOf(c.group) === -1) uniqueGroups.push(c.group); });
        
        tabContainer.innerHTML = uniqueGroups.map(function(gid) {
            var label = gid === 'ALL' ? '전체 보기' : (LottoConfig.GROUP_NAMES[gid] || gid);
            label = label.split(' ')[0].replace('분석', '');
            return `<div class="analysis-tab ${gid==='ALL'?'active':''}" data-group="${gid}" style="flex:0 0 auto; padding:8px 16px; font-size:0.85rem; font-weight:700; border-radius:10px; cursor:pointer; white-space:nowrap; transition:all 0.2s;">${label}</div>`;
        }).join('');

        tabContainer.querySelectorAll('.analysis-tab').forEach(function(tab) {
            tab.onclick = function() {
                tabContainer.querySelectorAll('.analysis-tab').forEach(function(t){ 
                    t.classList.remove('active'); t.style.background='transparent'; t.style.color='#94a3b8'; 
                });
                tab.classList.add('active');
                tab.style.background = '#f0f7ff';
                tab.style.color = 'var(--primary-blue)';
                self.filterByGroup(tab.dataset.group, rootId, indicators);
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            };
            if (tab.classList.contains('active')) { tab.style.background = '#f0f7ff'; tab.style.color = 'var(--primary-blue)'; }
        });
    },

    filterByGroup: function(groupId, rootId, indicatorsSet) {
        var root = document.getElementById(rootId || 'dynamic-analysis-root');
        if (!root) return;
        root.innerHTML = '';
        
        var indicators = (indicatorsSet || LottoConfig.INDICATORS).filter(function(c) { 
            return c.visible && c.visible.analysis && (groupId === 'ALL' || c.group === groupId); 
        });

        var self = this;
        var index = 0;
        function renderNext() {
            if (index >= indicators.length) return;
            var cfg = indicators[index];
            self.renderIndicatorCard(root, cfg);
            index++;
            setTimeout(renderNext, 20);
        }
        renderNext();
    },

    /** 4. 번호별 전체 빈도 차트 */
    renderFrequencyChart: function() {
        var container = document.getElementById('full-frequency-chart');
        if (!container || !this.statsData.frequency) return;
        
        var freq = this.statsData.frequency;
        var max = Math.max(...Object.values(freq));
        
        var html = '<div class="freq-bar-container" style="display:flex; align-items:flex-end; gap:2px; height:150px; padding:20px 0;">';
        for (var i = 1; i <= 45; i++) {
            var val = freq[i] || 0;
            var height = (val / max) * 100;
            html += `<div class="freq-bar ${LottoUtils.getBallColorClass(i)}" style="flex:1; height:${height}%; border-radius:2px 2px 0 0; position:relative;" title="${i}번: ${val}회">` +
                `<span style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); font-size:0.5rem; font-weight:700;">${i}</span></div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    /** 5. AI 마르코프 전이 확률 보드 */
    renderMarkovBoard: function() {
        var container = document.getElementById('lotto-markov-heatmap');
        if (!container || !this.statsData.markov_ending_matrix) return;
        LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', this.statsData.markov_ending_matrix, { rowLabel: '끝수 ', color: '240, 68, 82' });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    AnalysisEngine.init();
});
