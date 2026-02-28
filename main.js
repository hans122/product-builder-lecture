let statsData = null;

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
            if (savedNumbers) renderNumbers(JSON.parse(savedNumbers), false);
        })
        .catch(err => console.error('Stats load failed:', err));
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    const summary = statsData.stats_summary || {};
    const getZStatus = (val, stat) => {
        if (!stat || stat.std === 0) return 'safe';
        const z = Math.abs(val - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    };

    // [G1] 기본 균형
    const sum = numbers.reduce((a, b) => a + b, 0);
    updateAnalysisItem(document.getElementById('total-sum'), sum, getZStatus(sum, summary.sum), '합계', summary.sum);
    const odds = numbers.filter(n => n % 2 !== 0).length;
    updateAnalysisItem(document.getElementById('odd-even-ratio'), `${odds}:${6-odds}`, getZStatus(odds, summary.odd_count), '홀수', summary.odd_count);
    const lows = numbers.filter(n => n <= 22).length;
    updateAnalysisItem(document.getElementById('high-low-ratio'), `${lows}:${6-lows}`, getZStatus(lows, summary.low_count), '저번호', summary.low_count);

    // [G2] 상관관계
    const p1 = numbers.filter(n => new Set(statsData.last_3_draws[0]).has(n)).length;
    updateAnalysisItem(document.getElementById('period-1-count'), `${p1}개`, getZStatus(p1, summary.period_1), '이월수', summary.period_1);
    const neighbors = new Set();
    statsData.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
    const nCnt = numbers.filter(n => neighbors.has(n)).length;
    updateAnalysisItem(document.getElementById('neighbor-count'), `${nCnt}개`, getZStatus(nCnt, summary.neighbor), '이웃수', summary.neighbor);
    const p1_2 = numbers.filter(n => new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[])]).has(n)).length;
    updateAnalysisItem(document.querySelector('#p1-cum-2 .value'), `${p1_2}개`, getZStatus(p1_2, summary.period_1_2), '1~2회전', summary.period_1_2);
    const p1_3 = numbers.filter(n => new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[]), ...(statsData.last_3_draws[2]||[])]).has(n)).length;
    updateAnalysisItem(document.querySelector('#p1-cum-3 .value'), `${p1_3}개`, getZStatus(p1_3, summary.period_1_3), '1~3회전', summary.period_1_3);
    let consecutive = 0;
    for (let i=0; i<5; i++) if(numbers[i]+1 === numbers[i+1]) consecutive++;
    updateAnalysisItem(document.getElementById('consecutive-count'), `${consecutive}쌍`, getZStatus(consecutive, summary.consecutive), '연번', summary.consecutive);

    // [G3] 특수번호
    updateAnalysisItem(document.getElementById('prime-count'), `${numbers.filter(isPrime).length}개`, getZStatus(numbers.filter(isPrime).length, summary.prime), '소수', summary.prime);
    updateAnalysisItem(document.getElementById('composite-count'), `${numbers.filter(isComposite).length}개`, getZStatus(numbers.filter(isComposite).length, summary.composite), '합성수', summary.composite);
    updateAnalysisItem(document.getElementById('multiple-3-count'), `${numbers.filter(n => n % 3 === 0).length}개`, getZStatus(numbers.filter(n => n % 3 === 0).length, summary.multiple_3), '3배수', summary.multiple_3);
    updateAnalysisItem(document.getElementById('multiple-5-count'), `${numbers.filter(n => n % 5 === 0).length}개`, getZStatus(numbers.filter(n => n % 5 === 0).length, summary.multiple_5), '5배수', summary.multiple_5);
    updateAnalysisItem(document.getElementById('square-count'), `${numbers.filter(n => [1,4,9,16,25,36].includes(n)).length}개`, getZStatus(numbers.filter(n => [1,4,9,16,25,36].includes(n)).length, summary.square), '제곱수', summary.square);
    updateAnalysisItem(document.getElementById('double-count'), `${numbers.filter(n => [11,22,33,44].includes(n)).length}개`, getZStatus(numbers.filter(n => [11,22,33,44].includes(n)).length, summary.double_num), '쌍수', summary.double_num);

    // [G4] 구간/패턴
    updateAnalysisItem(document.getElementById('bucket-15-count'), `${new Set(numbers.map(n => Math.floor((n-1)/15))).size}구간`, getZStatus(new Set(numbers.map(n => Math.floor((n-1)/15))).size, summary.bucket_15), '3분할', summary.bucket_15);
    updateAnalysisItem(document.getElementById('bucket-9-count'), `${new Set(numbers.map(n => Math.floor((n-1)/9))).size}구간`, getZStatus(new Set(numbers.map(n => Math.floor((n-1)/9))).size, summary.bucket_9), '5분할', summary.bucket_9);
    updateAnalysisItem(document.getElementById('bucket-5-count'), `${new Set(numbers.map(n => Math.floor((n-1)/5))).size}구간`, getZStatus(new Set(numbers.map(n => Math.floor((n-1)/5))).size, summary.bucket_5), '9분할', summary.bucket_5);
    updateAnalysisItem(document.getElementById('bucket-3-count'), `${new Set(numbers.map(n => Math.floor((n-1)/3))).size}구간`, getZStatus(new Set(numbers.map(n => Math.floor((n-1)/3))).size, summary.bucket_3), '15분할', summary.bucket_3);
    updateAnalysisItem(document.getElementById('color-count'), `${new Set(numbers.map(getBallColorClass)).size}색`, getZStatus(new Set(numbers.map(getBallColorClass)).size, summary.color), '색상수', summary.color);
    const cCnt = numbers.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length;
    updateAnalysisItem(document.getElementById('pattern-corner-count'), `${cCnt}개`, getZStatus(cCnt, summary.pattern_corner), '모서리', summary.pattern_corner);
    const tCnt = numbers.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length;
    updateAnalysisItem(document.getElementById('pattern-triangle-count'), `${tCnt}개`, getZStatus(tCnt, summary.pattern_triangle), '삼각형', summary.pattern_triangle);

    // [G5] 전문지표
    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    updateAnalysisItem(document.getElementById('end-sum-value'), endSum, getZStatus(endSum, summary.end_sum), '끝수합', summary.end_sum);
    const endDigits = numbers.map(n => n % 10);
    const maxSE = Math.max(...Object.values(endDigits.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {})));
    updateAnalysisItem(document.getElementById('same-end-count'), `${maxSE}개`, getZStatus(maxSE, summary.same_end), '동끝수', summary.same_end);
    const ac = calculate_ac(numbers);
    updateAnalysisItem(document.getElementById('ac-value'), ac, getZStatus(ac, summary.ac), 'AC값', summary.ac);
    const span = numbers[5] - numbers[0];
    updateAnalysisItem(document.getElementById('span-value'), span, getZStatus(span, summary.span), 'Span', summary.span);
}

function updateAnalysisItem(element, text, status, label, stat) {
    if (!element) return;
    element.innerText = text;
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.className = 'analysis-item ' + status;
        const link = element.closest('.analysis-item-link');
        if (link && stat) {
            const optMin = Math.max(0, Math.round(stat.mean - stat.std));
            const optMax = Math.round(stat.mean + stat.std);
            const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            const safeMax = Math.round(stat.mean + 2 * stat.std);
            link.setAttribute('data-tip', `[${label}] 권장 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})`);
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
            ball.className = 'ball ' + getBallColorClass(num);
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
        const nums = [];
        while(nums.length < 6) { const n = Math.floor(Math.random() * 45) + 1; if(!nums.includes(n)) nums.push(n); }
        nums.sort((a, b) => a - b);
        renderNumbers(nums, true);
        return;
    }
    const zones = getZones(statsData);
    let numbers = [...getRandomFrom(zones.gold, 2), ...getRandomFrom(zones.silver, 3), ...getRandomFrom(zones.normal, 1)];
    numbers.sort((a, b) => a - b);
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));
    renderNumbers(numbers, true);
});