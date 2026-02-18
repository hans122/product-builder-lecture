let frequencyData = {};

// 소수 여부 판별 함수 (1~45 범위)
function isPrime(num) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

// 합성수 여부 판별 함수 (1~45 범위, 1은 제외)
function isComposite(num) {
    if (num === 1) return false;
    return !isPrime(num);
}

// 빈도 데이터 로드
fetch('frequency.json')
    .then(response => response.json())
    .then(data => {
        frequencyData = data;
        displayTopStats();
    })
    .catch(err => console.error('데이터 로드 실패:', err));

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

function displayTopStats() {
    const statsContainer = document.getElementById('top-stats');
    const sorted = Object.entries(frequencyData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    sorted.forEach(([num, count]) => {
        const wrapper = document.createElement('div');
        const ball = document.createElement('div');
        ball.classList.add('ball', getBallColorClass(parseInt(num)));
        ball.innerText = num;
        const label = document.createElement('span');
        label.classList.add('freq-label');
        label.innerText = `${count}회`;
        wrapper.appendChild(ball);
        wrapper.appendChild(label);
        statsContainer.appendChild(wrapper);
    });
}

function analyzeNumbers(numbers) {
    // 1. 홀짝 비율
    const odds = numbers.filter(n => n % 2 !== 0).length;
    const evens = 6 - odds;
    document.getElementById('odd-even-ratio').innerText = `${odds} : ${evens}`;

    // 2. 연속 번호 개수
    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] + 1 === numbers[i + 1]) {
            consecutive++;
        }
    }
    document.getElementById('consecutive-count').innerText = `${consecutive}쌍`;

    // 3. 소수 개수
    const primeCount = numbers.filter(isPrime).length;
    document.getElementById('prime-count').innerText = `${primeCount}개`;

    // 4. 합성수 개수 (1 제외)
    const compositeCount = numbers.filter(isComposite).length;
    document.getElementById('composite-count').innerText = `${compositeCount}개`;

    // 5. 총합
    const sum = numbers.reduce((a, b) => a + b, 0);
    document.getElementById('total-sum').innerText = sum;
}

document.getElementById('generate-btn').addEventListener('click', function() {
    const lottoContainer = document.getElementById('lotto-container');
    lottoContainer.innerHTML = ''; 

    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) {
            numbers.push(num);
        }
    }

    numbers.sort((a, b) => a - b);

    // 번호 표시 애니메이션
    numbers.forEach((num, index) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.classList.add('ball', getBallColorClass(num));
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            
            // 마지막 공이 나올 때 분석 결과 업데이트
            if (index === 5) {
                analyzeNumbers(numbers);
            }
        }, index * 100);
    });
});