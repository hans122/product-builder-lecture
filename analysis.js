/**
 * Statistical Analysis Page v7.0 - Immortal Guardian (ES5 Stable & Strategy Groups)
 */

var globalStatsData = null;

function restoreMyNumbers() {
    var section = document.getElementById('my-numbers-section');
    var list = document.getElementById('my-numbers-list');
    if (!section || !list) return;
    var saved = localStorage.getItem('lastGeneratedNumbers');
    if (!saved) { section.style.display = 'none'; return; }
    try {
        var nums = JSON.parse(saved);
        if (Array.isArray(nums) && nums.length === 6) {
            section.style.display = 'flex';
            list.innerHTML = '';
            var sorted = [].concat(nums).sort(function(a, b) { return a - b; });
            for (var i = 0; i < sorted.length; i++) {
                list.appendChild(LottoUI.createBall(sorted[i], true));
            }
        } else { section.style.display = 'none'; }
    } catch (e) { section.style.display = 'none'; }
}

function renderStrategyGroup(containerId, nums, countId) {
    var container = document.getElementById(containerId);
    var countEl = document.getElementById(countId);
    if (!container) return;
    container.innerHTML = '';
    if (countEl) countEl.innerText = nums.length + '개';
    
    for (var i = 0; i < nums.length; i++) {
        container.appendChild(LottoUI.createBall(nums[i], true));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    restoreMyNumbers();
    
    LottoDataManager.getStats(function(data) {
        if (!data) return;
        globalStatsData = data;

        // 1. [STRATEGY] 15회차 골든타임 그룹 렌더링
        if (data.recent_draws) {
            var groups = LottoUtils.getStrategyGroups(data.recent_draws);
            renderStrategyGroup('group-hot-container', groups.hot, 'hot-count');
            renderStrategyGroup('group-warm-container', groups.warm, 'warm-count');
            renderStrategyGroup('group-cold-container', groups.cold, 'cold-count');
        }

        // 2. 설정 기반 차트 및 미니 표 자동 렌더링
        var dists = data.distributions || {};
        var stats = data.stats_summary || {};
        var saved = localStorage.getItem('lastGeneratedNumbers');
        var myNums = null;
        try { if(saved) myNums = JSON.parse(saved); } catch(e){}

        var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i];
            
            // 차트 렌더링
            if (dists[cfg.distKey]) {
                var myVal = null;
                if (myNums && cfg.calc) {
                    var sortedMyNums = [].concat(myNums).sort(function(a, b) { return a - b; });
                    myVal = cfg.calc(sortedMyNums, data);
                }
                LottoUI.createCurveChart(cfg.id + '-chart', dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg, myVal);
            }
            
            // 미니 표 렌더링
            if (data.recent_draws) {
                LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);
            }
        }

        if (data.frequency) renderFrequencyChart(data.frequency);
    });
});

function renderFrequencyChart(data) {
    var container = document.getElementById('full-frequency-chart');
    if (!container) return;
    container.innerHTML = '';
    
    var maxFreq = 1;
    for (var i = 1; i <= 45; i++) { if (data[i] > maxFreq) maxFreq = data[i]; }
    
    for (var j = 1; j <= 45; j++) {
        var f = data[j] || 0;
        var h = (f / maxFreq) * 85;
        var wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';
        
        var bar = document.createElement('div');
        bar.className = 'bar ' + LottoUtils.getBallColorClass(j);
        bar.style.height = h + '%';
        
        var value = document.createElement('span');
        value.className = 'bar-value';
        value.innerText = f;
        
        var label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = j;
        
        bar.appendChild(value);
        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    }
}
