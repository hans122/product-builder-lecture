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

    let totalScore = 100;
    let dangerCount = 0;
    let warningCount = 0;

    // [G7] 조합 정합성(Synergy) 분석
    const synergyResults = LottoSynergy.check(currentNumbers, combinationStatsData);
    if (synergyResults.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>[G0] 조합 정합성 시너지</strong></td><td>-</td><td><span class="status-badge safe">세이프</span></td><td class="text-left">지표 간 충돌이 없는 매우 논리적인 조합입니다.</td>`;
        tbody.appendChild(tr);
    } else {
        synergyResults.forEach(res => {
            // [등급별 감점 차별화] Danger: -25점, Warning: -10점
            if (res.status === 'danger') { totalScore -= 25; dangerCount++; }
            else if (res.status === 'warning') { totalScore -= 10; warningCount++; }
            
            const tr = document.createElement('tr');
            const statusText = res.status === 'danger' ? '위험' : (res.status === 'warning' ? '주의' : '세이프');
            tr.innerHTML = `<td><strong>[G0] ${res.label}</strong></td><td>-</td><td><span class="status-badge ${res.status}">${statusText}</span></td><td class="text-left">${res.desc}</td>`;
            tbody.appendChild(tr);
        });
    }

    // [LottoCore 통합 연동] 모든 지표(G1~G6) 리포트 및 스코어 차감
    LottoConfig.INDICATORS.forEach(cfg => {
        const value = cfg.calc(currentNumbers, combinationStatsData);
        const status = LottoUtils.getZStatus(value, stats[cfg.statKey]);
        
        if (status === 'danger') { totalScore -= 15; dangerCount++; }
        else if (status === 'warning') { totalScore -= 5; warningCount++; }

        renderAnalysisRow(`${cfg.group}: ${cfg.label}`, value, dists[cfg.distKey], stats[cfg.statKey]);
    });

    // 최종 스코어 보정 및 UI 반영
    totalScore = Math.max(5, totalScore);
    const scoreEl = document.getElementById('combination-score');
    const gradeEl = document.getElementById('combination-grade');
    const commentEl = document.getElementById('grade-comment');

    if (scoreEl) {
        scoreEl.innerText = totalScore;
        // 스코어 색상 동적 변경
        if (totalScore >= 80) scoreEl.style.color = 'var(--primary-blue)';
        else if (totalScore >= 60) scoreEl.style.color = 'var(--warning-orange)';
        else scoreEl.style.color = 'var(--danger-red)';
    }

    if (gradeEl) {
        let grade = 'S';
        if (totalScore >= 90) grade = 'S';
        else if (totalScore >= 80) grade = 'A';
        else if (totalScore >= 70) grade = 'B';
        else if (totalScore >= 60) grade = 'C';
        else grade = 'D';
        gradeEl.innerText = `${grade}등급`;
        gradeEl.style.color = scoreEl.style.color;
    }

    if (commentEl) {
        if (dangerCount > 0) commentEl.innerText = `위험 지표가 ${dangerCount}개 발견되었습니다. 매우 희귀한 패턴의 조합입니다.`;
        else if (warningCount > 2) commentEl.innerText = `주의 지표가 ${warningCount}개로 다소 치우친 조합입니다. 균형 조절을 권장합니다.`;
        else commentEl.innerText = '역대 당첨 데이터의 핵심 구간에 부합하는 매우 이상적인 조합입니다.';
    }
}

function renderAnalysisRow(label, value, distData, statSummary) {
    const tbody = document.getElementById('analysis-report-body');
    const tr = document.createElement('tr');
    
    let status = LottoUtils.getZStatus(value, statSummary);
    let opinion = '가장 안정적인 핵심 데이터 구간에 있습니다.';
    
    if (status === 'danger') opinion = '상위 5% 미만의 아주 희귀한 패턴입니다.';
    else if (status === 'warning') opinion = '세이프를 벗어나 쏠림이 발생하는 경계 구간입니다.';

    const statusText = status === 'danger' ? '위험' : (status === 'warning' ? '주의' : '세이프');
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
