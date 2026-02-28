document.addEventListener('DOMContentLoaded', function() {
    console.log('Analysis Page Loaded');
    
    fetch('advanced_stats.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const total = data.total_draws;

            if (dists) {
                // ... (기타 차트 렌더링 유지)
                if (dists.odd_even) renderDistChart('odd-even-chart', Object.fromEntries(Object.entries(dists.odd_even).sort()), ' : ');
                if (dists.high_low) renderDistChart('high-low-chart', Object.fromEntries(Object.entries(dists.high_low).sort()), ' : ');
                if (dists.end_sum) {
                    const esOrder = ["15 미만", "15-19", "20-24", "25-29", "30-34", "35-39", "40 이상"];
                    const sortedES = {};
                    esOrder.forEach(range => { if (dists.end_sum[range] !== undefined) sortedES[range] = dists.end_sum[range]; });
                    renderDistChart('end-sum-chart', sortedES, '');
                }
                if (dists.same_end) renderDistChart('same-end-chart', Object.fromEntries(Object.entries(dists.same_end).sort((a,b)=>a[0]-b[0])), '개');
                
                // --- [수정] 윈도우 기반 이월수 분포 차트 ---
                if (dists.period_1) {
                    renderDistChart('period-1-chart', Object.fromEntries(Object.entries(dists.period_1).sort((a,b)=>a[0]-b[0])), '개');
                }
                
                if (dists.period_1_2 || dists.period_1_3) {
                    // 기존 누적 확률 차트 영역을 윈도우 기반 차트로 변경
                    const cumContainer = document.getElementById('period-1-cum-chart');
                    if (cumContainer) {
                        const data1_2 = Object.entries(dists.period_1_2 || {}).map(([k, v]) => [`1~2회전 ${k}개`, v]);
                        renderDistChart('period-1-cum-chart', data1_2, '회');
                    }
                }

                // ... (기타 차트 렌더링 계속)
                if (dists.bucket_3) renderDistChart('bucket-3-chart', Object.fromEntries(Object.entries(dists.bucket_3).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_5) renderDistChart('bucket-5-chart', Object.fromEntries(Object.entries(dists.bucket_5).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_9) renderDistChart('bucket-9-chart', Object.fromEntries(Object.entries(dists.bucket_9).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_15) renderDistChart('bucket-15-chart', Object.fromEntries(Object.entries(dists.bucket_15).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.color) renderDistChart('color-chart', Object.fromEntries(Object.entries(dists.color).sort((a,b)=>a[0]-b[0])), '색상');
                if (dists.ac) {
                    const order = ["6 이하", "7", "8", "9", "10"];
                    const acData = order.map(label => {
                        let count = 0;
                        if (label === "6 이하") {
                            Object.entries(dists.ac).forEach(([v, c]) => { if (parseInt(v) <= 6) count += c; });
                        } else {
                            count = dists.ac[label] || 0;
                        }
                        return [label, count];
                    });
                    renderDistChart('ac-chart', acData, '');
                }
                if (dists.sum) {
                    const order = ["100 미만", "100-119", "120-139", "140-159", "160-179", "180-199", "200 이상"];
                    const sortedSum = {};
                    order.forEach(range => { if (dists.sum[range] !== undefined) sortedSum[range] = dists.sum[range]; });
                    renderDistChart('sum-chart', sortedSum, '');
                }
            }

            if (data.frequency) renderFrequencyChart(data.frequency);
            if (data.recent_draws) {
                renderRecentTable(data.recent_draws);
                renderMiniTables(data.recent_draws.slice(0, 6));
            }
        })
        .catch(err => console.error('Data load failed:', err));

    restoreMyNumbers();
});

// ... (나머지 헬퍼 함수들 유지)
function renderRecentTable(draws) {
    const tbody = document.getElementById('recent-results-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = draw.nums.map(n => `<div class="table-ball ${getBallColorClass(n)}">${n}</div>`).join('');
        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td>${draw.sum}</td>
            <td>${draw.odd_even}</td>
            <td>${draw.period_1}</td>
            <td>${draw.period_1_2}</td>
            <td>${draw.period_1_3}</td>
            <td>${draw.prime}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDistChart(elementId, distData, unit = '개') {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = '';
    let entries = Array.isArray(distData) ? distData : Object.entries(distData);
    const values = entries.map(e => e[1]);
    const maxVal = Math.max(...values, 1);
    entries.forEach(([label, value]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        const displayLabel = (label.includes(':') || label.includes('-') || label.includes(' ') || isNaN(label) ? label : label + unit);
        bar.innerHTML = `<span class="dist-value">${value}</span><span class="dist-label">${displayLabel}</span>`;
        container.appendChild(bar);
    });
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

function renderMiniTables(draws) {
    const config = [
        { id: 'odd-even-mini-body', key: 'odd_even' },
        { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'end-sum-mini-body', key: 'end_sum' },
        { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'bucket-3-mini-body', key: 'b3' },
        { id: 'bucket-5-mini-body', key: 'b5' },
        { id: 'bucket-9-mini-body', key: 'b9' },
        { id: 'bucket-15-mini-body', key: 'b15' },
        { id: 'color-mini-body', key: 'color' },
        { id: 'ac-mini-body', key: 'ac' },
        { id: 'span-mini-body', key: 'span' },
        { id: 'period-1-mini-body', key: 'period_1' },
        { id: 'sum-mini-body', key: 'sum' }
    ];
    config.forEach(item => {
        const tbody = document.getElementById(item.id);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            tr.innerHTML = `<td>${draw.no}</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${draw[item.key]}</strong></td>`;
            tbody.appendChild(tr);
        });
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
            list.innerHTML = '';
            numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = `ball mini ${getBallColorClass(num)}`;
                ball.innerText = num;
                list.appendChild(ball);
            });
        }
    }
}