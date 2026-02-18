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

// 심화 통계 데이터 로드 및 좌측 패널 렌더링
fetch('advanced_stats.json')
    .then(res => res.json())
    .then(data => {
        statsData = data;
        renderSideStats();
    })
    .catch(err => console.error('Stats load failed:', err));

function renderSideStats() {
    // 1. 최다 당첨 TOP 5 (좌측)
    const topContainer = document.getElementById('top-stats-side');
    const sortedFreq = Object.entries(statsData.frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    sortedFreq.forEach(([num, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `
            <span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span>
            <span class="value">${count}회 당첨</span>
        `;
        topContainer.appendChild(item);
    });

    // 2. 장기 미출현 (좌측)
    const unappearedContainer = document.getElementById('unappeared-side');
    const unappearedList = Object.entries(statsData.unappeared_period)
        .filter(([, period]) => period >= 10)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    unappearedList.forEach(([num, period]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `
            <span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span>
            <span class="value">${period}회째 미출현</span>
        `;
        unappearedContainer.appendChild(item);
    });
}

function analyzeNumbers(numbers) {
    // 실시간 분석 결과 업데이트 (하단 영역)
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

document.getElementById('generate-btn').addEventListener('click', function() {
    const lottoContainer = document.getElementById('lotto-container');
    lottoContainer.innerHTML = ''; 

    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);

    numbers.forEach((num, index) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.classList.add('ball', getBallColorClass(num));
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            
            if (index === 5) analyzeNumbers(numbers);
        }, index * 100);
    });
});