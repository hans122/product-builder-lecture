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
        var signalIds = [];
        
        for (var label in signals) {
            var s = signals[label];
            var sigId = 'reg-' + Math.random().toString(36).substr(2, 9);
            signalIds.push({ id: sigId, label: label, data: s });
            
            var color = s.energy >= 90 ? '#f04452' : (s.energy >= 60 ? '#ff9500' : '#3182f6');
            html += `
                <div id="${sigId}" class="reg-item" style="background:white; padding:15px; border-radius:16px; border:1px solid #f1f5f9; text-align:center; cursor:help;">
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

        // v32.47 툴팁 연결
        setTimeout(() => {
            signalIds.forEach(item => {
                var el = document.getElementById(item.id);
                if (el) {
                    var statusDesc = item.data.energy >= 90 ? '통계적으로 현재 매우 임계점에 도달해 있어 조만간 평균으로 회귀(출현)할 가능성이 매우 높습니다.' : (item.data.energy >= 60 ? '최근 흐름이 평균 범위를 벗어나기 시작하며 에너지가 축적되고 있습니다.' : '현재 통계적 평균 범위 내에서 안정적으로 움직이고 있습니다.');
                    var fullTip = `<strong>${item.label} 회귀 분석</strong><br>${item.data.streak}회차 연속 임계 이탈 중<br><br>${statusDesc}`;
                    LottoUI.Feedback.tooltip(el, fullTip);
                }
            });
        }, 100);
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
        header.style.cssText = 'font-size: 0.95rem; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid var(--primary-blue); padding-left: 12px; display:flex; align-items:center; gap:6px;';
        header.innerHTML = `${cfg.label} 분석 <span class="tooltip-icon" style="font-size:0.7rem; color:#94a3b8; border:1px solid #e2e8f0; width:14px; height:14px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-weight:bold;">?</span>`;
        
        LottoUI.Feedback.tooltip(header, (LottoConfig.LOTTO_TIPS[cfg.id] || LottoConfig.PENSION_TIPS[cfg.id] || '통계적 분석을 수행합니다.').replace('{safe}', '적정 범위'));
        
        var card = document.createElement('section');
        card.className = 'analysis-card stats-grid-layout';
        
        var chartSide = document.createElement('div');
        chartSide.className = 'chart-side';
        var chartId = 'chart-' + cfg.id;
        chartSide.innerHTML = `<div id="${chartId}" class="chart-wrapper"></div>`;
        
        var tableSide = document.createElement('div');
        tableSide.className = 'table-side';
        var tableId = 'table-' + cfg.id;
        tableSide.innerHTML = `<table class="mini-stats-table"><thead><tr><th>회차</th><th>번호</th><th>${cfg.unit || '값'}</th></tr></thead><tbody id="${tableId}"></tbody></table>`;
        
        card.appendChild(chartSide);
        card.appendChild(tableSide);
        section.appendChild(header);
        section.appendChild(card);
        root.appendChild(section);

        var dists = this.statsData.distributions || {};
        var stats = this.statsData.stats_summary || {};
        var recent = this.statsData.recent_draws || [];

        if (dists[cfg.distKey] && stats[cfg.statKey]) {
            // [v33.03] 1행 데이터와 차트 빨간 선의 값을 완벽히 일치시킴
            var currentVal = null;
            if (recent.length > 0) {
                // 첫 번째 행(최신 회차)의 실제 이월수 등 계산
                var targetDraw = recent[0];
                var ctx = { 
                    recent_draws: recent.slice(1), 
                    last_3_draws: recent.slice(1, 4).map(d => d.nums) 
                };
                currentVal = cfg.calc(targetDraw.nums, ctx);
            }
            LottoUI.Chart.curve(chartId, dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg, currentVal);
        }
        
        if (recent.length > 0) {
            // [v33.03] 표의 각 행별로 정확한 상대적 값 계산 로직 적용
            var tbody = document.getElementById(tableId);
            if (tbody) {
                tbody.innerHTML = recent.slice(0, 6).map((d, idx) => {
                    // 각 행(d)의 입장에서 '과거' 데이터셋 구성
                    var rowCtx = {
                        recent_draws: recent.slice(idx + 1),
                        last_3_draws: recent.slice(idx + 1, idx + 4).map(rd => rd.nums)
                    };
                    var val = cfg.calc(d.nums, rowCtx);
                    var balls = d.nums.map(n => `<div class="ball mini ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('');
                    return `<tr><td>${d.no}회</td><td><div class="ball-container mini">${balls}</div></td><td><strong>${val}</strong></td></tr>`;
                }).join('');
            }
        }
    },

    renderFrequencyChart: function() {
        var container = document.getElementById('full-frequency-chart');
        if (!container || !this.statsData.frequency) return;
        var freq = this.statsData.frequency;
        var freqValues = [];
        for (var k in freq) freqValues.push(freq[k]);
        var max = Math.max.apply(null, freqValues);
        
        var html = '<div class="freq-bar-container" style="display:flex; align-items:flex-end; gap:3px; height:180px; padding:30px 10px 10px 10px; background:#f8fafc; border-radius:12px; border:1px solid #edf2f7;">';
        for (var i = 1; i <= 45; i++) {
            var val = freq[i] || 0;
            var h = (val / (max || 1)) * 100;
            // [v33.05] validator 호환성을 위해 .bar 클래스 추가 및 시각적 고도화
            html += `<div class="freq-bar bar ${LottoUtils.getBallColorClass(i)}" style="flex:1; height:${h}%; border-radius:3px 3px 0 0; position:relative; min-width:4px;" title="${i}번: ${val}회">` +
                `<span style="position:absolute; top:-18px; left:50%; transform:translateX(-50%) rotate(-45deg); font-size:0.55rem; font-weight:900; color:#64748b;">${i}</span></div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    renderMarkovBoard: function() {
        var container = document.getElementById('lotto-markov-heatmap');
        if (!container || !this.statsData.markov_ending_matrix) return;
        // [v32.82] 새로운 마르코프 표준 적용
        LottoUI.Chart.markov('lotto-markov-heatmap', this.statsData.markov_ending_matrix, { rowLabel: '끝수 ', color: '240, 68, 82' });
    }
};

document.addEventListener('DOMContentLoaded', () => AnalysisEngine.init());
