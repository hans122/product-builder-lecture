let statsData = null;
let manualNumbers = new Set(); // 사용자가 직접 클릭한 번호
let autoNumbers = new Set();   // 시스템이 채워준 번호

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
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

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

document.addEventListener('DOMContentLoaded', function() {
    initNumberSelector();
    loadStatsData();

    document.getElementById('semi-auto-btn')?.addEventListener('click', semiAutoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});

function loadStatsData() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            console.log('Stats loaded for analysis');
        })
        .catch(err => console.error('Stats load failed:', err));
}

function initNumberSelector() {
    const selector = document.getElementById('number-selector');
    if (!selector) return;
    selector.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'select-ball';
        btn.innerText = i;
        btn.type = 'button';
        btn.addEventListener('click', () => toggleNumber(i, btn));
        selector.appendChild(btn);
    }
}

function toggleNumber(num, btn) {
    // 수동 선택 로직
    if (manualNumbers.has(num)) {
        manualNumbers.delete(num);
        btn.classList.remove('selected-manual');
    } else if (autoNumbers.has(num)) {
        // 자동 선택된 번호를 클릭하면 해제됨
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
    
    // 전체 번호를 합쳐서 정렬하여 표시
    const allSelected = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    
    allSelected.forEach(num => {
        const ball = document.createElement('div');
        const colorClass = getBallColorClass(num);
        ball.className = `ball mini ${colorClass}`;
        
        // 수동 선택 번호는 특별 클래스 추가
        if (manualNumbers.has(num)) {
            ball.classList.add('manual');
        }
        
        ball.innerText = num;
        container.appendChild(ball);
    });

    analyzeBtn.disabled = (totalCount !== 6);
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

function getRandomFrom(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function semiAutoSelect() {
    // 수동 선택이 이미 6개면 더 이상 채울 공간이 없으므로 중단
    if (manualNumbers.size >= 6) return;

    // 기존 자동 선택 번호는 지우고 새로 채움 (수동은 유지)
    autoNumbers.clear();
    const btns = document.querySelectorAll('.select-ball');
    btns.forEach((btn, idx) => {
        if (!manualNumbers.has(idx + 1)) btn.classList.remove('selected');
    });

    if (!statsData || !statsData.frequency) {
        while (manualNumbers.size + autoNumbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) {
                autoNumbers.add(num);
            }
        }
    } else {
        const zones = getZones(statsData);
        // 수동 선택 번호를 제외한 후보군 생성
        const weightedCandidates = [
            ...zones.gold, ...zones.gold, 
            ...zones.silver, ...zones.silver, 
            ...zones.normal
        ].filter(n => !manualNumbers.has(n));

        while (manualNumbers.size + autoNumbers.size < 6 && weightedCandidates.length > 0) {
            const idx = Math.floor(Math.random() * weightedCandidates.length);
            const num = weightedCandidates[idx];
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) {
                autoNumbers.add(num);
            }
            weightedCandidates.splice(idx, 1);
        }
        
        while (manualNumbers.size + autoNumbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) {
                autoNumbers.add(num);
            }
        }
    }

    // 화면 UI 업데이트 (자동 번호 마킹)
    autoNumbers.forEach(num => {
        const btn = btns[num-1];
        if (btn) btn.classList.add('selected');
    });
    
    updateSelectedBallsDisplay();
}

function autoSelect() {
    resetSelection();
    const btns = document.querySelectorAll('.select-ball');
    
    if (!statsData || !statsData.frequency) {
        while (autoNumbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!autoNumbers.has(num)) {
                autoNumbers.add(num);
            }
        }
    } else {
        const zones = getZones(statsData);
        const picks = [
            ...getRandomFrom(zones.gold, 2),
            ...getRandomFrom(zones.silver, 3),
            ...getRandomFrom(zones.normal, 1)
        ];
        picks.forEach(n => autoNumbers.add(n));
    }

    autoNumbers.forEach(num => {
        const btn = btns[num-1];
        if (btn) btn.classList.add('selected');
    });
    
    updateSelectedBallsDisplay();
}

function resetSelection() {
    manualNumbers.clear();
    autoNumbers.clear();
    document.querySelectorAll('.select-ball').forEach(btn => {
        btn.classList.remove('selected', 'selected-manual');
    });
    updateSelectedBallsDisplay();
    const reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'none';
}

function runDetailedAnalysis() {
    const totalCount = manualNumbers.size + autoNumbers.size;
    if (!statsData || totalCount !== 6) return;

    const reportBody = document.getElementById('analysis-report-body');
    const reportSection = document.getElementById('report-section');
    if (!reportBody || !reportSection) return;
    
    reportBody.innerHTML = '';
    reportSection.style.display = 'block';
    
    const nums = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    const summary = statsData.stats_summary || {};

    const getStatus = (val, statKey) => {
        const stat = summary[statKey];
        if (!stat || stat.std === 0) return 'safe';
        const z = Math.abs(val - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    };

    // [G0] 파레토 영역 분석
    const zones = getZones(statsData);
    const gCnt = nums.filter(n => zones.gold.includes(n)).length;
    const sCnt = nums.filter(n => zones.silver.includes(n)).length;
    const nCnt = nums.filter(n => zones.normal.includes(n)).length;
    addReportRow('[G0] 파레토 영역', `G:${gCnt}/S:${sCnt}/N:${nCnt}`, (gCnt >= 1 && gCnt <= 3) ? 'optimal' : 'safe', `골드/실버 비중 분석입니다.`);

    // [G1] 기본 균형
    const sumVal = nums.reduce((a, b) => a + b, 0);
    addReportRow('[G1] 총합', sumVal, getStatus(sumVal, 'sum'), '평균 ±1σ 이내 분석입니다.');
    const oddCnt = nums.filter(n => n % 2 !== 0).length;
    addReportRow('[G1] 홀:짝', `${oddCnt}:${6-oddCnt}`, getStatus(oddCnt, 'odd_count'), '홀짝 균형 분석입니다.');
    const lowCnt = nums.filter(n => n <= 22).length;
    addReportRow('[G1] 고:저', `${lowCnt}:${6-lowCnt}`, getStatus(lowCnt, 'low_count'), '고저 균형 분석입니다.');

    if (statsData.last_3_draws) {
        const p1 = nums.filter(n => new Set(statsData.last_3_draws[0]).has(n)).length;
        addReportRow('[G2] 직전 1회차', `${p1}개`, getStatus(p1, 'period_1'), '이월수 분석입니다.');
        const p1_3_set = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[]), ...(statsData.last_3_draws[2]||[])]);
        const p1_3 = nums.filter(n => p1_3_set.has(n)).length;
        addReportRow('[G2] 1~3회전 매칭', `${p1_3}개`, getStatus(p1_3, 'period_1_3'), '최근 흐름 분석입니다.');
    }

    const primeCnt = nums.filter(isPrime).length;
    addReportRow('[G3] 소수 포함', `${primeCnt}개`, getStatus(primeCnt, 'prime'), '소수 출현 빈도 분석입니다.');
    const m3Cnt = nums.filter(n => n % 3 === 0).length;
    addReportRow('[G3] 3배수 포함', `${m3Cnt}개`, getStatus(m3Cnt, 'multiple_3'), '3의 배수 포함 분석입니다.');

    const b15 = new Set(nums.map(n => Math.floor((n-1)/15))).size;
    addReportRow('[G4] 3분할 점유', `${b15}구간`, getStatus(b15, 'bucket_15'), '구간별 분산도 분석입니다.');
    const colorCnt = new Set(nums.map(getBallColorClass)).size;
    addReportRow('[G4] 색상 분할', `${colorCnt}색`, getStatus(colorCnt, 'color'), '색상 그룹 점유 분석입니다.');

    const acVal = calculate_ac(nums);
    addReportRow('[G5] AC값', acVal, getStatus(acVal, 'ac'), '산술적 복잡도 분석입니다.');
    const spanVal = nums[5] - nums[0];
    addReportRow('[G5] Span', spanVal, getStatus(spanVal, 'span'), '번호 간격 분석입니다.');

    const scoreElem = document.getElementById('combination-score');
    if (scoreElem) scoreElem.innerText = 80 + (nums.filter(n => zones.gold.includes(n)).length * 2);

    setTimeout(() => {
        reportSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function addReportRow(label, value, statusClass, opinion) {
    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    let statusText = statusClass === 'optimal' ? '최적' : (statusClass === 'warning' ? '주의' : '세이프');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${statusClass}">${statusText}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}