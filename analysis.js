document.addEventListener('DOMContentLoaded', function() {
    console.log('Analysis Page Loaded');
    
    fetch('advanced_stats.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const total = data.total_draws;

            if (dists) {
                // 1. 기본 비율
                if (dists.odd_even) renderDistChart('odd-even-chart', Object.fromEntries(Object.entries(dists.odd_even).sort()), ' : ');
                if (dists.high_low) renderDistChart('high-low-chart', Object.fromEntries(Object.entries(dists.high_low).sort()), ' : ');
                
                // 2. 끝수 및 특수 패턴
                if (dists.end_sum) {
                    const esOrder = ["15 미만", "15-19", "20-24", "25-29", "30-34", "35-39", "40 이상"];
                    const sortedES = {};
                    esOrder.forEach(range => { if (dists.end_sum[range] !== undefined) sortedES[range] = dists.end_sum[range]; });
                    renderDistChart('end-sum-chart', sortedES, '');
                }
                if (dists.same_end) renderDistChart('same-end-chart', Object.fromEntries(Object.entries(dists.same_end).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.square) renderDistChart('square-chart', Object.fromEntries(Object.entries(dists.square).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.multiple_5) renderDistChart('multiple-5-chart', Object.fromEntries(Object.entries(dists.multiple_5).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.double_num) renderDistChart('double-chart', Object.fromEntries(Object.entries(dists.double_num).sort((a,b)=>a[0]-b[0])), '개');

                // 3. 심화 분석: 구간
                if (dists.bucket_3) renderDistChart('bucket-3-chart', Object.fromEntries(Object.entries(dists.bucket_3).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_5) renderDistChart('bucket-5-chart', Object.fromEntries(Object.entries(dists.bucket_5).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_9) renderDistChart('bucket-9-chart', Object.fromEntries(Object.entries(dists.bucket_9).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.bucket_15) renderDistChart('bucket-15-chart', Object.fromEntries(Object.entries(dists.bucket_15).sort((a,b)=>a[0]-b[0])), '구간');
                if (dists.color) renderDistChart('color-chart', Object.fromEntries(Object.entries(dists.color).sort((a,b)=>a[0]-b[0])), '색상');

                // 4. 심화 분석: 용지 패턴
                if (dists.pattern_corner) renderDistChart('pattern-corner-chart', Object.fromEntries(Object.entries(dists.pattern_corner).sort((a,b)=>a[0]-b[0])), '개');
                if (dists.pattern_triangle) renderDistChart('pattern-triangle-chart', Object.fromEntries(Object.entries(dists.pattern_triangle).sort((a,b)=>a[0]-b[0])), '개');

                // 5. 전문 기술적 지표
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
                if (dists.span) {
                    const spanGrouped = {"25 미만": 0, "25-29": 0, "30-34": 0, "35-39": 0, "40 이상": 0};
                    Object.entries(dists.span).forEach(([val, count]) => {
                        const v = parseInt(val);
                        if (v < 25) spanGrouped["25 미만"] += count;
                        else if (v <= 29) spanGrouped["25-29"] += count;
                        else if (v <= 34) spanGrouped["30-34"] += count;
                        else if (v <= 39) spanGrouped["35-39"] += count;
                        else spanGrouped["40 이상"] += count;
                    });
                    renderDistChart('span-chart', spanGrouped, '');
                }

                // 6. 기존 항목들 및 누적 이월수
                if (dists.period_1) {
                    const sortedPeriod1 = {};
                    for(let i=0; i<=6; i++) if (dists.period_1[i] !== undefined) sortedPeriod1[i] = dists.period_1[i];
                    renderDistChart('period-1-chart', sortedPeriod1, '개');
                }
                if (dists.period_1_cum) {
                    const cumData = Object.entries(dists.period_1_cum).map(([label, val]) => {
                        const prob = ((val / total) * 100).toFixed(1);
                        return [label, val, `${prob}%`];
                    });
                    renderDistChart('period-1-cum-chart', cumData, '회');
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

function renderMiniTables(draws) {
    const config = [
        { id: 'odd-even-mini-body', key: 'odd_even' },
        { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'end-sum-mini-body', key: 'end_sum' },
        { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'square-mini-body', key: 'square' },
        { id: 'multiple-5-mini-body', key: 'm5' },
        { id: 'double-mini-body', key: 'double' },
        { id: 'bucket-3-mini-body', key: 'b3' },
        { id: 'bucket-5-mini-body', key: 'b5' },
        { id: 'bucket-9-mini-body', key: 'b9' },
        { id: 'bucket-15-mini-body', key: 'b15' },
        { id: 'color-mini-body', key: 'color' },
        { id: 'pattern-corner-mini-body', key: 'p_corner' },
        { id: 'pattern-triangle-mini-body', key: 'p_tri' },
        { id: 'ac-mini-body', key: 'ac' },
        { id: 'span-mini-body', key: 'span' },
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
            const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            let val = draw[item.key];
            if (val === undefined) {
                if (item.key === 'composite') val = draw.nums.filter(n => n > 1 && ![2,3,5,7,11,13,17,19,23,29,31,37,41,43].includes(n)).length;
                if (item.key === 'multiple_3') val = draw.nums.filter(n => n % 3 === 0).length;
            }
            tr.innerHTML = `<td>${draw.no}</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
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
        const ballsHtml = draw.nums.map(n => `<div class="table-ball ${getBallColorClass(n)}">${n}</div>`).join('');
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
    
    let entries, values;
    if (Array.isArray(distData)) {
        entries = distData;
        values = distData.map(e => e[1]);
    } else {
        entries = Object.entries(distData);
        values = Object.values(distData);
    }
    
    const maxVal = Math.max(...values, 1);
    entries.forEach(([label, value, extraLabel]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        const displayLabel = extraLabel || (label.includes(':') || label.includes('-') || label.includes(' ') || isNaN(label) ? label : label + unit);
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

    // TOP 10 미니 테이블 렌더링 추가
    const topBody = document.getElementById('frequency-top-body');
    if (topBody) {
        const sorted = Object.entries(data)
            .map(([num, count]) => ({ num: parseInt(num), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        topBody.innerHTML = sorted.map((item, index) => `
            <tr>
                <td>${index + 1}위</td>
                <td><div class="table-nums"><div class="table-ball ${getBallColorClass(item.num)}">${item.num}</div></div></td>
                <td><strong>${item.count}회</strong></td>
            </tr>
        `).join('');
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
            list.innerHTML = ''; // 초기화 후 추가
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