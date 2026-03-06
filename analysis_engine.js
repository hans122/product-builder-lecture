/**
 * AI Analysis Engine v1.1 (Optimized Data Loading)
 * - Uses pre-calculated JSON from Python for both Lotto & Pension
 * - Unified Visualization Interface
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
        var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i];
            if (dists[cfg.distKey]) LottoUI.createCurveChart(cfg.id + '-chart', dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg);
            if (data.recent_draws) LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);
        }

        if (data.frequency && window.renderFrequencyChart) renderFrequencyChart(data.frequency);
        if (data.markov_ending_matrix) {
            LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', data.markov_ending_matrix, { rowLabel: '끝수' });
            this.renderMarkovInsights('lotto-markov-insights', data.markov_ending_matrix, '끝수');
        }
    },

    runPensionAnalysis: function(data) {
        // [Optimized] Python에서 미리 계산된 데이터 사용
        if (window.renderPositionFreq) renderPositionFreq(data.pos_freq);
        if (window.renderReverseGapChart) renderReverseGapChart('p-digit-gap', data.digit_gap);
        if (window.renderFlowTimeline) renderFlowTimeline(data.recent_draws.slice(0, 15));
        
        LottoUI.renderMarkovHeatmap('markov-heatmap-container', data.markov_matrix, { color: '255, 140, 0', rowLabel: '숫자' });
        this.renderMarkovInsights('markov-top-insights', data.markov_matrix, '숫자');
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
        wrapper.innerHTML = '<div class="bar ' + LottoUtils.getBallColorClass(j) + '" style="height:' + h + '%;"><span class="bar-value">' + f + '</span></div><span class="bar-label">' + j + '</span>';
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
                html += '<td><div class="flow-dot ' + LottoUtils.getBallColorClass(n) + (carry?' carry-over':'') + '">' + n + '</div></td>';
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
    html += '<div style="background:#f1f5f9; font-size:0.6rem; font-weight:900; display:flex; align-items:center; justify-content:center;">단위</div>';
    for (var h = 0; h < 10; h++) html += '<div style="text-align:center; font-size:0.6rem; background:#f1f5f9; padding:8px 0;">' + h + '</div>';
    ['일', '십', '백', '천', '만', '십만'].forEach((l, i) => {
        html += '<div style="font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-right: 1px solid #e2e8f0;">' + l + '</div>';
        gap[i].forEach(g => {
            var c = g > 20 ? '#f04452' : (g > 10 ? '#ff9500' : (g === 0 ? '#3182f6' : '#94a3b8'));
            html += '<div style="text-align:center; padding:10px 0; font-size:0.75rem; font-weight:900; color:white; background:' + c + '; opacity:' + (g===0?1:Math.min(0.8, 0.2+(g/40))) + '">' + g + '</div>';
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
