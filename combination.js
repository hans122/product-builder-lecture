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

    document.getElementById('auto-select-btn').addEventListener('click', autoSelect);
    document.getElementById('reset-btn').addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn').addEventListener('click', runDetailedAnalysis);
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

function autoSelect() {
    resetSelection();
    const btns = document.querySelectorAll('.select-ball');
    while (selectedNumbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!selectedNumbers.includes(num)) {
            selectedNumbers.push(num);
            btns[num-1].classList.add('selected');
        }
    }
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
    if (!statsData || selectedNumbers.length !== 6) {
        alert('데이터를 불러오는 중이거나 번호가 6개가 아닙니다.');
        return;
    }

    const reportBody = document.getElementById('analysis-report-body');
    if (!reportBody) return;
    reportBody.innerHTML = '';
    
    let totalScore = 100;
    const nums = [...selectedNumbers].sort((a, b) => a - b);

    // 1. 총합 분석
    const sum = nums.reduce((a, b) => a + b, 0);
    addReportRow('총합', sum, (sum >= 120 && sum <= 180) ? '최적' : '보통', '역대 가장 많이 당첨된 120~180 구간 분석입니다.');

    // 2. 비율 분석
    const odds = nums.filter(n => n % 2 !== 0).length;
    addReportRow('홀:짝', `${odds}:${6-odds}`, (odds >= 2 && odds <= 4) ? '최적' : '주의', '홀수와 짝수의 균형 분석입니다.');
    const lows = nums.filter(n => n <= 22).length;
    addReportRow('고:저', `${lows}:${6-lows}`, (lows >= 2 && lows <= 4) ? '최적' : '주의', '저번호와 고번호의 균형 분석입니다.');

    // 3. 특수수 분석
    const primeCnt = nums.filter(isPrime).length;
    addReportRow('소수 포함', `${primeCnt}개`, (primeCnt >= 2 && primeCnt <= 3) ? '최적' : '보통', '2, 3, 5, 7, 11 등 소수 개수입니다.');
    const compositeCnt = nums.filter(isComposite).length;
    addReportRow('합성수 포함', `${compositeCnt}개`, '보통', '1과 소수를 제외한 합성수 개수입니다.');
    const m3Cnt = nums.filter(n => n % 3 === 0).length;
    addReportRow('3배수 포함', `${m3Cnt}개`, '보통', '3의 배수 포함 개수 분석입니다.');
    const m5Cnt = nums.filter(n => n % 5 === 0).length;
    addReportRow('5배수 포함', `${m5Cnt}개`, '보통', '5의 배수 포함 개수 분석입니다.');
    const squares = [1, 4, 9, 16, 25, 36];
    const squareCnt = nums.filter(n => squares.includes(n)).length;
    addReportRow('제곱수 포함', `${squareCnt}개`, '보통', '완전제곱수 포함 개수 분석입니다.');
    const doubles = [11, 22, 33, 44];
    const doubleCnt = nums.filter(n => doubles.includes(n)).length;
    addReportRow('쌍수 포함', `${doubleCnt}개`, '보통', '쌍수 포함 개수 분석입니다.');

    // 4. 이월수 분석 (윈도우)
    if (statsData.last_3_draws) {
        const prev1 = new Set(statsData.last_3_draws[0]);
        const p1 = nums.filter(n => prev1.has(n)).length;
        addReportRow('이월수(1회전)', `${p1}개`, (p1 >= 1 && p1 <= 2) ? '최적' : '보통', '직전 회차 번호와의 중복도입니다.');
        const prev1_3 = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[]), ...(statsData.last_3_draws[2]||[])]);
        const p1_3 = nums.filter(n => prev1_3.has(n)).length;
        addReportRow('1~3회전 매칭', `${p1_3}개`, (p1_3 >= 3 && p1_3 <= 5) ? '최적' : '보통', '최근 3개 회차 합집합과의 중복도입니다.');
    }

    // 5. 구간 및 전문 지표
    const b15 = new Set(nums.map(n => Math.floor((n-1)/15))).size;
    const b3 = new Set(nums.map(n => Math.floor((n-1)/3))).size;
    addReportRow('3분할 점유', `${b15}구간`, b15 >= 2 ? '최적' : '주의', '15개씩 3개 구간 중 포함된 구간 수입니다.');
    addReportRow('15분할 점유', `${b3}구간`, b3 >= 5 ? '최적' : '보통', '3개씩 15개 구간 중 포함된 구간 수입니다.');
    const colorCnt = new Set(nums.map(getBallColorClass)).size;
    addReportRow('색상 분할', `${colorCnt}색`, colorCnt >= 3 ? '최적' : '보통', '5가지 색상 그룹 점유 분석입니다.');

    const acVal = calculate_ac(nums);
    addReportRow('AC값', acVal, acVal >= 7 ? '최적' : '주의', '산술적 복잡도입니다. 7 이상을 권장합니다.');
    const spanVal = nums[5] - nums[0];
    addReportRow('Span', spanVal, (spanVal >= 25 && spanVal <= 40) ? '최적' : '보통', '번호 간 분산도를 나타내는 Span 지표입니다.');

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
    const tr = document.createElement('tr');
    let statusClass = (status === '최적') ? 'optimal' : (status === '주의' ? 'warning' : 'normal');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${statusClass}">${status}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}