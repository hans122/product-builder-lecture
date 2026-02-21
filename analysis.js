document.addEventListener('DOMContentLoaded', function() {
    console.log('Analysis Page Loaded');
    
    // 데이터 로드
    fetch('advanced_stats.json?v=' + Date.now()) // 캐시 방지
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            if (!data || !data.distributions) return;

            const dists = data.distributions;

            // 1. 홀짝 비율
            if (dists.odd_even) {
                renderDistChart('odd-even-chart', Object.fromEntries(Object.entries(dists.odd_even).sort()), ' : ');
            }

            // 2. 직전 회차 출현 개수 (전회차 중복)
            if (dists.period_1) {
                const sortedPeriod1 = {};
                for(let i=0; i<=6; i++) {
                    if (dists.period_1[i] !== undefined) {
                        sortedPeriod1[i] = dists.period_1[i];
                    }
                }
                renderDistChart('period-1-chart', sortedPeriod1, '개');
            }

            // 3. 주변번호 출현 개수 (이웃수)
            if (dists.neighbor) {
                const sortedNeighbor = {};
                for(let i=0; i<=6; i++) {
                    if (dists.neighbor[i] !== undefined) {
                        sortedNeighbor[i] = dists.neighbor[i];
                    }
                }
                renderDistChart('neighbor-chart', sortedNeighbor, '개');
            }

            // 4. 연속번호
            if (dists.consecutive) {
                renderDistChart('consecutive-chart', Object.fromEntries(Object.entries(dists.consecutive).sort((a,b)=>a[0]-b[0])), '쌍');
            }

            // 5. 소수 개수
            if (dists.prime) {
                renderDistChart('prime-chart', Object.fromEntries(Object.entries(dists.prime).sort((a,b)=>a[0]-b[0])), '개');
            }
            
            // 6. 합성수
            if (dists.composite) {
                renderDistChart('composite-chart', Object.fromEntries(Object.entries(dists.composite).sort((a,b)=>a[0]-b[0])), '개');
            }

            // 7. 3배수
            if (dists.multiple_3) {
                renderDistChart('multiple-3-chart', Object.fromEntries(Object.entries(dists.multiple_3).sort((a,b)=>a[0]-b[0])), '개');
            }
            
            // 8. 총합 분포
            if (dists.sum) {
                const sortedSum = Object.fromEntries(
                    Object.entries(dists.sum).sort((a, b) => parseInt(a[0].split('-')[0]) - parseInt(b[0].split('-')[0]))
                );
                renderDistChart('sum-chart', sortedSum, '');
            }

            // 9. 전체 빈도
            if (data.frequency) {
                renderFrequencyChart(data.frequency);
            }
        })
        .catch(err => console.error('Data load failed:', err));

    // 내 번호 복원
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        const section = document.getElementById('my-numbers-section');
        const list = document.getElementById('my-numbers-list');
        if (section && list) {
            section.style.display = 'flex';
            numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = `ball mini ${getBallColorClass(num)}`;
                ball.innerText = num;
                list.appendChild(ball);
            });
        }
    }
});

function renderDistChart(elementId, distData, unit = '개') {
    const container = document.getElementById(elementId);
    if(!container) {
        console.error(`Target container not found: ${elementId}`);
        return;
    }
    container.innerHTML = '';
    
    const entries = Object.entries(distData);
    const maxVal = Math.max(...Object.values(distData), 1);

    entries.forEach(([label, value]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        
        const displayLabel = label.includes(':') || label.includes('-') ? label : label + unit;
        
        bar.innerHTML = `
            <span class="dist-value">${value}</span>
            <span class="dist-label">${displayLabel}</span>
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