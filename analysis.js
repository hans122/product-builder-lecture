document.addEventListener('DOMContentLoaded', function() {
    fetch('frequency.json')
        .then(response => response.json())
        .then(data => {
            renderFrequencyChart(data);
            renderTop10(data);
            renderBottom5(data);
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
    const sorted = Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    sorted.forEach(([num, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `
            <span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span>
            <span class="freq-value"><strong>${count}</strong>회 출현</span>
        `;
        container.appendChild(item);
    });
}

function renderBottom5(data) {
    const container = document.getElementById('bottom-5-list');
    const sorted = Object.entries(data)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 5);

    sorted.forEach(([num, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';
        item.innerHTML = `
            <span class="ball mini ${getBallColorClass(parseInt(num))}">${num}</span>
            <span class="freq-value"><strong>${count}</strong>회 출현</span>
        `;
        container.appendChild(item);
    });
}