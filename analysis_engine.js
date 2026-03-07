'use strict';

/**
 * AI Analysis Engine v3.2 (Mobile-First Layout Edition)
 * - Optimized Grid for diverse screen sizes
 * - Dynamic Group Filtering via Tabs
 * - Regression Energy Dashboard
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

    /** 1. AI 회귀 시점 분석 보드 */
    renderRegressionBoard: function() {
        var container = document.getElementById('lotto-regression-container');
        if (!container || !this.statsData.regression_signals) return;
        this.renderRegressionUI(container, this.statsData.regression_signals);
    },

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

    /** 2. 골든타임 전략 그룹 보드 */
    renderStrategyPools: function() {
        var pools = LottoAI.getComplexPools(this.statsData.recent_draws, -1);
        var renderIn = function(id, nums, countId) {
            var c = document.getElementById(id);
            if(c) {
                c.innerHTML = nums.map(n => `<div class="ball small ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('');
                document.getElementById(countId).innerText = nums.length + '개';
            }
        };
        renderIn('group-hot-container', pools.hot, 'hot-count');
        renderIn('group-warm-container', pools.neutral, 'warm-count');
        renderIn('group-cold-container', pools.cold, 'cold-count');
    },

    /** 3. 지능형 탭 시스템 */
    initDynamicAnalysis: function() {
        var indicators = LottoConfig.INDICATORS.filter(function(c) { return c.visible && c.visible.analysis; });
        this.renderTabs(indicators, 'analysis-tabs', 'dynamic-analysis-root');
        this.filterByGroup('ALL', 'dynamic-analysis-root', indicators);
    },

    initDynamicPensionAnalysis: function() {
        var indicators = LottoConfig.PENSION_INDICATORS.filter(function(c) { return c.visible && c.visible.analysis; });
        this.renderTabs(indicators, 'pension-analysis-tabs', 'dynamic-pension-root');
        this.filterByGroup('ALL', 'dynamic-pension-root', indicators);
    },

    renderTabs: function(indicators, containerId, rootId) {
        var tabContainer = document.getElementById(containerId);
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
                tabContainer.querySelectorAll('.analysis-tab').forEach(function(t){ t.classList.remove('active'); t.style.background='transparent'; t.style.color='#94a3b8'; });
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
        var root = document.getElementById(rootId);
        if (!root) return;
        root.innerHTML = '';
        var filtered = indicatorsSet.filter(function(c) { return groupId === 'ALL' || c.group === groupId; });
        var self = this;
        var index = 0;
        function renderNext() {
            if (index >= filtered.length) return;
            self.renderIndicatorCard(root, filtered[index]);
            index++;
            setTimeout(renderNext, 20);
        }
        renderNext();
    },

    renderIndicatorCard: function(root, cfg) {
        var section = document.createElement('div');
        section.className = 'analysis-card-group';
        section.style.marginBottom = '30px';
        
        var header = document.createElement('div');
        header.className = 'group-header';
        header.style.cssText = 'font-size: 0.95rem; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid var(--primary-blue); padding-left: 12px;';
        header.innerText = cfg.label + ' 분석';
        
        var card = document.createElement('section');
        card.className = 'analysis-card stats-grid-layout';
        
        var chartSide = document.createElement('div');
        chartSide.className = 'chart-side';
        var chartId = 'chart-' + cfg.id;
        chartSide.innerHTML = `<div id="${chartId}" class="chart-wrapper"></div>` +
            `<div class="chart-tip">💡 <b>전문가 가이드:</b> ${(LottoConfig.LOTTO_TIPS[cfg.id] || LottoConfig.PENSION_TIPS[cfg.id] || '분석 정보를 확인 중입니다.').replace('{safe}', '골든 존')}</div>`;
        
        var tableSide = document.createElement('div');
        tableSide.className = 'table-side';
        var tableId = 'table-' + cfg.id;
        tableSide.innerHTML = `<table class="mini-stats-table"><thead><tr><th>회차</th><th>번호</th><th>${cfg.unit || '값'}</th></tr></thead><tbody id="${tableId}"></tbody></table>`;
        
        card.appendChild(chartSide);
        card.appendChild(tableSide);
        section.appendChild(header);
        section.appendChild(card);
        root.appendChild(section);

        LottoUI.createCurveChart(chartId, this.statsData.distributions[cfg.distKey], cfg.unit, this.statsData.stats_summary[cfg.statKey], cfg);
        LottoUI.renderMiniTable(tableId, this.statsData.recent_draws.slice(0, 6), cfg);
    },

    renderFrequencyChart: function() {
        var container = document.getElementById('full-frequency-chart');
        if (!container || !this.statsData.frequency) return;
        var freq = this.statsData.frequency;
        var max = Math.max(...Object.values(freq));
        var html = '<div class="freq-bar-container" style="display:flex; align-items:flex-end; gap:2px; height:150px; padding:20px 0;">';
        for (var i = 1; i <= 45; i++) {
            var val = freq[i] || 0;
            var h = (val / max) * 100;
            html += `<div class="freq-bar ${LottoUtils.getBallColorClass(i)}" style="flex:1; height:${h}%; border-radius:2px 2px 0 0; position:relative;" title="${i}번: ${val}회">` +
                `<span style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); font-size:0.5rem; font-weight:700;">${i}</span></div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    renderMarkovBoard: function() {
        var container = document.getElementById('lotto-markov-heatmap');
        if (!container || !this.statsData.markov_ending_matrix) return;
        LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', this.statsData.markov_ending_matrix, { rowLabel: '끝수 ', color: '240, 68, 82' });
    }
};

document.addEventListener('DOMContentLoaded', () => AnalysisEngine.init());
