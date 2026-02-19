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

    // 1. 1회기 통계 (전회차 중복)
    if (statsData.last_draw_numbers) {
        const lastDraw = new Set(statsData.last_draw_numbers);
        const currentDraw = new Set(numbers);
        const common = [...currentDraw].filter(x => lastDraw.has(x)).length;
        const target = document.getElementById('period-1-count');
        if (target) target.innerText = `${common}개`;
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

    // 6. 총합
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