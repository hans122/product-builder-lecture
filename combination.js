/**
 * My Combination Analysis v7.0 - Immortal Guardian (ES5 Stable & Over-appearance Integration)
 */

var combinationStatsData = null;
var manualNumbers = new Set ? new Set() : { // Set 폴리필 간이 구현 (구형 환경 대응)
    data: [],
    add: function(v){ if(!this.has(v)) this.data.push(v); },
    delete: function(v){ var idx = this.data.indexOf(v); if(idx!==-1) this.data.splice(idx,1); },
    has: function(v){ return this.data.indexOf(v) !== -1; },
    clear: function(){ this.data = []; },
    get size(){ return this.data.length; },
    forEach: function(fn){ for(var i=0; i<this.data.length; i++) fn(this.data[i]); }
};
var autoNumbers = Object.create(manualNumbers); autoNumbers.data = [];

document.addEventListener('DOMContentLoaded', function() {
    LottoDataManager.getStats(function(data) {
        if (!data) return;
        combinationStatsData = data;
        initNumberSelector();
        loadSavedSelection();

        var pending = localStorage.getItem('pending_analysis_numbers');
        if (pending) {
            try {
                var numbers = JSON.parse(pending);
                manualNumbers.clear(); autoNumbers.clear();
                for (var i = 0; i < numbers.length; i++) {
                    var num = numbers[i];
                    manualNumbers.add(num);
                    var btn = document.getElementById('select-ball-' + num);
                    if (btn) btn.className = 'select-ball selected-manual';
                }
                updateSelectedBallsDisplay();
                setTimeout(function() { runDetailedAnalysis(); localStorage.removeItem('pending_analysis_numbers'); }, 500);
            } catch (e) {}
        }
    });

    document.getElementById('semi-auto-btn')?.addEventListener('click', semiAutoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});

function initNumberSelector() {
    var container = document.getElementById('number-selector');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 1; i <= 45; i++) {
        var btn = document.createElement('button');
        btn.className = 'select-ball';
        btn.id = 'select-ball-' + i;
        btn.innerText = i;
        (function(num) { btn.onclick = function() { toggleNumber(num); }; })(i);
        container.appendChild(btn);
    }
}

function toggleNumber(num) {
    var btn = document.getElementById('select-ball-' + num);
    if (manualNumbers.has(num)) {
        manualNumbers.delete(num);
        btn.className = 'select-ball';
    } else if (autoNumbers.has(num)) {
        autoNumbers.delete(num);
        btn.className = 'select-ball';
    } else {
        if (manualNumbers.size + autoNumbers.size >= 6) { alert('최대 6개까지만 선택 가능합니다.'); return; }
        manualNumbers.add(num);
        btn.className = 'select-ball selected-manual';
    }
    saveSelection();
    updateSelectedBallsDisplay();
}

function updateSelectedBallsDisplay() {
    var container = document.getElementById('selected-balls');
    var analyzeBtn = document.getElementById('analyze-my-btn');
    if (!container || !analyzeBtn) return;
    
    var totalCount = manualNumbers.size + autoNumbers.size;
    if (totalCount === 0) {
        container.innerHTML = '<div class="placeholder">번호를 선택해주세요</div>';
        analyzeBtn.disabled = true;
        return;
    }

    container.innerHTML = '';
    var allSelected = [];
    manualNumbers.forEach(function(n){ allSelected.push(n); });
    autoNumbers.forEach(function(n){ allSelected.push(n); });
    allSelected.sort(function(a, b) { return a - b; });

    for (var i = 0; i < allSelected.length; i++) {
        var num = allSelected[i];
        var ball = document.createElement('div');
        ball.className = 'ball mini ' + LottoUtils.getBallColorClass(num) + (manualNumbers.has(num) ? ' manual' : '');
        ball.innerText = num;
        container.appendChild(ball);
    }
    analyzeBtn.disabled = (totalCount !== 6);
}

function runDetailedAnalysis() {
    if (!combinationStatsData) return;
    var currentNumbers = [];
    manualNumbers.forEach(function(n){ currentNumbers.push(n); });
    autoNumbers.forEach(function(n){ currentNumbers.push(n); });
    currentNumbers.sort(function(a, b) { return a - b; });

    if (currentNumbers.length !== 6) { alert('6개 번호를 선택해주세요.'); return; }
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(currentNumbers));

    var reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'block';

    var tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    var dists = combinationStatsData.distributions;
    var stats = combinationStatsData.stats_summary;
    var totalScore = 100;
    var dangerCount = 0;
    var warningCount = 0;

    // [v10.0 추가] 과출현 위험 번호 감지
    var overAppNums = [];
    var recent5 = combinationStatsData.recent_draws.slice(0, 5);
    var counts5 = {};
    for (var i = 0; i < 5; i++) {
        var dr = recent5[i].nums;
        for (var j = 0; j < 6; j++) { counts5[dr[j]] = (counts5[dr[j]] || 0) + 1; }
    }
    for (var k = 0; k < 6; k++) { if (counts5[currentNumbers[k]] >= 4) overAppNums.push(currentNumbers[k]); }

    if (overAppNums.length > 0) {
        totalScore -= 30; dangerCount++;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong style="color:#f04452;">🚨 과출현 임계 경보</strong></td><td>-</td><td><span class="status-badge danger">위험</span></td><td class="text-left">선택한 번호 중 [' + overAppNums.join(',') + ']은(는) 물리적 한계치에 도달하여 당첨 확률이 희박합니다.</td>';
        tbody.appendChild(tr);
    }

    // 시너지 분석
    var synergyResults = LottoSynergy.check(currentNumbers, combinationStatsData);
    for (var s = 0; s < synergyResults.length; s++) {
        var res = synergyResults[s];
        if (res.status === 'danger') { totalScore -= 25; dangerCount++; }
        else if (res.status === 'warning') { totalScore -= 10; warningCount++; }
        var trS = document.createElement('tr');
        trS.innerHTML = '<td><strong>[G0] ' + res.label + '</strong></td><td>-</td><td><span class="status-badge ' + res.status + '">' + res.status + '</span></td><td class="text-left">' + res.desc + '</td>';
        tbody.appendChild(trS);
    }

    // G1~G6 모든 지표 분석
    var indicators = LottoConfig.INDICATORS;
    for (var idx = 0; idx < indicators.length; idx++) {
        var cfg = indicators[idx];
        var val = cfg.calc(currentNumbers, combinationStatsData);
        var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
        if (status === 'danger') { totalScore -= 15; dangerCount++; }
        else if (status === 'warning') { totalScore -= 5; warningCount++; }
        renderAnalysisRow(cfg.group + ': ' + cfg.label, val, status);
    }

    // 최종 결과 UI 반영
    totalScore = Math.max(5, totalScore);
    document.getElementById('combination-score').innerText = totalScore;
    var grade = totalScore >= 90 ? 'S' : (totalScore >= 80 ? 'A' : (totalScore >= 70 ? 'B' : (totalScore >= 60 ? 'C' : 'D')));
    var gradeEl = document.getElementById('combination-grade');
    if (gradeEl) {
        gradeEl.innerText = grade + '등급';
        var color = totalScore >= 80 ? '#3182f6' : (totalScore >= 60 ? '#ff9500' : '#f04452');
        gradeEl.style.color = color;
        document.getElementById('combination-score').style.color = color;
    }
}

function renderAnalysisRow(label, value, status) {
    var tbody = document.getElementById('analysis-report-body');
    var tr = document.createElement('tr');
    var statusText = status === 'danger' ? '위험' : (status === 'warning' ? '주의' : '세이프');
    var opinion = status === 'danger' ? '매우 희귀한 패턴' : (status === 'warning' ? '경계 구간' : '안정적 구간');
    tr.innerHTML = '<td><strong>' + label + '</strong></td><td>' + value + '</td><td><span class="status-badge ' + status + '">' + statusText + '</span></td><td class="text-left">' + opinion + '</td>';
    tbody.appendChild(tr);
}

function saveSelection() {
    var m = []; manualNumbers.forEach(function(n){ m.push(n); });
    var a = []; autoNumbers.forEach(function(n){ a.push(n); });
    localStorage.setItem('combination_saved_picks', JSON.stringify({ manual: m, auto: a }));
}

function loadSavedSelection() {
    var saved = localStorage.getItem('combination_saved_picks');
    if (!saved) return;
    try {
        var data = JSON.parse(saved);
        for(var i=0; i<data.manual.length; i++) { manualNumbers.add(data.manual[i]); var b = document.getElementById('select-ball-' + data.manual[i]); if(b) b.className = 'select-ball selected-manual'; }
        for(var j=0; j<data.auto.length; j++) { autoNumbers.add(data.auto[j]); var ba = document.getElementById('select-ball-' + data.auto[j]); if(ba) ba.className = 'select-ball selected'; }
        updateSelectedBallsDisplay();
    } catch (e) {}
}

function semiAutoSelect() {
    if (manualNumbers.size >= 6) return;
    autoNumbers.clear();
    for (var i = 1; i <= 45; i++) { if (!manualNumbers.has(i)) { var btn = document.getElementById('select-ball-' + i); if(btn) btn.className = 'select-ball'; } }
    
    var freq = combinationStatsData.frequency || {};
    var r20 = combinationStatsData.recent_20_frequency || {};
    var scores = [];
    for (var n = 1; n <= 45; n++) { scores.push({ n: n, s: ((freq[n]||0)*0.4) + ((r20[n]||0)*15) }); }
    scores.sort(function(a,b){ return b.s - a.s; });
    
    var pool = [];
    for(var k=0; k<15; k++) { if(!manualNumbers.has(scores[k].n)) pool.push(scores[k].n); }
    
    while (manualNumbers.size + autoNumbers.size < 6 && pool.length > 0) {
        var rIdx = Math.floor(Math.random() * pool.length);
        var pick = pool.splice(rIdx, 1)[0];
        autoNumbers.add(pick);
        var bSelected = document.getElementById('select-ball-' + pick);
        if(bSelected) bSelected.className = 'select-ball selected';
    }
    saveSelection();
    updateSelectedBallsDisplay();
}

function resetSelection() {
    manualNumbers.clear(); autoNumbers.clear();
    for(var i=1; i<=45; i++) { var btn = document.getElementById('select-ball-' + i); if(btn) btn.className = 'select-ball'; }
    localStorage.removeItem('combination_saved_picks');
    updateSelectedBallsDisplay();
    var rs = document.getElementById('report-section'); if(rs) rs.style.display = 'none';
}
