document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json')
        .then(response => response.json())
        .then(data => {
            renderFrequencyChart(data.frequency);
            renderTop10(data.frequency);
            renderBottom5(data.frequency);
            renderUnappeared(data.unappeared_period);
            renderCompatibility(data.compatibility);
        });
});

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

function renderFrequencyChart(data) {
    const chartContainer = document.getElementById('full-frequency-chart');
    const maxFreq = Math.max(...Object.values(data));
    chartContainer.innerHTML = '';

    for (let i = 1; i <= 45; i++) {
        const freq = data[i] || 0;
        const heightPercentage = (freq / maxFreq) * 100;
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        const bar = document.createElement('div');
        bar.className = `bar ${getBallColorClass(i)}`;
        bar.style.height = `${heightPercentage}%`;
        bar.title = `${i}번: ${freq}회`;
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = i;
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    }
}

function renderTop10(data) {
    const container = document.getElementById('top-10-list');
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 10);
    container.innerHTML = '';
    sorted.forEach(([num, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `<span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span><span class="freq-value"><strong>${count}</strong>회</span>`;
        container.appendChild(item);
    });
}

function renderBottom5(data) {
    const container = document.getElementById('bottom-5-list');
    const sorted = Object.entries(data).sort(([, a], [, b]) => a - b).slice(0, 5);
    container.innerHTML = '';
    sorted.forEach(([num, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `<span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span><span class="freq-value"><strong>${count}</strong>회</span>`;
        container.appendChild(item);
    });
}

function renderUnappeared(data) {
    const container = document.getElementById('unappeared-list');
    container.innerHTML = '';
    const longUnappeared = Object.entries(data)
        .filter(([, period]) => period >= 10)
        .sort(([, a], [, b]) => b - a);

    longUnappeared.forEach(([num, period]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `<span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span><span class="freq-value"><strong>${period}</strong>회째 미출현</span>`;
        container.appendChild(item);
    });
}

function renderCompatibility(data) {
    const container = document.getElementById('compatibility-list');
    container.innerHTML = '';
    // 예시로 가장 많이 나온 숫자 상위 3개에 대한 궁합수 표시
    const focusNumbers = ['1', '34', '27', '43', '17']; // 예시 주요 숫자

    focusNumbers.forEach(num => {
        const companions = data[num] || [];
        const item = document.createElement('div');
        item.className = 'stats-list-item combo';
        
        let companionBalls = companions.map(c => `<span class="ball mini ${getBallColorClass(parseInt(c))}">${c}</span>`).join('');
        
        item.innerHTML = `
            <div class="main-num">
                <span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span>
                <span class="arrow">➔</span>
            </div>
            <div class="companions">${companionBalls}</div>
        `;
        container.appendChild(item);
    });
}