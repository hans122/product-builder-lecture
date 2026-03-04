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

            // [v9.7] 과출현 위험 번호 감지 및 경고
            renderOverAppearanceAlert(data.recent_draws);

            // [v9.8] 과출현 정밀 분석 표 렌더링
            renderOverAppearanceTable(data.recent_draws);

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

function renderOverAppearanceAlert(recentDraws) {
    var alertBox = document.getElementById('over-appearance-alert');
    if (!alertBox || !recentDraws || recentDraws.length < 10) return;

    var counts5 = {};
    var counts7 = {};
    var counts10 = {};
    var streaks = {};

    // 1. 통계 집계
    for (var i = 0; i < 10; i++) {
        var nums = recentDraws[i].nums;
        for (var j = 0; j < nums.length; j++) {
            var n = nums[j];
            if (i < 5) counts5[n] = (counts5[n] || 0) + 1;
            if (i < 7) counts7[n] = (counts7[n] || 0) + 1;
            counts10[n] = (counts10[n] || 0) + 1;
        }
    }

    // 2. 연속 출현(Streak) 계산
    for (var num = 1; num <= 45; num++) {
        var streak = 0;
        for (var k = 0; k < recentDraws.length; k++) {
            if (recentDraws[k].nums.indexOf(num) !== -1) streak++;
            else break;
        }
        if (streak > 1) streaks[num] = streak;
    }

    var danger = [];  // LEVEL 3 (Streak 5 OR Recent 7>=5 OR Recent 10>=6)
    var warning = []; // LEVEL 2 (Recent 5>=4)
    var caution = []; // LEVEL 1 (Recent 5=3)

    for (var n = 1; n <= 45; n++) {
        if ((streaks[n] >= 5) || (counts7[n] >= 5) || (counts10[n] >= 6)) danger.push(n);
        else if (counts5[n] >= 4) warning.push(n);
        else if (counts5[n] === 3) caution.push(n);
    }

    if (danger.length > 0 || warning.length > 0 || caution.length > 0) {
        alertBox.style.display = 'inline-flex';
        alertBox.style.alignItems = 'center';
        alertBox.style.gap = '10px';
        
        var html = '<span style="font-weight:800; color:#1e293b;">⚠️ 과출현:</span>';
        if (danger.length > 0) html += '<span style="color:#f04452; font-weight:900;">위험(' + danger.join(',') + ')</span>';
        if (warning.length > 0) html += '<span style="color:#ff9500; font-weight:800;">주의(' + warning.join(',') + ')</span>';
        if (caution.length > 0) html += '<span style="color:#3182f6; font-weight:700;">관찰(' + caution.join(',') + ')</span>';
        
        alertBox.innerHTML = html;
    } else {
        alertBox.style.display = 'none';
    }
}

function renderOverAppearanceTable(recentDraws) {
    var tbody = document.getElementById('over-appearance-table-body');
    if (!tbody || !recentDraws) return;
    tbody.innerHTML = '';

    var data = [];
    for (var num = 1; num <= 45; num++) {
        var c5 = 0; var c10 = 0; var streak = 0;
        for (var i = 0; i < 10; i++) {
            if (recentDraws[i] && recentDraws[i].nums.indexOf(num) !== -1) {
                if (i < 5) c5++;
                c10++;
            }
        }
        for (var s = 0; s < recentDraws.length; s++) {
            if (recentDraws[s].nums.indexOf(num) !== -1) streak++;
            else break;
        }

        if (c10 > 0) {
            var grade = "정상";
            var status = "관찰";
            var color = "#64748b";
            
            if (streak >= 5 || c5 >= 4 || c10 >= 6) { grade = "🚨 위험"; status = "배제 권장"; color = "#f04452"; }
            else if (c5 === 3) { grade = "⚠️ 주의"; status = "출현 임계"; color = "#ff9500"; }
            else if (c5 === 2) { grade = "🔍 관찰"; status = "기세 상승"; color = "#3182f6"; }

            data.push({ num: num, grade: grade, streak: streak, c5: c5, c10: c10, status: status, color: color });
        }
    }

    // 위험도 순 정렬 (c5 많은 순, 그 다음 streak 많은 순)
    data.sort(function(a, b) {
        if (b.c5 !== a.c5) return b.c5 - a.c5;
        return b.streak - a.streak;
    });

    for (var j = 0; j < data.length; j++) {
        var row = data[j];
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="pension-ball small" style="margin:0 auto; width:24px; height:24px; font-size:0.8rem;">' + row.num + '</div></td>' +
            '<td style="color:' + row.color + '; font-weight:800;">' + row.grade + '</td>' +
            '<td>' + (row.streak > 0 ? row.streak + '주 연속' : '-') + '</td>' +
            '<td>' + row.c5 + '회</td>' +
            '<td>' + row.c10 + '회</td>' +
            '<td><span class="status-tag" style="background:' + row.color + '11; color:' + row.color + '; border:1px solid ' + row.color + '33;">' + row.status + '</span></td>';
        tbody.appendChild(tr);
    }
}
