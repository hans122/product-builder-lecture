/**
 * AI Analysis Engine v1.4 (Regression Timing Integration)
 * - Optimized Data Loading from JSON
 * - Full AI Regression Streak Analysis
 * - Version 11.2 Standard
 */

var AnalysisEngine = {
    isPension: false,
    
    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        this.restoreMyNumbers();
        
        var self = this;
        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) self.runPensionAnalysis(data);
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) self.runLottoAnalysis(data);
            });
        }
    },

    restoreMyNumbers: function() {
        var section = document.getElementById('my-numbers-section');
        var list = document.getElementById('my-numbers-list');
        if (!section || !list) return;
        var saved = localStorage.getItem('lastGeneratedNumbers');
        if (!saved) { section.style.display = 'none'; return; }
        try {
            var nums = JSON.parse(saved);
            if (Array.isArray(nums)) {
                section.style.display = 'flex';
                list.innerHTML = '';
                var sorted = [].concat(nums).sort(function(a, b) { return a - b; });
                for (var i = 0; i < sorted.length; i++) {
                    list.appendChild(LottoUI.createBall(sorted[i], true));
                }
            }
        } catch (e) { section.style.display = 'none'; }
    },

    runLottoAnalysis: function(data) {
        // [AI] 회귀 시점 분석
        if (data.regression_signals) {
            this.renderRegressionSignals('lotto-regression-container', data.regression_signals);
        }

        if (data.recent_draws) {
            var groups = LottoUtils.getStrategyGroups(data.recent_draws);
            this.renderStrategyGroup('group-hot-container', groups.hot, 'hot-count');
            this.renderStrategyGroup('group-warm-container', groups.warm, 'warm-count');
            this.renderStrategyGroup('group-cold-container', groups.cold, 'cold-count');
            if (window.renderOverAppearanceAlert) renderOverAppearanceAlert(data.recent_draws);
            if (window.renderOverAppearanceTable) renderOverAppearanceTable(data.recent_draws);
            if (window.renderFlowMap) renderFlowMap(data.recent_draws.slice(0, 15));
        }

        var dists = data.distributions || {};
        var stats = data.stats_summary || {};
        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.group && cfg.group.indexOf('GL') === 0);
        
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i];
            // ID 규칙: {id}-chart, {id}-mini-body
            var chartId = cfg.id + '-chart';
            var tableBodyId = cfg.id + '-mini-body';
            
            if (dists[cfg.distKey]) {
                try {
                    LottoUI.createCurveChart(chartId, dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg);
                } catch(e) { console.warn('Chart Error:', chartId, e); }
            }
            
            if (data.recent_draws) {
                var tbody = document.getElementById(tableBodyId);
                if (tbody) LottoUI.renderMiniTable(tableBodyId, data.recent_draws.slice(0, 6), cfg);
            }
        }

        if (data.frequency && window.renderFrequencyChart) renderFrequencyChart(data.frequency);
        if (data.markov_ending_matrix) {
            LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', data.markov_ending_matrix, { rowLabel: '끝수' });
            this.renderMarkovInsights('lotto-markov-insights', data.markov_ending_matrix, '끝수');
        }
    },

    runPensionAnalysis: function(data) {
        // [AI] 회귀 시점 분석
        if (data.regression_signals) {
            this.renderRegressionSignals('pension-regression-container', data.regression_signals);
        }

        // [GP9] 자리수 빈도 및 [GP6] 미출현 주기
        if (window.renderPositionFreq) renderPositionFreq(data.pos_freq);
        if (window.renderReverseGapChart) renderReverseGapChart('digit-gap-container', data.digit_gap);
        
        // [GP13] 흐름 타임라인
        if (window.renderFlowTimeline) renderFlowTimeline(data.recent_draws.slice(0, 15));
        
        // [GP9] 마르코프 분석
        LottoUI.renderMarkovHeatmap('markov-heatmap-container', data.markov_matrix, { color: '255, 140, 0', rowLabel: '숫자' });
        this.renderMarkovInsights('markov-top-insights', data.markov_matrix, '숫자');

        this.renderPensionAdvancedCharts(data.recent_draws);
    },

    renderPensionAdvancedCharts: function(recentDraws) {
        var recent5 = recentDraws.slice(0, 5);
        var process = function(id, calcFn) {
            var chartBox = document.getElementById(id + '-dist-chart');
            var tableBox = document.getElementById(id + '-mini-body');
            if (!chartBox) return;
            var dist = {}; var vals = [];
            recentDraws.forEach(d => {
                var v = calcFn(d.nums); dist[v] = (dist[v] || 0) + 1; vals.push(v);
            });
            var mean = vals.reduce((a,b)=>a+b,0)/vals.length;
            var std = Math.sqrt(vals.map(x => Math.pow(x-mean,2)).reduce((a,b)=>a+b,0)/vals.length);
            LottoUI.createCurveChart(id + '-dist-chart', dist, '', { mean: mean, std: std });
            if (tableBox) {
                tableBox.innerHTML = recent5.map(d => {
                    var v = calcFn(d.nums);
                    var balls = d.nums.map(n => `<div class="pension-ball small" style="width:22px; height:22px; font-size:0.8rem; background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800;">${n}</div>`).join('');
                    return `<tr><td>${d.no}회</td><td><div style="display:flex;gap:2px;">${balls}</div></td><td><strong>${v}</strong></td></tr>`;
                }).join('');
            }
        };
        process('sequence', (nums) => PensionUtils.analyzePatterns(nums).seq);
        process('repeat', (nums) => PensionUtils.analyzePatterns(nums).adjRep);
        process('occurrence', (nums) => PensionUtils.analyzePatterns(nums).maxOccur);
        process('unique', (nums) => PensionUtils.analyzePatterns(nums).unique);
        process('sum', (nums) => PensionUtils.analyzeBalance(nums).sum);
        process('odd', (nums) => PensionUtils.analyzeBalance(nums).odd);
        process('low', (nums) => PensionUtils.analyzeBalance(nums).low);
        process('prime', (nums) => PensionUtils.analyzeBalance(nums).prime);
        this.renderPensionDynamics(recentDraws);
    },

    renderPensionDynamics: function(draws) {
        var ids = ['carry-pos', 'carry-num', 'neighbor'];
        ids.forEach(id => {
            var tableBox = document.getElementById(id + '-mini-body');
            if (tableBox) {
                tableBox.innerHTML = draws.slice(0, 5).map((d, i) => {
                    var prev = draws[i+1];
                    var dyn = PensionUtils.analyzeDynamics(d.nums, prev ? prev.nums : null);
                    var val = (id === 'carry-pos') ? dyn.carry : (id === 'carry-num' ? dyn.carryGlobal : dyn.neighbor);
                    var balls = d.nums.map(n => `<div class="pension-ball small" style="width:22px; height:22px; font-size:0.8rem; background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800;">${n}</div>`).join('');
                    return `<tr><td>${d.no}회</td><td><div style="display:flex;gap:2px;">${balls}</div></td><td><strong>${val}</strong></td></tr>`;
                }).join('');
            }
        });
    },

    renderStrategyGroup: function(containerId, nums, countId) {
        var container = document.getElementById(containerId); if (!container) return;
        container.innerHTML = '';
        if (document.getElementById(countId)) document.getElementById(countId).innerText = nums.length + '개';
        for (var i = 0; i < nums.length; i++) container.appendChild(LottoUI.createBall(nums[i], true));
    },

    renderMarkovInsights: function(containerId, matrix, label) {
        var container = document.getElementById(containerId); if (!container) return;
        var topProb = [];
        for (var r = 0; r < 10; r++) {
            var rSum = matrix[r].reduce((a, b) => a + b, 0); if (rSum === 0) continue;
            for(var c=0; c<10; c++) topProb.push({ from: r, to: c, prob: Math.round((matrix[r][c] / rSum) * 100) });
        }
        topProb.sort((a, b) => b.prob - a.prob);
        var html = '<h4 style="font-size:0.85rem; margin-bottom:12px;">💡 AI 분석: 유력 ' + label + ' 전이 흐름</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">';
        for (var s = 0; s < 3; s++) {
            html += '<div style="padding:12px; background:#fff4e6; border-radius:8px; border-left:4px solid #ff8c00;"><span style="font-size:0.7rem; color:#e67700; display:block; margin-bottom:4px;">최고 확률 전이 #' + (s+1) + '</span><span style="font-size:0.95rem; font-weight:800;">' + label + ' ' + topProb[s].from + ' → ' + topProb[s].to + '</span><span style="font-size:0.8rem; font-weight:700; margin-left:8px; color:#ff8c00;">' + topProb[s].prob + '%</span></div>';
        }
        html += '</div>'; container.innerHTML = html;
    },

    renderRegressionSignals: function(containerId, signals) {
        var container = document.getElementById(containerId); if (!container) return;
        var sorted = [];
        for (var k in signals) {
            var s = signals[k]; if (s.streak > 0) sorted.push({ id: k, streak: s.streak, energy: s.energy });
        }
        sorted.sort((a,b) => b.energy - a.energy);
        if (sorted.length === 0) {
            container.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8; font-size:0.8rem;">모든 지표가 현재 안정 범위(Safe Zone) 내에 있습니다.</div>';
            return;
        }
        var html = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">';
        sorted.slice(0, 4).forEach(s => {
            var label = s.id;
            LottoConfig.INDICATORS.forEach(cfg => { if(cfg.statKey === s.id || cfg.id === s.id) label = cfg.label; });
            var color = s.energy >= 75 ? '#f04452' : (s.energy >= 50 ? '#ff9500' : '#3182f6');
            html += `<div class="analysis-card" style="margin-bottom:0; padding:15px; border-left:4px solid ${color};">
                    <div style="font-size:0.7rem; color:#64748b; margin-bottom:5px; font-weight:800;">회귀 에너지: ${s.energy}%</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:1rem; font-weight:900; color:#1e293b;">${label}</span>
                        <span style="font-size:0.8rem; font-weight:800; color:${color};">${s.streak}주 이탈</span>
                    </div>
                    <div style="margin-top:10px; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;"><div style="width:${s.energy}%; height:100%; background:${color};"></div></div>
                    </div>`;
        });
        html += '</div>'; container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', function() { AnalysisEngine.init(); });

// --- Helper UI Functions ---
function renderFrequencyChart(data) {
    var container = document.getElementById('full-frequency-chart'); if (!container) return;
    container.innerHTML = ''; var maxFreq = Math.max(...Object.values(data));
    for (var j = 1; j <= 45; j++) {
        var f = data[j] || 0, h = (f / maxFreq) * 85;
        var wrapper = document.createElement('div'); wrapper.className = 'bar-wrapper';
        wrapper.innerHTML = `<div class="bar ${LottoUtils.getBallColorClass(j)}" style="height:${h}%;"><span class="bar-value">${f}</span></div><span class="bar-label">${j}</span>`;
        container.appendChild(wrapper);
    }
}

function renderFlowMap(recent) {
    var root = document.getElementById('flow-map-root'); if (!root) return;
    var html = '<table class="flow-table"><thead><tr><th class="num-label">번호</th>';
    recent.forEach(d => html += '<th>' + d.no + '회</th>'); html += '</tr></thead><tbody>';
    for (var n = 1; n <= 45; n++) {
        html += '<tr><td class="num-label">' + n + '</td>';
        recent.forEach((d, i) => {
            var hit = d.nums.includes(n);
            if (hit) {
                var carry = i > 0 && recent[i-1].nums.includes(n);
                html += `<td><div class="flow-dot ${LottoUtils.getBallColorClass(n)} ${carry?'carry-over':''}">${n}</div></td>`;
            } else html += '<td></td>';
        });
        html += '</tr>';
    }
    html += '</tbody></table>'; root.innerHTML = html;
}

function renderPositionFreq(posFreq) {
    const container = document.getElementById('pos-freq-container'); if (!container) return; container.innerHTML = '';
    const labels = ['일의 자리', '십의 자리', '백의 자리', '천의 자리', '만의 자리', '십만의 자리'];
    posFreq.forEach((freq, i) => {
        let maxF = Math.max(...freq); const card = document.createElement('div'); card.className = 'analysis-card'; card.style.margin = '0';
        let rows = ''; freq.forEach((f, num) => {
            rows += `<div style="display:flex; align-items:center; gap:8px;"><span style="width:12px; font-size:0.75rem;">${num}</span><div style="flex:1; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;"><div style="width:${(f/maxF)*100}%; height:100%; background:${f===maxF?'#3182f6':'#cbd5e1'};"></div></div><span style="width:18px; text-align:right; font-size:0.6rem;">${f}</span></div>`;
        });
        card.innerHTML = `<div class="card-header" style="padding:10px 15px;"><h3 style="font-size:0.85rem;">${labels[i]}</h3></div><div style="padding:12px; display:flex; flex-direction:column; gap:4px;">${rows}</div>`;
        container.appendChild(card);
    });
}

function renderReverseGapChart(id, gap) {
    var container = document.getElementById(id); if (!container) return;
    var html = '<div class="gap-chart-grid" style="display:grid; grid-template-columns: repeat(11, 1fr); gap: 2px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
    html += '<div style="background:#f1f5f9; font-size:0.6rem; font-weight:900; display:flex; align-items:center; justify-content:center; color:#475569;">단위</div>';
    for (var h = 0; h < 10; h++) html += '<div style="text-align:center; font-size:0.6rem; background:#f1f5f9; padding:8px 0; color:#475569;">' + h + '</div>';
    ['일', '십', '백', '천', '만', '십만'].forEach((l, i) => {
        html += `<div style="font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-right: 1px solid #e2e8f0; color:#64748b;">${l}</div>`;
        gap[i].forEach(g => {
            var c = g > 20 ? '#f04452' : (g > 10 ? '#ff9500' : (g === 0 ? '#3182f6' : '#94a3b8'));
            html += `<div style="text-align:center; padding:10px 0; font-size:0.75rem; font-weight:900; color:white; background:${c}; opacity:${g===0?1:Math.min(0.8, 0.2+(g/40))}">${g}</div>`;
        });
    });
    html += '</div>'; container.innerHTML = html;
}

function renderFlowTimeline(recent) {
    var container = document.getElementById('flow-timeline-container'); if (!container) return;
    var html = '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; min-width:600px;"><thead><tr style="background:#f1f5f9;"><th style="padding:10px; font-size:0.75rem;">회차</th><th style="padding:10px; font-size:0.75rem;">조</th><th style="color:#3182f6;">일</th><th>십</th><th>백</th><th>천</th><th>만</th><th>십만</th></tr></thead><tbody>';
    recent.forEach((d, i) => {
        var prev = recent[i+1];
        html += `<tr style="border-bottom:1px solid #f1f5f9; ${i===0?'background:#f0f7ff;':''}">`;
        html += `<td style="padding:12px; text-align:center; font-size:0.75rem; font-weight:700;">${d.no}회</td><td style="padding:12px; text-align:center;"><div class="ball mini yellow" style="width:24px; height:24px;">${d.group}</div></td>`;
        [5,4,3,2,1,0].forEach(p => {
            var v = d.nums[p], carry = prev && v === prev.nums[p];
            html += `<td style="padding:8px; text-align:center;"><div style="width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:800; border:${carry?'2px solid #3182f6':'1px solid #e2e8f0'}; background:${carry?'#f0f7ff':'white'}; color:${carry?'#3182f6':'#475569'}; margin:0 auto;">${v}</div></td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>'; container.innerHTML = html;
}
