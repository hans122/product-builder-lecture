/**
 * My Combination Analysis - LottoCore v4.3 기반 리팩토링
 */

let combinationStatsData = null;
let manualNumbers = new Set();
let autoNumbers = new Set();

document.addEventListener('DOMContentLoaded', async function() {
    combinationStatsData = await LottoDataManager.getStats();
    initNumberSelector();
    loadSavedSelection();

    const pending = localStorage.getItem('pending_analysis_numbers');
    if (pending) {
        try {
            const numbers = JSON.parse(pending); manualNumbers.clear(); autoNumbers.clear();
            numbers.forEach(num => {
                manualNumbers.add(num);
                const btn = document.getElementById(`select-ball-${num}`);
                if (btn) btn.classList.add('selected-manual');
            });
            updateSelectedBallsDisplay();
            setTimeout(() => { runDetailedAnalysis(); localStorage.removeItem('pending_analysis_numbers'); }, 500);
        } catch (e) { console.error(e); }
    }

    document.getElementById('semi-auto-btn')?.addEventListener('click', semiAutoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});

function initNumberSelector() {
    const container = document.getElementById('number-selector');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'select-ball';
        btn.id = `select-ball-${i}`;
        btn.innerText = i;
        btn.addEventListener('click', () => toggleNumber(i));
        container.appendChild(btn);
    }
}

function toggleNumber(num) {
    const btn = document.getElementById(`select-ball-${num}`);
    if (manualNumbers.has(num)) {
        manualNumbers.delete(num);
        btn.classList.remove('selected-manual');
    } else if (autoNumbers.has(num)) {
        autoNumbers.delete(num);
        btn.classList.remove('selected');
    } else {
        if (manualNumbers.size + autoNumbers.size >= 6) { alert('최대 6개까지만 선택 가능합니다.'); return; }
        manualNumbers.add(num);
        btn.classList.add('selected-manual');
    }
    saveSelection();
    updateSelectedBallsDisplay();
}

function updateSelectedBallsDisplay() {
    const container = document.getElementById('selected-balls');
    const analyzeBtn = document.getElementById('analyze-my-btn');
    if (!container || !analyzeBtn) return;
    
    const totalCount = manualNumbers.size + autoNumbers.size;
    if (totalCount === 0) {
        container.innerHTML = '<div class="placeholder">번호를 선택해주세요</div>';
        analyzeBtn.disabled = true;
        return;
    }

    container.innerHTML = '';
    const allSelected = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    allSelected.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `ball mini ${LottoUtils.getBallColorClass(num)}`;
        if (manualNumbers.has(num)) ball.classList.add('manual');
        ball.innerText = num;
        container.appendChild(ball);
    });
    analyzeBtn.disabled = (totalCount !== 6);
}

function saveSelection() {
    const data = { manual: Array.from(manualNumbers), auto: Array.from(autoNumbers) };
    localStorage.setItem('combination_saved_picks', JSON.stringify(data));
}

function loadSavedSelection() {
    const saved = localStorage.getItem('combination_saved_picks');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        data.manual.forEach(num => {
            manualNumbers.add(num);
            const btn = document.getElementById(`select-ball-${num}`);
            if (btn) btn.classList.add('selected-manual');
        });
        data.auto.forEach(num => {
            autoNumbers.add(num);
            const btn = document.getElementById(`select-ball-${num}`);
            if (btn) btn.classList.add('selected');
        });
        updateSelectedBallsDisplay();
    } catch (e) { console.error('Load failed:', e); }
}

function runDetailedAnalysis() {
    if (!combinationStatsData) return;
    const currentNumbers = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    if (currentNumbers.length !== 6) { alert('6개 번호를 선택해주세요.'); return; }

    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(currentNumbers));

    const reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'block';

    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const dists = combinationStatsData.distributions;
    const stats = combinationStatsData.stats_summary;

    // [LottoCore 통합 연동] 모든 지표(G1~G6)를 리포트에 포함하여 전문성 강화
    LottoConfig.INDICATORS.forEach(cfg => {
        const value = cfg.calc(currentNumbers, combinationStatsData);
        renderAnalysisRow(`${cfg.group}: ${cfg.label}`, value, dists[cfg.distKey], stats[cfg.statKey]);
    });

    // [G7] 조합 정합성(Synergy) 분석 추가
    renderSynergyReport(currentNumbers);
}

function renderSynergyReport(nums) {
    const synergyResults = LottoSynergy.check(nums, combinationStatsData);
    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;

    if (synergyResults.length === 0) {
        // 모순이 없는 경우 클린 리포트 행 추가
        const tr = document.createElement('tr');
        tr.style.background = '#f0fff4';
        tr.innerHTML = `<td colspan="2"><strong>[G7] 조합 정합성 시너지</strong></td><td><span class="status-badge optimal">완벽</span></td><td class="text-left">지표 간 충돌이 없는 매우 논리적인 조합입니다.</td>`;
        tbody.appendChild(tr);
    } else {
        synergyResults.forEach(res => {
            const tr = document.createElement('tr');
            tr.style.background = res.status === 'warning' ? '#fff5f5' : '#f0f7ff';
            const statusText = res.status === 'warning' ? '충돌' : '주의';
            tr.innerHTML = `<td><strong>[G7] ${res.label}</strong></td><td>-</td><td><span class="status-badge ${res.status}">${statusText}</span></td><td class="text-left">${res.desc}</td>`;
            tbody.appendChild(tr);
        });
    }
}

function renderAnalysisRow(label, value, distData, statSummary) {
    const tbody = document.getElementById('analysis-report-body');
    const tr = document.createElement('tr');
    
    let status = LottoUtils.getZStatus(value, statSummary);
    let opinion = '안정적인 데이터 분포 내에 있습니다.';
    
    if (status === 'warning') opinion = '통계적 희귀 구간입니다. 신중한 선택이 필요합니다.';
    else if (status === 'safe') opinion = '평균에서 약간 벗어난 구간입니다.';

    const statusText = status === 'warning' ? '위험' : (status === 'safe' ? '주의' : '세이프');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${status}">${statusText}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}

function semiAutoSelect() {
    if (manualNumbers.size >= 6) return;
    autoNumbers.clear();
    document.querySelectorAll('.select-ball').forEach((btn, idx) => {
        if (!manualNumbers.has(idx + 1)) btn.classList.remove('selected');
    });

    if (!combinationStatsData) return;
    const freq = combinationStatsData.frequency || {};
    const recentFreq = combinationStatsData.recent_20_frequency || {};
    const scores = [];
    for (let i = 1; i <= 45; i++) {
        const totalScore = ((freq[i] || 0) * 0.4) + ((recentFreq[i] || 0) * 25.0 * 0.6); 
        scores.push({ num: i, score: totalScore });
    }
    scores.sort((a, b) => b.score - a.score);
    
    const gold = scores.slice(0, 9).map(x => x.num);
    const silver = scores.slice(9, 23).map(x => x.num);
    const normal = scores.slice(23, 36).map(x => x.num);

    const weightedCandidates = [...gold, ...gold, ...silver, ...silver, ...normal].filter(n => !manualNumbers.has(n));
    
    while (manualNumbers.size + autoNumbers.size < 6 && weightedCandidates.length > 0) {
        const idx = Math.floor(Math.random() * weightedCandidates.length);
        const num = weightedCandidates[idx];
        if (!manualNumbers.has(num) && !autoNumbers.has(num)) autoNumbers.add(num);
        weightedCandidates.splice(idx, 1);
    }
    autoNumbers.forEach(num => {
        const btn = document.getElementById(`select-ball-${num}`);
        if (btn) btn.classList.add('selected');
    });
    saveSelection();
    updateSelectedBallsDisplay();
}

function resetSelection() {
    manualNumbers.clear(); autoNumbers.clear();
    document.querySelectorAll('.select-ball').forEach(btn => btn.classList.remove('selected', 'selected-manual'));
    localStorage.removeItem('combination_saved_picks');
    updateSelectedBallsDisplay();
    const rs = document.getElementById('report-section'); if (rs) rs.style.display = 'none';
}
