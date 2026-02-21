let statsData = null;
let selectedNumbers = [];

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
    while (selectedNumbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!selectedNumbers.includes(num)) {
            selectedNumbers.push(num);
            const btns = document.querySelectorAll('.select-ball');
            btns[num-1].classList.add('selected');
        }
    }
    updateSelectedBallsDisplay();
}

function resetSelection() {
    selectedNumbers = [];
    document.querySelectorAll('.select-ball').forEach(btn => btn.classList.remove('selected'));
    updateSelectedBallsDisplay();
    document.getElementById('report-section').style.display = 'none';
}

function runDetailedAnalysis() {
    if (!statsData || selectedNumbers.length !== 6) return;

    const reportBody = document.getElementById('analysis-report-body');
    reportBody.innerHTML = '';
    
    let totalScore = 100;
    const nums = [...selectedNumbers].sort((a, b) => a - b);

    // 1. 총합 분석
    const sum = nums.reduce((a, b) => a + b, 0);
    let sumStatus = '보통';
    let sumOpinion = '평균적인 범위 내에 있습니다.';
    if (sum >= 120 && sum <= 180) {
        sumStatus = '최적';
        sumOpinion = '역대 가장 많이 당첨된 120~180 구간에 포함됩니다.';
    } else {
        sumStatus = '주의';
        sumOpinion = '평균 범위를 벗어났습니다. 너무 낮거나 높은 합계는 당첨 확률이 낮습니다.';
        totalScore -= 10;
    }
    addReportRow('총합', sum, sumStatus, sumOpinion);

    // 2. 홀짝 분석
    const odds = nums.filter(n => n % 2 !== 0).length;
    const oddEvenRatio = `${odds}:${6-odds}`;
    let oeStatus = '보통';
    let oeOpinion = '무난한 비율입니다.';
    if (odds >= 2 && odds <= 4) {
        oeStatus = '최적';
        oeOpinion = '2:4, 3:3, 4:2 비율은 전체 당첨의 약 80%를 차지합니다.';
    } else {
        oeStatus = '주의';
        oeOpinion = '한쪽으로 너무 치우친 홀짝 비율입니다.';
        totalScore -= 15;
    }
    addReportRow('홀:짝', oddEvenRatio, oeStatus, oeOpinion);

    // 2-2. 고저 분석
    const lows = nums.filter(n => n <= 22).length;
    const highLowRatio = `${lows}:${6-lows}`;
    let hlStatus = '보통';
    let hlOpinion = '저번호와 고번호가 고르게 섞여 있습니다.';
    if (lows >= 2 && lows <= 4) {
        hlStatus = '최적';
        hlOpinion = '저번호(1~22)와 고번호(23~45)의 균형이 매우 좋은 조합입니다.';
    } else {
        hlStatus = '주의';
        hlOpinion = '번호가 너무 낮은 쪽이나 높은 쪽으로 쏠려 있습니다.';
        totalScore -= 15;
    }
    addReportRow('고:저', highLowRatio, hlStatus, hlOpinion);

    // 2-3. 끝수 분석 (추가)
    const endDigits = nums.map(n => n % 10);
    const endSum = endDigits.reduce((a, b) => a + b, 0);
    const digitCounts = {};
    endDigits.forEach(d => digitCounts[d] = (digitCounts[d] || 0) + 1);
    const maxSameEnd = Math.max(...Object.values(digitCounts));
    
    let esStatus = '보통';
    let esOpinion = '끝수 합이 적절합니다.';
    if (endSum >= 15 && endSum <= 35) esStatus = '최적';
    addReportRow('끝수합', endSum, esStatus, '끝수(일의자리)의 합계 분석입니다.');

    let seStatus = '보통';
    let seOpinion = '동끝수가 적절히 포함되었습니다.';
    if (maxSameEnd >= 2 && maxSameEnd <= 3) {
        seStatus = '최적';
        seOpinion = '동끝수가 2~3개 포함되는 것은 당첨번호의 흔한 특징입니다.';
    }
    addReportRow('동끝수', `${maxSameEnd}개`, seStatus, seOpinion);

    // 2-4. 특수 패턴 분석 (추가)
    const squares = [1, 4, 9, 16, 25, 36];
    const squareCount = nums.filter(n => squares.includes(n)).length;
    addReportRow('제곱수', `${squareCount}개`, '보통', '1, 4, 9, 16, 25, 36 포함 개수입니다.');

    const m5Count = nums.filter(n => n % 5 === 0).length;
    addReportRow('5의배수', `${m5Count}개`, '보통', '5의 배수 포함 개수 분석입니다.');

    const doubles = [11, 22, 33, 44];
    const doubleCount = nums.filter(n => doubles.includes(n)).length;
    addReportRow('쌍수', `${doubleCount}개`, '보통', '11, 22, 33, 44 포함 개수 분석입니다.');

    // 3. 연속번호 분석
    let consecutive = 0;
    for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] + 1 === nums[i + 1]) consecutive++;
    }
    let conStatus = '최적';
    let conOpinion = '연속번호는 당첨번호에서 매우 빈번하게 등장하는 패턴입니다.';
    if (consecutive === 0) {
        conStatus = '보통';
        conOpinion = '연속번호가 없는 조합도 자주 등장하지만, 한 쌍 정도 포함하는 것도 좋습니다.';
    } else if (consecutive >= 3) {
        conStatus = '주의';
        conOpinion = '3개 이상의 번호가 연속되는 경우는 드문 패턴입니다.';
        totalScore -= 10;
    }
    addReportRow('연속번호', `${consecutive}쌍`, conStatus, conOpinion);

    // 4. 이월수 분석 (직전 회차 중복)
    const lastNums = new Set(statsData.last_draw_numbers);
    const period1Count = nums.filter(n => lastNums.has(n)).length;
    let p1Status = '최적';
    let p1Opinion = '전회차 번호가 1~2개 포함되는 것이 통계적으로 유리합니다.';
    if (period1Count === 0) {
        p1Status = '보통';
        p1Opinion = '이월수가 없는 조합입니다.';
    } else if (period1Count >= 3) {
        p1Status = '주의';
        p1Opinion = '직전 회차 번호가 3개 이상 다시 나오는 경우는 드뭅니다.';
        totalScore -= 10;
    }
    addReportRow('이월수', `${period1Count}개`, p1Status, p1Opinion);

    // 5. 이웃수 분석 (주변번호)
    const neighbors = new Set();
    statsData.last_draw_numbers.forEach(n => {
        if (n > 1) neighbors.add(n - 1);
        if (n < 45) neighbors.add(n + 1);
    });
    const neighborCount = nums.filter(n => neighbors.has(n)).length;
    let nStatus = '최적';
    let nOpinion = '이웃수는 당첨 조합의 균형을 잡아주는 중요한 데이터입니다.';
    if (neighborCount === 0) {
        nStatus = '보통';
        totalScore -= 5;
    }
    addReportRow('이웃수', `${neighborCount}개`, nStatus, nOpinion);

    // 최종 등급 계산
    let grade = 'A';
    let comment = '역대 당첨 확률이 매우 높은 황금 조합입니다!';
    if (totalScore < 70) { grade = 'D'; comment = '통계적으로 당첨 확률이 매우 낮은 특이 조합입니다.'; }
    else if (totalScore < 80) { grade = 'C'; comment = '평균에서 조금 벗어난 조합입니다. 번호를 조정해보세요.'; }
    else if (totalScore < 90) { grade = 'B'; comment = '준수한 조합입니다. 당첨 데이터 범주 안에 있습니다.'; }

    document.getElementById('combination-score').innerText = totalScore;
    document.getElementById('combination-grade').innerText = `${grade}등급`;
    document.getElementById('grade-comment').innerText = comment;
    document.getElementById('report-section').style.display = 'block';
    
    // 결과 화면으로 스크롤
    document.getElementById('report-section').scrollIntoView({ behavior: 'smooth' });
}

function addReportRow(label, value, status, opinion) {
    const tbody = document.getElementById('analysis-report-body');
    const tr = document.createElement('tr');
    
    let statusClass = 'normal';
    if (status === '최적') statusClass = 'optimal';
    else if (status === '주의') statusClass = 'warning';

    tr.innerHTML = `
        <td><strong>${label}</strong></td>
        <td>${value}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td class="text-left">${opinion}</td>
    `;
    tbody.appendChild(tr);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}