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
            
            // 직전 회차 정보 표시 (첫 번째 직전 회차만 메인에 시각화)
            if (data.last_3_draws && data.last_3_draws.length > 0) {
                const infoContainer = document.getElementById('last-draw-info');
                const ballContainer = document.getElementById('last-draw-balls');
                if (infoContainer && ballContainer) {
                    infoContainer.style.display = 'flex';
                    infoContainer.style.flexDirection = 'column';
                    infoContainer.style.alignItems = 'center';
                    ballContainer.innerHTML = '';
                    data.last_3_draws[0].forEach(num => {
                        const ball = document.createElement('div');
                        ball.classList.add('ball', 'mini', getBallColorClass(num));
                        ball.innerText = num;
                        ballContainer.appendChild(ball);
                    });
                    const label = infoContainer.querySelector('.label');
                    if (label) {
                        label.innerText = `직전 ${data.total_draws}회차 당첨 번호:`;
                    }
                }
            }

            // 데이터 로드 후 저장된 번호가 있다면 분석 실행
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) {
                renderNumbers(JSON.parse(savedNumbers), false);
            }
        })
        .catch(err => {
            console.error('Stats load failed:', err);
        });
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        console.warn('Stats data not yet loaded. Retrying in 100ms...');
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    const currentDraw = new Set(numbers);

    // 1. 회차 윈도우 기반 매칭 분석 (이월, 1~2, 1~3)
    if (statsData.last_3_draws) {
        // [이월]: 직전 1개 회차 비교
        const prev1 = new Set(statsData.last_3_draws[0]);
        const p1_cnt = [...currentDraw].filter(x => prev1.has(x)).length;
        const p1_target = document.getElementById('period-1-count');
        if (p1_target) {
            let status = (p1_cnt >= 1 && p1_cnt <= 2) ? 'optimal' : (p1_cnt >= 3 ? 'warning' : 'normal');
            updateAnalysisItem(p1_target, `${p1_cnt}개`, status);
        }

        // [1~2]: 직전 1+2회차 합집합 비교
        const prev1_2 = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1] || [])]);
        const p1_2_cnt = [...currentDraw].filter(x => prev1_2.has(x)).length;
        const p1_2_target = document.querySelector('#p1-cum-2 .value');
        if (p1_2_target) {
            let status = (p1_2_cnt >= 2 && p1_2_cnt <= 4) ? 'optimal' : 'normal';
            updateAnalysisItem(p1_2_target, `${p1_2_cnt}개`, status);
        }

        // [1~3]: 직전 1+2+3회차 합집합 비교
        const prev1_3 = new Set([
            ...statsData.last_3_draws[0], 
            ...(statsData.last_3_draws[1] || []),
            ...(statsData.last_3_draws[2] || [])
        ]);
        const p1_3_cnt = [...currentDraw].filter(x => prev1_3.has(x)).length;
        const p1_3_target = document.querySelector('#p1-cum-3 .value');
        if (p1_3_target) {
            let status = (p1_3_cnt >= 3 && p1_3_cnt <= 5) ? 'optimal' : 'normal';
            updateAnalysisItem(p1_3_target, `${p1_3_cnt}개`, status);
        }

        // 이웃수 (직전 1회차 기준 ±1)
        const neighbors = new Set();
        statsData.last_3_draws[0].forEach(n => {
            if (n > 1) neighbors.add(n - 1);
            if (n < 45) neighbors.add(n + 1);
        });
        const neighborCommon = [...currentDraw].filter(x => neighbors.has(x)).length;
        const neighborTarget = document.getElementById('neighbor-count');
        if (neighborTarget) {
            let status = (neighborCommon >= 1 && neighborCommon <= 2) ? 'optimal' : 'normal';
            updateAnalysisItem(neighborTarget, `${neighborCommon}개`, status);
        }
    }

    // 2. 기본 비율 분석
    const odds = numbers.filter(n => n % 2 !== 0).length;
    const oddEvenTarget = document.getElementById('odd-even-ratio');
    if (oddEvenTarget) {
        let status = (odds >= 2 && odds <= 4) ? 'optimal' : 'normal';
        updateAnalysisItem(oddEvenTarget, `${odds}:${6 - odds}`, status);
    }

    const lows = numbers.filter(n => n <= 22).length;
    const hlTarget = document.getElementById('high-low-ratio');
    if (hlTarget) {
        let status = (lows >= 2 && lows <= 4) ? 'optimal' : 'normal';
        updateAnalysisItem(hlTarget, `${lows}:${6 - lows}`, status);
    }

    const totalSum = numbers.reduce((a, b) => a + b, 0);
    const sumTarget = document.getElementById('total-sum');
    if (sumTarget) {
        let status = (totalSum >= 120 && totalSum <= 180) ? 'optimal' : 'warning';
        updateAnalysisItem(sumTarget, totalSum, status);
    }

    // (기타 지표들 생략/유지)
    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    const endSumTarget = document.getElementById('end-sum-value');
    if (endSumTarget) updateAnalysisItem(endSumTarget, endSum, (endSum >= 15 && endSum <= 35) ? 'optimal' : 'normal');

    const endDigits = numbers.map(n => n % 10);
    const digitCounts = {};
    endDigits.forEach(d => digitCounts[d] = (digitCounts[d] || 0) + 1);
    const maxSameEnd = Math.max(...Object.values(digitCounts));
    const sameEndTarget = document.getElementById('same-end-count');
    if (sameEndTarget) updateAnalysisItem(sameEndTarget, `${maxSameEnd}개`, (maxSameEnd >= 2 && maxSameEnd <= 3) ? 'optimal' : 'normal');

    const acVal = calculate_ac(numbers);
    const acTarget = document.getElementById('ac-value');
    if (acTarget) updateAnalysisItem(acTarget, acVal, (acVal >= 7) ? 'optimal' : 'normal');

    const spanVal = numbers[numbers.length - 1] - numbers[0];
    const spanTarget = document.getElementById('span-value');
    if (spanTarget) updateAnalysisItem(spanTarget, spanVal, (spanVal >= 25 && spanVal <= 40) ? 'optimal' : 'normal');

    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    const consecutiveTarget = document.getElementById('consecutive-count');
    if (consecutiveTarget) updateAnalysisItem(consecutiveTarget, `${consecutive}쌍`, (consecutive >= 1 && consecutive <= 2) ? 'optimal' : 'normal');
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