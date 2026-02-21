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
            if (data.last_draw_numbers && data.total_draws) {
                const infoContainer = document.getElementById('last-draw-info');
                const ballContainer = document.getElementById('last-draw-balls');
                if (infoContainer && ballContainer) {
                    infoContainer.style.display = 'flex';
                    infoContainer.style.flexDirection = 'column';
                    infoContainer.style.alignItems = 'center';
                    ballContainer.innerHTML = '';
                    data.last_draw_numbers.forEach(num => {
                        const ball = document.createElement('div');
                        ball.classList.add('ball', 'mini', getBallColorClass(num));
                        ball.innerText = num;
                        ballContainer.appendChild(ball);
                    });
                    const label = infoContainer.querySelector('.label');
                    if (label) {
                        let drawDate = '';
                        if (data.recent_draws && data.recent_draws.length > 0) {
                            drawDate = ` (${data.recent_draws[0].date})`;
                        }
                        label.innerText = `직전 ${data.total_draws}회차 당첨 번호${drawDate}:`;
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

    // 1. 직전 회차 출현
    if (statsData.last_draw_numbers) {
        const lastDraw = new Set(statsData.last_draw_numbers);
        const common = [...currentDraw].filter(x => lastDraw.has(x)).length;
        const target = document.getElementById('period-1-count');
        if (target) target.innerText = `${common}개`;

        const neighbors = new Set();
        statsData.last_draw_numbers.forEach(n => {
            if (n > 1) neighbors.add(n - 1);
            if (n < 45) neighbors.add(n + 1);
        });
        const neighborCommon = [...currentDraw].filter(x => neighbors.has(x)).length;
        const neighborTarget = document.getElementById('neighbor-count');
        if (neighborTarget) neighborTarget.innerText = `${neighborCommon}개`;
    }

    // 2. 기본 비율 및 수 분석
    const odds = numbers.filter(n => n % 2 !== 0).length;
    const oddEvenTarget = document.getElementById('odd-even-ratio');
    if (oddEvenTarget) oddEvenTarget.innerText = `${odds}:${6 - odds}`;

    const lows = numbers.filter(n => n <= 22).length;
    const hlTarget = document.getElementById('high-low-ratio');
    if (hlTarget) hlTarget.innerText = `${lows}:${6 - lows}`;

    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    const endSumTarget = document.getElementById('end-sum-value');
    if (endSumTarget) endSumTarget.innerText = endSum;

    const endDigits = numbers.map(n => n % 10);
    const digitCounts = {};
    endDigits.forEach(d => digitCounts[d] = (digitCounts[d] || 0) + 1);
    const maxSameEnd = Math.max(...Object.values(digitCounts));
    const sameEndTarget = document.getElementById('same-end-count');
    if (sameEndTarget) sameEndTarget.innerText = `${maxSameEnd}개`;

    const squares = [1, 4, 9, 16, 25, 36];
    const squareCount = numbers.filter(n => squares.includes(n)).length;
    const squareTarget = document.getElementById('square-count');
    if (squareTarget) squareTarget.innerText = `${squareCount}개`;

    const m5Count = numbers.filter(n => n % 5 === 0).length;
    const m5Target = document.getElementById('multiple-5-count');
    if (m5Target) m5Target.innerText = `${m5Count}개`;

    const doubles = [11, 22, 33, 44];
    const doubleCount = numbers.filter(n => doubles.includes(n)).length;
    const doubleTarget = document.getElementById('double-count');
    if (doubleTarget) doubleTarget.innerText = `${doubleCount}개`;

    // 3. 심화 분석: 구간 및 패턴
    // 3단위 구간 출현 개수
    const b3Count = new Set(numbers.map(n => Math.floor((n-1)/3))).size;
    const b3Target = document.getElementById('bucket-3-count');
    if (b3Target) b3Target.innerText = `${b3Count}구간`;

    // 용지 패턴 (모서리, 삼각형)
    const corners = new Set([1, 2, 8, 9, 6, 7, 13, 14, 29, 30, 36, 37, 34, 35, 41, 42]);
    const triangle = new Set([4, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 32]);
    const pCornerCnt = numbers.filter(n => corners.has(n)).length;
    const pTriCnt = numbers.filter(n => triangle.has(n)).length;
    
    const pcTarget = document.getElementById('pattern-corner-count');
    if (pcTarget) pcTarget.innerText = `${pCornerCnt}개`;
    const ptTarget = document.getElementById('pattern-triangle-count');
    if (ptTarget) ptTarget.innerText = `${pTriCnt}개`;

    // 4. 기존 항목 마무리
    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    }
    const consecutiveTarget = document.getElementById('consecutive-count');
    if (consecutiveTarget) consecutiveTarget.innerText = `${consecutive}쌍`;

    const primeTarget = document.getElementById('prime-count');
    if (primeTarget) primeTarget.innerText = `${numbers.filter(isPrime).length}개`;

    const compositeTarget = document.getElementById('composite-count');
    if (compositeTarget) compositeTarget.innerText = `${numbers.filter(isComposite).length}개`;

    const multiple3Target = document.getElementById('multiple-3-count');
    if (multiple3Target) multiple3Target.innerText = `${numbers.filter(n => n % 3 === 0).length}개`;

    const sumTarget = document.getElementById('total-sum');
    if (sumTarget) sumTarget.innerText = numbers.reduce((a, b) => a + b, 0);
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

        if (useAnimation) {
            setTimeout(createBall, index * 100);
        } else {
            createBall();
        }
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