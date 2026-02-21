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
                    if (label) label.innerText = `직전 ${data.total_draws}회차 당첨 번호:`;
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
            // 에러 시 사용자에게 알림 (개발자 도구 콘솔 확인용)
        });
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        console.warn('Stats data not yet loaded. Retrying in 100ms...');
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    // 1. 직전 회차 출현 (전회차 중복)
    if (statsData.last_draw_numbers) {
        const lastDraw = new Set(statsData.last_draw_numbers);
        const currentDraw = new Set(numbers);
        const common = [...currentDraw].filter(x => lastDraw.has(x)).length;
        const target = document.getElementById('period-1-count');
        if (target) target.innerText = `${common}개`;

        // 1-2. 주변번호 출현 (이웃수)
        const neighbors = new Set();
        statsData.last_draw_numbers.forEach(n => {
            if (n > 1) neighbors.add(n - 1);
            if (n < 45) neighbors.add(n + 1);
        });
        const neighborCommon = [...currentDraw].filter(x => neighbors.has(x)).length;
        const neighborTarget = document.getElementById('neighbor-count');
        if (neighborTarget) neighborTarget.innerText = `${neighborCommon}개`;
    }

    // 2. 홀짝 비율
    const odds = numbers.filter(n => n % 2 !== 0).length;
    const oddEvenTarget = document.getElementById('odd-even-ratio');
    if (oddEvenTarget) oddEvenTarget.innerText = `${odds}:${6 - odds}`;

    // 3. 연속번호
    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    }
    const consecutiveTarget = document.getElementById('consecutive-count');
    if (consecutiveTarget) consecutiveTarget.innerText = `${consecutive}쌍`;

    // 4. 소수
    const primeTarget = document.getElementById('prime-count');
    if (primeTarget) primeTarget.innerText = `${numbers.filter(isPrime).length}개`;

    // 5. 합성수
    const compositeTarget = document.getElementById('composite-count');
    if (compositeTarget) {
        const compositeCount = numbers.filter(isComposite).length;
        compositeTarget.innerText = `${compositeCount}개`;
    }

    // 6. 3배수
    const multiple3Target = document.getElementById('multiple-3-count');
    if (multiple3Target) {
        const m3Count = numbers.filter(n => n % 3 === 0).length;
        multiple3Target.innerText = `${m3Count}개`;
    }

    // 7. 총합
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