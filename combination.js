let statsData = null;
let manualNumbers = new Set(); // 사용자가 직접 클릭한 번호
let autoNumbers = new Set();   // 시스템이 채워준 번호

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) {
    return num > 1 && !isPrime(num);
}

function calculate_ac(nums) {
    const diffs = new Set();
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            diffs.add(Math.abs(nums[i] - nums[j]));
        }
    }
    return diffs.size - (nums.length - 1);
}

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
        if (manualNumbers.size + autoNumbers.size >= 6) {
            alert('최대 6개까지만 선택 가능합니다.');
            return;
        }
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
        ball.className = `ball mini ${getBallColorClass(num)}`;
        if (manualNumbers.has(num)) ball.classList.add('manual');
        ball.innerText = num;
        container.appendChild(ball);
    });
    analyzeBtn.disabled = (totalCount !== 6);
}

function saveSelection() {
    const data = {
        manual: Array.from(manualNumbers),
        auto: Array.from(autoNumbers)
    };
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

function loadStatsData() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => { statsData = data; })
        .catch(err => console.error('Data load failed:', err));
}

function getZones(data) {
    const freq = data.frequency || {};
    const recentFreq = data.recent_20_frequency || {};
    const scores = [];
    for (let i = 1; i <= 45; i++) {
        const cumulative = freq[i] || 0;
        const recent = recentFreq[i] || 0;
        const totalScore = (cumulative * 0.4) + (recent * 25.0 * 0.6); 
        scores.push({ num: i, score: totalScore });
    }
    scores.sort((a, b) => b.score - a.score);
    return {
        gold: scores.slice(0, 9).map(x => x.num),
        silver: scores.slice(9, 23).map(x => x.num),
        normal: scores.slice(23, 36).map(x => x.num),
        cold: scores.slice(36).map(x => x.num)
    };
}

function semiAutoSelect() {
    if (manualNumbers.size >= 6) return;
    autoNumbers.clear();
    document.querySelectorAll('.select-ball').forEach((btn, idx) => {
        if (!manualNumbers.has(idx + 1)) btn.classList.remove('selected');
    });

    if (!statsData) return;
    const zones = getZones(statsData);
    const weightedCandidates = [...zones.gold, ...zones.gold, ...zones.silver, ...zones.silver, ...zones.normal].filter(n => !manualNumbers.has(n));
    
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

function runDetailedAnalysis() {
    if (!statsData) return;
    const currentNumbers = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    if (currentNumbers.length !== 6) { alert('6개 번호를 선택해주세요.'); return; }

    // 분석 시점에 번호를 최근 번호로 저장 (통계 페이지 연동)
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(currentNumbers));

    const reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'block';

    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const dists = statsData.distributions;
    const stats = statsData.stats_summary;

    renderAnalysisRow('G1: 합계 점수', currentNumbers.reduce((a, b) => a + b, 0), dists.sum, stats.sum);
    renderAnalysisRow('G2: 홀짝 비율', currentNumbers.filter(n => n % 2 !== 0).length + ":" + currentNumbers.filter(n => n % 2 === 0).length, dists.odd_even, stats.odd_count);
    renderAnalysisRow('G2: 고저 비율', currentNumbers.filter(n => n <= 22).length + ":" + currentNumbers.filter(n => n > 22).length, dists.high_low, stats.low_count);
    renderAnalysisRow('G3: 소수 출현', currentNumbers.filter(isPrime).length, dists.prime, stats.prime);
    renderAnalysisRow('G3: 합성수 출현', currentNumbers.filter(isComposite).length, dists.composite, stats.composite);
    renderAnalysisRow('G3: 3의 배수', currentNumbers.filter(n => n % 3 === 0).length, dists.multiple_3, stats.multiple_3);
    renderAnalysisRow('G4: AC 지수', calculate_ac(currentNumbers), dists.ac, stats.ac);
    renderAnalysisRow('G5: 끝수 합계', currentNumbers.reduce((a, b) => a + (b % 10), 0), dists.end_sum, stats.end_sum);
}

function renderAnalysisRow(label, value, distData, statSummary) {
    const tbody = document.getElementById('analysis-report-body');
    const tr = document.createElement('tr');
    
    let status = 'safe'; 
    let opinion = '안정적인 데이터 분포 내에 있습니다.';
    
    if (statSummary) {
        const numVal = parseFloat(typeof value === 'string' ? value.split(':')[0] : value);
        const z = Math.abs(numVal - statSummary.mean) / statSummary.std;
        if (z > 2) { status = 'danger'; opinion = '통계적 희귀 구간입니다. 신중한 선택이 필요합니다.'; }
        else if (z > 1) { status = 'warning'; opinion = '평균에서 약간 벗어난 구간입니다.'; }
    }

    const statusText = status === 'danger' ? '위험' : (status === 'warning' ? '주의' : '세이프');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${status}">${statusText}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow'; if (num <= 20) return 'blue'; if (num <= 30) return 'red';
    if (num <= 40) return 'gray'; return 'green';
}

document.addEventListener('DOMContentLoaded', function() {
    initNumberSelector(); loadStatsData(); loadSavedSelection();
    const pending = localStorage.getItem('pending_analysis_numbers');
    if (pending) {
        try {
            const numbers = JSON.parse(pending); manualNumbers.clear(); autoNumbers.clear();
            numbers.forEach(num => { manualNumbers.add(num); const btn = document.getElementById(`select-ball-${num}`); if (btn) btn.classList.add('selected-manual'); });
            updateSelectedBallsDisplay();
            setTimeout(() => { runDetailedAnalysis(); localStorage.removeItem('pending_analysis_numbers'); }, 500);
        } catch (e) { console.error(e); }
    }
    document.getElementById('semi-auto-btn')?.addEventListener('click', semiAutoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});