document.addEventListener('DOMContentLoaded', function() {
    // 1. 역대 통계 데이터 로드
    fetch('advanced_stats.json')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.distributions) return;
            renderDistChart('odd-even-chart', Object.fromEntries(Object.entries(data.distributions.odd_even).sort()));
            renderDistChart('consecutive-chart', data.distributions.consecutive);
            renderDistChart('prime-chart', data.distributions.prime);
            
            if (data.distributions.composite) {
                renderDistChart('composite-chart', data.distributions.composite);
            } else {
                renderDistChart('composite-chart', data.distributions.prime); 
            }
            
            const sortedSum = Object.fromEntries(
                Object.entries(data.distributions.sum).sort((a, b) => parseInt(a[0].split('-')[0]) - parseInt(b[0].split('-')[0]))
            );
            renderDistChart('sum-chart', sortedSum);
            renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('데이터 로드 실패:', err));

    // 2. 내가 마지막으로 생성한 번호 복원 (추가된 부분)
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        const section = document.getElementById('my-numbers-section');
        const list = document.getElementById('my-numbers-list');
        
        section.style.display = 'flex';
        numbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball mini ${getBallColorClass(num)}`;
            ball.innerText = num;
            list.appendChild(ball);
        });
    }
});

function renderDistChart(elementId, distData) {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = '';
    const maxVal = Math.max(...Object.values(distData), 1);

    Object.entries(distData).forEach(([label, value]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        bar.innerHTML = `
            <span class="dist-value">${value}</span>
            <span class="dist-label">${label}</span>
        `;
        container.appendChild(bar);
    });
}

function renderFrequencyChart(data) {
    const chartContainer = document.getElementById('full-frequency-chart');
    if(!chartContainer) return;
    chartContainer.innerHTML = '';
    
    const maxFreq = Math.max(...Object.values(data), 1);
    for (let i = 1; i <= 45; i++) {
        const freq = data[i] || 0;
        const height = (freq / maxFreq) * 85;
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        const bar = document.createElement('div');
        bar.className = `bar ${getBallColorClass(i)}`;
        bar.style.height = `${height}%`;
        const valSpan = document.createElement('span');
        valSpan.className = 'bar-value';
        valSpan.innerText = freq;
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = i;
        barWrapper.appendChild(valSpan);
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    }
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}