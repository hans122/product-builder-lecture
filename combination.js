let statsData = null;
let selectedNumbers = [];

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) {
    if (num <= 1) return false;
    return !isPrime(num);
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

    document.getElementById('auto-select-btn')?.addEventListener('click', autoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});

function loadStatsData() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            console.log('Stats loaded for analysis');
        });
}

function initNumberSelector() {
    const selector = document.getElementById('number-selector');
    if (!selector) return;
    selector.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'select-ball';
        btn.innerText = i;
        btn.addEventListener('click', () => toggleNumber(i, btn));
        selector.appendChild(btn);
    }
}

function toggleNumber(num, btn) {
    if (selectedNumbers.includes(num)) {
        selectedNumbers = selectedNumbers.filter(n => n !== num);
        btn.classList.remove('selected');
    } else {
        if (selectedNumbers.length >= 6) {
            alert('최대 6개까지만 선택 가능합니다.');
            return;
        }
        selectedNumbers.push(num);
        btn.classList.add('selected');
    }
    updateSelectedBallsDisplay();
}

function updateSelectedBallsDisplay() {
    const container = document.getElementById('selected-balls');
    const analyzeBtn = document.getElementById('analyze-my-btn');
    if (!container || !analyzeBtn) return;
    
    if (selectedNumbers.length === 0) {
        container.innerHTML = '<div class="placeholder">번호를 선택해주세요</div>';
        analyzeBtn.disabled = true;
        return;
    }

    container.innerHTML = '';
    selectedNumbers.sort((a, b) => a - b).forEach(num => {
        const ball = document.createElement('div');
        ball.className = `ball mini ${getBallColorClass(num)}`;
        ball.innerText = num;
        container.appendChild(ball);
    });

    analyzeBtn.disabled = selectedNumbers.length !== 6;
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

function autoSelect() {
    resetSelection();
    const btns = document.querySelectorAll('.select-ball');
    
    if (!statsData || !statsData.frequency) {
        while (selectedNumbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!selectedNumbers.includes(num)) {
                selectedNumbers.push(num);
            }
        }
    } else {
        const zones = getZones(statsData);
        selectedNumbers = [
            ...getRandomFrom(zones.gold, 2),
            ...getRandomFrom(zones.silver, 3),
            ...getRandomFrom(zones.normal, 1)
        ];
    }

    selectedNumbers.forEach(num => {
        const btn = btns[num-1];
        if (btn) btn.classList.add('selected');
    });
    
    updateSelectedBallsDisplay();
}

function resetSelection() {
    selectedNumbers = [];
    document.querySelectorAll('.select-ball').forEach(btn => btn.classList.remove('selected'));
    updateSelectedBallsDisplay();
    const reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'none';
}

function runDetailedAnalysis() {
    if (!statsData || selectedNumbers.length !== 6) return;

    const reportBody = document.getElementById('analysis-report-body');
    if (!reportBody) return;
    reportBody.innerHTML = '';
    
    let totalScore = 100;
    const nums = [...selectedNumbers].sort((a, b) => a - b);

    // [G0] 파레토 영역 분석
    if (statsData.frequency) {
        const zones = getZones(statsData);
        const gCnt = nums.filter(n => zones.gold.includes(n)).length;
        const sCnt = nums.filter(n => zones.silver.includes(n)).length;
        const nCnt = nums.filter(n => zones.normal.includes(n)).length;
        const cCnt = nums.filter(n => zones.cold.includes(n)).length;
        
        addReportRow('[G0] 파레토 영역', `G:${gCnt}/S:${sCnt}/N:${nCnt}/C:${cCnt}`, 
            (gCnt >= 1 && gCnt <= 3) ? '최적' : '보통', 
            `골드(${gCnt}), 실버(${sCnt}) 비중 분석입니다. (추천: 2:3:1:0)`);
    }

    // [G1] 기본 균형
    const sum = nums.reduce((a, b) => a + b, 0);
    addReportRow('[G1] 총합', sum, (sum >= 120 && sum <= 180) ? '최적' : '보통', '평균 ±1σ 이내의 옵티멀 구간 분석입니다.');
    const odds = nums.filter(n => n % 2 !== 0).length;
    addReportRow('[G1] 홀:짝', `${odds}:${6-odds}`, (odds >= 2 && odds <= 4) ? '최적' : '주의', '홀수와 짝수의 균형입니다.');
    const lows = nums.filter(n => n <= 22).length;
    addReportRow('[G1] 고:저', `${lows}:${6-lows}`, (lows >= 2 && lows <= 4) ? '최적' : '주의', '저번호와 고번호의 균형입니다.');

    // [G2] 회차 상관관계
    if (statsData.last_3_draws) {
        const prev1 = new Set(statsData.last_3_draws[0]);
        const p1 = nums.filter(n => prev1.has(n)).length;
        addReportRow('[G2] 직전 1회차', `${p1}개`, (p1 >= 1 && p1 <= 2) ? '최적' : '보통', '직전 회차 번호 중복 분석입니다.');
        const prev1_3 = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[]), ...(statsData.last_3_draws[2]||[])]);
        const p1_3 = nums.filter(n => prev1_3.has(n)).length;
        addReportRow('[G2] 1~3회전 매칭', `${p1_3}개`, (p1_3 >= 3 && p1_3 <= 5) ? '최적' : '보통', '최근 3개 회차 합집합과의 중복 분석입니다.');
    }

    // [G3] 특수 번호군
    const primeCnt = nums.filter(isPrime).length;
    addReportRow('[G3] 소수 포함', `${primeCnt}개`, (primeCnt >= 2 && primeCnt <= 3) ? '최적' : '보통', '소수 포함 개수 분석입니다.');
    const m3Cnt = nums.filter(n => n % 3 === 0).length;
    addReportRow('[G3] 3배수 포함', `${m3Cnt}개`, '보통', '3의 배수 포함 분석입니다.');

    // [G4] 구간 및 패턴
    const b15 = new Set(nums.map(n => Math.floor((n-1)/15))).size;
    addReportRow('[G4] 3분할 점유', `${b15}구간`, b15 >= 2 ? '최적' : '주의', '15개 단위 구간 분산도 분석입니다.');
    const colorCnt = new Set(nums.map(getBallColorClass)).size;
    addReportRow('[G4] 색상 분할', `${colorCnt}색`, colorCnt >= 3 ? '최적' : '보통', '5가지 색상 그룹 점유 분석입니다.');

    // [G5] 끝수 및 전문지표
    const acVal = calculate_ac(nums);
    addReportRow('[G5] AC값', acVal, acVal >= 7 ? '최적' : '주의', '무작위성 검증 지표입니다.');
    const spanVal = nums[5] - nums[0];
    addReportRow('[G5] Span', spanVal, (spanVal >= 25 && spanVal <= 40) ? '최적' : '보통', '옵티멀 구간 내의 번호 간 최대 간격 분석입니다.');

    // 최종 결과 출력
    const scoreElem = document.getElementById('combination-score');
    const gradeElem = document.getElementById('combination-grade');
    const reportSection = document.getElementById('report-section');
    if (scoreElem) scoreElem.innerText = totalScore;
    if (gradeElem) gradeElem.innerText = totalScore >= 90 ? 'A등급' : (totalScore >= 80 ? 'B등급' : 'C등급');
    if (reportSection) {
        reportSection.style.display = 'block';
        reportSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function addReportRow(label, value, status, opinion) {
    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    let statusClass = (status === '최적') ? 'optimal' : (status === '주의' ? 'warning' : 'safe');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${statusClass}">${status === '보통' ? '세이프' : status}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}