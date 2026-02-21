document.addEventListener('DOMContentLoaded', function() {
    console.log('Analysis Page Loaded');
    
    // 데이터 로드
    fetch('advanced_stats.json?v=' + Date.now()) // 캐시 방지
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            if (!data) return;

            const dists = data.distributions;

            // 차트 렌더링
            if (dists) {
                if (dists.odd_even) renderDistChart('odd-even-chart', Object.fromEntries(Object.entries(dists.odd_even).sort()), ' : ');
                if (dists.high_low) renderDistChart('high-low-chart', Object.fromEntries(Object.entries(dists.high_low).sort()), ' : ');
                
                // 신규 지표 차트
                if (dists.end_sum) renderDistChart('end-sum-chart', Object.fromEntries(Object.entries(dists.end_sum).sort((a,b)=>a[0]-b[0])), '');
                if (dists.same_end) renderDistChart('same-end-chart', Object.fromEntries(Object.entries(dists.same_end).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.square) renderDistChart('square-chart', Object.fromEntries(Object.entries(dists.square).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.multiple_5) renderDistChart('multiple-5-chart', Object.fromEntries(Object.entries(dists.multiple_5).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.double_num) renderDistChart('double-chart', Object.fromEntries(Object.entries(dists.double_num).sort((a,b)=>a[0]-b[0])), '개');

                if (dists.period_1) {
                    const sortedPeriod1 = {};
                    for(let i=0; i<=6; i++) if (dists.period_1[i] !== undefined) sortedPeriod1[i] = dists.period_1[i];
                    renderDistChart('period-1-chart', sortedPeriod1, '개');
                }
                if (dists.neighbor) {
                    const sortedNeighbor = {};
                    for(let i=0; i<=6; i++) if (dists.neighbor[i] !== undefined) sortedNeighbor[i] = dists.neighbor[i];
                    renderDistChart('neighbor-chart', sortedNeighbor, '개');
                }
                if (dists.consecutive) renderDistChart('consecutive-chart', Object.fromEntries(Object.entries(dists.consecutive).sort((a,b)=>a[0]-b[0])), '쌍');
                if (dists.prime) renderDistChart('prime-chart', Object.fromEntries(Object.entries(dists.prime).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.composite) renderDistChart('composite-chart', Object.fromEntries(Object.entries(dists.composite).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.multiple_3) renderDistChart('multiple-3-chart', Object.fromEntries(Object.entries(dists.multiple_3).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.sum) {
                    const order = ["100 미만", "100-119", "120-139", "140-159", "160-179", "180-199", "200 이상"];
                    const sortedSum = {};
                    order.forEach(range => {
                        if (dists.sum[range] !== undefined) sortedSum[range] = dists.sum[range];
                    });
                    renderDistChart('sum-chart', sortedSum, '');
                }
            }

            if (data.frequency) renderFrequencyChart(data.frequency);

            // 최근 결과 테이블 렌더링
            if (data.recent_draws) {
                renderRecentTable(data.recent_draws);
                renderMiniTables(data.recent_draws.slice(0, 5));
            }
        })
        .catch(err => console.error('Data load failed:', err));

    restoreMyNumbers();
});

function renderMiniTables(draws) {
    const config = [
        { id: 'odd-even-mini-body', key: 'odd_even' },
        { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'end-sum-mini-body', key: 'end_sum' },
        { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'square-mini-body', key: 'square' },
        { id: 'multiple-5-mini-body', key: 'm5' },
        { id: 'double-mini-body', key: 'double' },
        { id: 'period-1-mini-body', key: 'period_1' },
        { id: 'neighbor-mini-body', key: 'neighbor' },
        { id: 'consecutive-mini-body', key: 'consecutive' },
        { id: 'prime-mini-body', key: 'prime' },
        { id: 'composite-mini-body', key: 'composite' },
        { id: 'multiple-3-mini-body', key: 'multiple_3' },
        { id: 'sum-mini-body', key: 'sum' }
    ];

    config.forEach(item => {
        const tbody = document.getElementById(item.id);
        if (!tbody) return;
        tbody.innerHTML = '';
        
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = draw.nums.map(n => 
                `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`
            ).join('');

            let val = draw[item.key];
            // 예외 처리 (JSON에 없는 경우 실시간 계산)
            if (val === undefined) {
                if (item.key === 'composite') val = draw.nums.filter(n => n > 1 && ![2,3,5,7,11,13,17,19,23,29,31,37,41,43].includes(n)).length;
                if (item.key === 'multiple_3') val = draw.nums.filter(n => n % 3 === 0).length;
            }

            tr.innerHTML = `
                <td>${draw.no}</td>
                <td><div class="table-nums">${ballsHtml}</div></td>
                <td><strong>${val}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function renderRecentTable(draws) {
    const tbody = document.getElementById('recent-results-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = draw.nums.map(n => 
            `<div class="table-ball ${getBallColorClass(n)}">${n}</div>`
        ).join('');

        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td>${draw.sum}</td>
            <td>${draw.odd_even}</td>
            <td>${draw.period_1}</td>
            <td>${draw.neighbor}</td>
            <td>${draw.consecutive}</td>
            <td>${draw.prime}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDistChart(elementId, distData, unit = '개') {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = '';
    const entries = Object.entries(distData);
    const maxVal = Math.max(...Object.values(distData), 1);
    entries.forEach(([label, value]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        const displayLabel = label.includes(':') || label.includes('-') || label.includes(' ') ? label : label + unit;
        bar.innerHTML = `<span class="dist-value">${value}</span><span class="dist-label">${displayLabel}</span>`;
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

function restoreMyNumbers() {
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
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}