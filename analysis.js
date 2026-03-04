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
            
            // [v9.6] 과출현 위험 번호 감지 및 경고
            renderOverAppearanceAlert(data.recent_draws.slice(0, 5));

            // [v9.4] 번호별 흐름 타임라인 렌더링
            renderFlowMap(data.recent_draws.slice(0, 15));
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

function renderFlowMap(recentDraws) {
    var root = document.getElementById('flow-map-root');
    if (!root || !recentDraws || recentDraws.length === 0) return;

    var html = '<table class="flow-table"><thead><tr><th class="num-label">번호</th>';
    for (var i = 0; i < recentDraws.length; i++) {
        html += '<th>' + recentDraws[i].no + '회</th>';
    }
    html += '</tr></thead><tbody>';

    for (var num = 1; num <= 45; num++) {
        html += '<tr><td class="num-label">' + num + '</td>';
        for (var j = 0; j < recentDraws.length; j++) {
            var draw = recentDraws[j];
            var isHit = false;
            for(var k=0; k<draw.nums.length; k++) { if(draw.nums[k] === num) { isHit = true; break; } }
            
            if (isHit) {
                var isCarry = false;
                if (j > 0) {
                    var nextDraw = recentDraws[j-1];
                    for(var c=0; c<nextDraw.nums.length; c++) { if(nextDraw.nums[c] === num) { isCarry = true; break; } }
                }
                var colorClass = LottoUtils.getBallColorClass(num);
                var carryClass = isCarry ? ' carry-over' : '';
                html += '<td><div class="flow-dot ' + colorClass + carryClass + '">' + num + '</div></td>';
            } else {
                html += '<td></td>';
            }
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    root.innerHTML = html;
}

function renderOverAppearanceAlert(recent5) {
    var alertBox = document.getElementById('over-appearance-alert');
    if (!alertBox || !recent5) return;

    var counts = {};
    for (var i = 0; i < recent5.length; i++) {
        var nums = recent5[i].nums;
        for (var j = 0; j < nums.length; j++) {
            counts[nums[j]] = (counts[nums[j]] || 0) + 1;
        }
    }

    var dangerNums = [];
    var warningNums = [];
    for (var num in counts) {
        if (counts[num] >= 4) dangerNums.push(num);
        else if (counts[num] === 3) warningNums.push(num);
    }

    if (dangerNums.length > 0 || warningNums.length > 0) {
        alertBox.style.display = 'inline-block';
        var msg = '⚠️ 과출현 감지: ';
        if (dangerNums.length > 0) msg += '<span style="text-decoration: underline;">위험(' + dangerNums.join(',') + ')</span> ';
        if (warningNums.length > 0) msg += '주의(' + warningNums.join(',') + ')';
        alertBox.innerHTML = msg;
    } else {
        alertBox.style.display = 'none';
    }
}
