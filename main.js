let statsData = {};

function isPrime(num) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

// 초기 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 1. 심화 통계 데이터 로드
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
        })
        .catch(err => console.error('Stats load failed:', err));

    // 2. 이전에 생성된 번호가 있는지 확인 및 복원
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        renderNumbers(numbers, false); // 애니메이션 없이 즉시 표시
    }
});

function analyzeNumbers(numbers) {
    const odds = numbers.filter(n => n % 2 !== 0).length;
    document.getElementById('odd-even-ratio').innerText = `${odds}:${6 - odds}`;

    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    }
    document.getElementById('consecutive-count').innerText = `${consecutive}쌍`;
    document.getElementById('prime-count').innerText = `${numbers.filter(isPrime).length}개`;
    document.getElementById('composite-count').innerText = `${numbers.filter(n => n > 1 && !isPrime(n)).length}개`;
    document.getElementById('total-sum').innerText = numbers.reduce((a, b) => a + b, 0);
}

// 번호를 화면에 그리는 공통 함수
function renderNumbers(numbers, useAnimation = true) {
    const lottoContainer = document.getElementById('lotto-container');
    lottoContainer.innerHTML = ''; 

    numbers.forEach((num, index) => {
        if (useAnimation) {
            setTimeout(() => {
                const ball = document.createElement('div');
                ball.classList.add('ball', getBallColorClass(num));
                ball.innerText = num;
                lottoContainer.appendChild(ball);
                if (index === 5) analyzeNumbers(numbers);
            }, index * 100);
        } else {
            const ball = document.createElement('div');
            ball.classList.add('ball', getBallColorClass(num));
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            if (index === 5) analyzeNumbers(numbers);
        }
    });
}

document.getElementById('generate-btn').addEventListener('click', function() {
    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);

    // 로컬 스토리지에 저장
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));

    // 번호 표시 (애니메이션 포함)
    renderNumbers(numbers, true);
});