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
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
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
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) {
                renderNumbers(JSON.parse(savedNumbers), false);
            }
        })
        .catch(err => console.error('Stats load failed:', err));
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    const currentDraw = new Set(numbers);
    const summary = statsData.stats_summary || {};

    const getZScoreStatus = (val, stat) => {
        if (!stat) return 'safe';
        const z = Math.abs(val - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    };

    // 1. 회차 상관관계
    const p1_cnt = [...currentDraw].filter(x => new Set(statsData.last_3_draws[0]).has(x)).length;
    updateAnalysisItem(document.getElementById('period-1-count'), `${p1_cnt}개`, getZScoreStatus(p1_cnt, summary.period_1), '이월수(직전)', summary.period_1);

    const p1_2_cnt = [...currentDraw].filter(x => new Set([...statsData.last_3_draws[0], ...statsData.last_3_draws[1]]).has(x)).length;
    updateAnalysisItem(document.querySelector('#p1-cum-2 .value'), `${p1_2_cnt}개`, getZScoreStatus(p1_2_cnt, summary.period_1_2), '이월수(1~2전)', summary.period_1_2);

    const p1_3_cnt = [...currentDraw].filter(x => new Set([...statsData.last_3_draws[0], ...statsData.last_3_draws[1], ...statsData.last_3_draws[2]]).has(x)).length;
    updateAnalysisItem(document.querySelector('#p1-cum-3 .value'), `${p1_3_cnt}개`, getZScoreStatus(p1_3_cnt, summary.period_1_3), '이월수(1~3전)', summary.period_1_3);

    const neighbors = new Set();
    statsData.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
    const nCnt = [...currentDraw].filter(x => neighbors.has(x)).length;
    updateAnalysisItem(document.getElementById('neighbor-count'), `${nCnt}개`, getZScoreStatus(nCnt, summary.neighbor), '이웃수', summary.neighbor);

    // 2. 기본 균형
    const totalSum = numbers.reduce((a, b) => a + b, 0);
    updateAnalysisItem(document.getElementById('total-sum'), totalSum, getZScoreStatus(totalSum, summary.sum), '합계', summary.sum);

    const odds = numbers.filter(n => n % 2 !== 0).length;
    updateAnalysisItem(document.getElementById('odd-even-ratio'), `${odds}:${6 - odds}`, getZScoreStatus(odds, summary.odd_count), '홀수', summary.odd_count);

    const lows = numbers.filter(n => n <= 22).length;
    updateAnalysisItem(document.getElementById('high-low-ratio'), `${lows}:${6 - lows}`, getZScoreStatus(lows, summary.low_count), '저번호', summary.low_count);

    // 3. 특수수
    updateAnalysisItem(document.getElementById('prime-count'), `${numbers.filter(isPrime).length}개`, getZScoreStatus(numbers.filter(isPrime).length, summary.prime), '소수', summary.prime);
    updateAnalysisItem(document.getElementById('composite-count'), `${numbers.filter(isComposite).length}개`, getZScoreStatus(numbers.filter(isComposite).length, summary.composite), '합성수', summary.composite);
    updateAnalysisItem(document.getElementById('multiple-3-count'), `${numbers.filter(n => n % 3 === 0).length}개`, getZScoreStatus(numbers.filter(n => n % 3 === 0).length, summary.multiple_3), '3배수', summary.multiple_3);
    updateAnalysisItem(document.getElementById('multiple-5-count'), `${numbers.filter(n => n % 5 === 0).length}개`, getZScoreStatus(numbers.filter(n => n % 5 === 0).length, summary.multiple_5), '5배수', summary.multiple_5);
    updateAnalysisItem(document.getElementById('square-count'), `${numbers.filter(n => [1,4,9,16,25,36].includes(n)).length}개`, getZScoreStatus(numbers.filter(n => [1,4,9,16,25,36].includes(n)).length, summary.square), '제곱수', summary.square);
    updateAnalysisItem(document.getElementById('double-count'), `${numbers.filter(n => [11,22,33,44].includes(n)).length}개`, getZScoreStatus(numbers.filter(n => [11,22,33,44].includes(n)).length, summary.double_num), '쌍수', summary.double_num);

    // 4. 구간/패턴
    updateAnalysisItem(document.getElementById('bucket-15-count'), `${new Set(numbers.map(n => Math.floor((n-1)/15))).size}구간`, getZScoreStatus(new Set(numbers.map(n => Math.floor((n-1)/15))).size, summary.bucket_15), '3분할', summary.bucket_15);
    updateAnalysisItem(document.getElementById('bucket-9-count'), `${new Set(numbers.map(n => Math.floor((n-1)/9))).size}구간`, getZScoreStatus(new Set(numbers.map(n => Math.floor((n-1)/9))).size, summary.bucket_9), '5분할', summary.bucket_9);
    updateAnalysisItem(document.getElementById('bucket-3-count'), `${new Set(numbers.map(n => Math.floor((n-1)/3))).size}구간`, getZScoreStatus(new Set(numbers.map(n => Math.floor((n-1)/3))).size, summary.bucket_3), '15분할', summary.bucket_3);
    updateAnalysisItem(document.getElementById('color-count'), `${new Set(numbers.map(getBallColorClass)).size}색`, getZScoreStatus(new Set(numbers.map(getBallColorClass)).size, summary.color), '색상수', summary.color);
    updateAnalysisItem(document.getElementById('pattern-corner-count'), `${numbers.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length}개`, getZScoreStatus(numbers.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length, summary.pattern_corner), '모서리', summary.pattern_corner);
    updateAnalysisItem(document.getElementById('pattern-triangle-count'), `${numbers.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length}개`, getZScoreStatus(numbers.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length, summary.pattern_triangle), '삼각형', summary.pattern_triangle);

    // 5. 전문지표
    const acVal = calculate_ac(numbers);
    updateAnalysisItem(document.getElementById('ac-value'), acVal, getZScoreStatus(acVal, summary.ac), 'AC값', summary.ac);

    const spanVal = numbers[numbers.length - 1] - numbers[0];
    updateAnalysisItem(document.getElementById('span-value'), spanVal, getZScoreStatus(spanVal, summary.span), 'Span', summary.span);

    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    updateAnalysisItem(document.getElementById('end-sum-value'), endSum, getZScoreStatus(endSum, summary.end_sum), '끝수합', summary.end_sum);

    const endDigits = numbers.map(n => n % 10);
    const maxSameEnd = Math.max(...Object.values(Counter(endDigits)));
    updateAnalysisItem(document.getElementById('same-end-count'), `${maxSameEnd}개`, getZScoreStatus(maxSameEnd, summary.same_end), '동끝수', summary.same_end);

    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    updateAnalysisItem(document.getElementById('consecutive-count'), `${consecutive}쌍`, getZScoreStatus(consecutive, summary.consecutive), '연번', summary.consecutive);
}

function Counter(array) {
    const counts = {};
    array.forEach(x => counts[x] = (counts[x] || 0) + 1);
    return counts;
}

function updateAnalysisItem(element, text, status, label, stat) {
    if (!element) return;
    element.innerText = text;
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.classList.remove('optimal', 'safe', 'warning', 'normal');
        parent.classList.add(status);
        
        // 실시간 툴팁 반영
        const link = element.closest('.analysis-item-link');
        if (link && stat) {
            const optMin = Math.max(0, Math.round(stat.mean - stat.std));
            const optMax = Math.round(stat.mean + stat.std);
            const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            const safeMax = Math.round(stat.mean + 2 * stat.std);
            
            const tipText = `[${label}] 권장 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})`;
            link.setAttribute('data-tip', tipText);
        }
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

document.getElementById('generate-btn')?.addEventListener('click', function() {
    if (!statsData || !statsData.frequency) {
        const numbers = [];
        while(numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if(!numbers.includes(num)) numbers.push(num);
        }
        numbers.sort((a, b) => a - b);
        renderNumbers(numbers, true);
        return;
    }

    const zones = getZones(statsData);
    let numbers = [
        ...getRandomFrom(zones.gold, 2),
        ...getRandomFrom(zones.silver, 3),
        ...getRandomFrom(zones.normal, 1)
    ];

    numbers.sort((a, b) => a - b);
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));
    renderNumbers(numbers, true);
});