let statsData = null;

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
    // 데이터 로드
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            console.log('Stats loaded successfully');
            
            // 직전 회차 정보 표시
            if (data.last_3_draws && data.last_3_draws.length > 0) {
                const infoContainer = document.getElementById('last-draw-info');
                const ballContainer = document.getElementById('last-draw-balls');
                if (infoContainer && ballContainer) {
                    infoContainer.style.display = 'flex';
                    ballContainer.innerHTML = '';
                    data.last_3_draws[0].forEach(num => {
                        const ball = document.createElement('div');
                        ball.classList.add('ball', 'mini', getBallColorClass(num));
                        ball.innerText = num;
                        ballContainer.appendChild(ball);
                    });
                }
            }

            // 저장된 번호 분석
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) {
                renderNumbers(JSON.parse(savedNumbers), false);
            }
        })
        .catch(err => console.error('Stats load failed:', err));
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        console.warn('Stats data not yet loaded.');
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    const currentDraw = new Set(numbers);
    const summary = statsData.stats_summary || {};

    // 정규분포 기반 상태 판정 함수
    const getZScoreStatus = (val, stat) => {
        if (!stat) return 'normal';
        const z = Math.abs(val - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal'; // Golden Zone (68%)
        if (z <= 2.0) return 'normal';  // Normal Zone (95%)
        return 'warning';              // Extreme Zone
    };

    // 1. 회차 상관관계
    if (statsData.last_3_draws) {
        const prev1 = new Set(statsData.last_3_draws[0]);
        const p1_cnt = [...currentDraw].filter(x => prev1.has(x)).length;
        updateAnalysisItem(document.getElementById('period-1-count'), `${p1_cnt}개`, (p1_cnt >= 1 && p1_cnt <= 2) ? 'optimal' : (p1_cnt >= 3 ? 'warning' : 'normal'));

        const prev1_2 = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1] || [])]);
        const p1_2_cnt = [...currentDraw].filter(x => prev1_2.has(x)).length;
        updateAnalysisItem(document.querySelector('#p1-cum-2 .value'), `${p1_2_cnt}개`, (p1_2_cnt >= 2 && p1_2_cnt <= 4) ? 'optimal' : 'normal');

        const prev1_3 = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1] || []), ...(statsData.last_3_draws[2] || [])]);
        const p1_3_cnt = [...currentDraw].filter(x => prev1_3.has(x)).length;
        updateAnalysisItem(document.querySelector('#p1-cum-3 .value'), `${p1_3_cnt}개`, (p1_3_cnt >= 3 && p1_3_cnt <= 5) ? 'optimal' : 'normal');

        const neighbors = new Set();
        statsData.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
        const nCnt = [...currentDraw].filter(x => neighbors.has(x)).length;
        updateAnalysisItem(document.getElementById('neighbor-count'), `${nCnt}개`, (nCnt >= 1 && nCnt <= 2) ? 'optimal' : 'normal');
    }

    // 2. 기본 균형 (정규분포 적용)
    const totalSum = numbers.reduce((a, b) => a + b, 0);
    updateAnalysisItem(document.getElementById('total-sum'), totalSum, getZScoreStatus(totalSum, summary.sum));

    const odds = numbers.filter(n => n % 2 !== 0).length;
    updateAnalysisItem(document.getElementById('odd-even-ratio'), `${odds}:${6 - odds}`, (odds >= 2 && odds <= 4) ? 'optimal' : 'normal');

    const lows = numbers.filter(n => n <= 22).length;
    updateAnalysisItem(document.getElementById('high-low-ratio'), `${lows}:${6 - lows}`, (lows >= 2 && lows <= 4) ? 'optimal' : 'normal');

    // 3. 특수수
    updateAnalysisItem(document.getElementById('prime-count'), `${numbers.filter(isPrime).length}개`, 'normal');
    updateAnalysisItem(document.getElementById('composite-count'), `${numbers.filter(isComposite).length}개`, 'normal');
    updateAnalysisItem(document.getElementById('multiple-3-count'), `${numbers.filter(n => n % 3 === 0).length}개`, 'normal');
    updateAnalysisItem(document.getElementById('multiple-5-count'), `${numbers.filter(n => n % 5 === 0).length}개`, 'normal');
    updateAnalysisItem(document.getElementById('square-count'), `${numbers.filter(n => [1,4,9,16,25,36].includes(n)).length}개`, 'normal');
    updateAnalysisItem(document.getElementById('double-count'), `${numbers.filter(n => [11,22,33,44].includes(n)).length}개`, 'normal');

    // 4. 구간/패턴
    updateAnalysisItem(document.getElementById('bucket-15-count'), `${new Set(numbers.map(n => Math.floor((n-1)/15))).size}구간`, 'normal');
    updateAnalysisItem(document.getElementById('bucket-9-count'), `${new Set(numbers.map(n => Math.floor((n-1)/9))).size}구간`, 'normal');
    updateAnalysisItem(document.getElementById('bucket-3-count'), `${new Set(numbers.map(n => Math.floor((n-1)/3))).size}구간`, 'normal');
    updateAnalysisItem(document.getElementById('color-count'), `${new Set(numbers.map(getBallColorClass)).size}색`, 'normal');

    // 5. 전문지표 (정규분포 적용)
    const acVal = calculate_ac(numbers);
    updateAnalysisItem(document.getElementById('ac-value'), acVal, getZScoreStatus(acVal, summary.ac));

    const spanVal = numbers[numbers.length - 1] - numbers[0];
    updateAnalysisItem(document.getElementById('span-value'), spanVal, getZScoreStatus(spanVal, summary.span));

    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    updateAnalysisItem(document.getElementById('end-sum-value'), endSum, 'normal');

    const endDigits = numbers.map(n => n % 10);
    const maxSameEnd = Math.max(...Object.values(Counter(endDigits)));
    updateAnalysisItem(document.getElementById('same-end-count'), `${maxSameEnd}개`, 'normal');

    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    updateAnalysisItem(document.getElementById('consecutive-count'), `${consecutive}쌍`, 'normal');
}

function Counter(array) {
    const counts = {};
    array.forEach(x => counts[x] = (counts[x] || 0) + 1);
    return counts;
}

function updateAnalysisItem(element, text, status) {
    if (!element) return;
    element.innerText = text;
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.classList.remove('optimal', 'normal', 'warning');
        parent.classList.add(status);
    }
}

function renderNumbers(numbers, useAnimation = true) {
    const lottoContainer = document.getElementById('lotto-container');
    if (!lottoContainer) return;
    lottoContainer.innerHTML = ''; 

    numbers.forEach((num, index) => {
        const createBall = () => {
            const ball = document.createElement('div');
            ball.classList.add('ball', getBallColorClass(num));
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            if (index === 5) analyzeNumbers(numbers);
        };
        if (useAnimation) setTimeout(createBall, index * 100);
        else createBall();
    });
}

document.getElementById('generate-btn')?.addEventListener('click', function() {
    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));
    renderNumbers(numbers, true);
});