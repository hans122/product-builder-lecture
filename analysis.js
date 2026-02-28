document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const total = data.total_draws;

            // 1. 기본 및 합계
            if (dists.odd_even) renderDistChart('odd-even-chart', dists.odd_even, ' : ', true);
            if (dists.high_low) renderDistChart('high-low-chart', dists.high_low, ' : ', true);
            if (dists.sum) {
                const sumOrder = ["100 미만", "100-119", "120-139", "140-159", "160-179", "180-199", "200 이상"];
                const sortedSum = {};
                sumOrder.forEach(range => { if (dists.sum[range] !== undefined) sortedSum[range] = dists.sum[range]; });
                renderDistChart('sum-chart', sortedSum, '');
            }

            // 2. 특수 번호 및 끝수
            if (dists.prime) renderDistChart('prime-chart', dists.prime, '개', true);
            if (dists.composite) renderDistChart('composite-chart', dists.composite, '개', true);
            if (dists.multiple_3) renderDistChart('multiple-3-chart', dists.multiple_3, '개', true);
            if (dists.multiple_5) renderDistChart('multiple-5-chart', dists.multiple_5, '개', true);
            if (dists.square) renderDistChart('square-chart', dists.square, '개', true);
            if (dists.double_num) renderDistChart('double-chart', dists.double_num, '개', true);
            if (dists.same_end) renderDistChart('same-end-chart', dists.same_end, '개', true);

            // 3. 상관관계 (이월, 1~2회전, 1~3회전)
            if (dists.period_1) renderDistChart('period-1-chart', dists.period_1, '개', true);
            if (dists.period_1_2) {
                const data1_2 = Object.entries(dists.period_1_2).map(([k, v]) => [`${k}개`, v, `${((v/total)*100).toFixed(1)}%`]);
                renderDistChart('period-1-2-chart', data1_2, '회');
            }
            if (dists.period_1_3) {
                const data1_3 = Object.entries(dists.period_1_3).map(([k, v]) => [`${k}개`, v, `${((v/total)*100).toFixed(1)}%`]);
                renderDistChart('period-1-3-chart', data1_3, '회');
            }
            if (dists.neighbor) renderDistChart('neighbor-chart', dists.neighbor, '개', true);
            if (dists.consecutive) renderDistChart('consecutive-chart', dists.consecutive, '쌍', true);

            // 4. 구간 및 패턴
            if (dists.bucket_15) renderDistChart('bucket-15-chart', dists.bucket_15, '구간', true);
            if (dists.bucket_9) renderDistChart('bucket-9-chart', dists.bucket_9, '구간', true);
            if (dists.bucket_5) renderDistChart('bucket-5-chart', dists.bucket_5, '구간', true);
            if (dists.bucket_3) renderDistChart('bucket-3-chart', dists.bucket_3, '구간', true);
            if (dists.color) renderDistChart('color-chart', dists.color, '색상', true);

            // 5. 전문 지표
            if (dists.ac) {
                const acOrder = ["6 이하", "7", "8", "9", "10"];
                const acData = acOrder.map(label => {
                    let count = 0;
                    if (label === "6 이하") {
                        Object.entries(dists.ac).forEach(([v, c]) => { if (parseInt(v) <= 6) count += c; });
                    } else { count = dists.ac[label] || 0; }
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

            // 공통: 최근 6회차 미니 테이블
            if (data.recent_draws) renderMiniTables(data.recent_draws.slice(0, 6));
            
            // 번호별 빈도 차트
            if (data.frequency) renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('Stats load failed:', err));

    restoreMyNumbers();
});

function renderMiniTables(draws) {
    const config = [
        { id: 'odd-even-mini-body', key: 'odd_even' },
        { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'sum-mini-body', key: 'sum' },
        { id: 'prime-mini-body', key: 'prime' },
        { id: 'composite-mini-body', key: 'composite' },
        { id: 'multiple-3-mini-body', key: 'multiple_3' },
        { id: 'multiple-5-mini-body', key: 'm5' },
        { id: 'square-mini-body', key: 'square' },
        { id: 'double-mini-body', key: 'double' },
        { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'period-1-mini-body', key: 'period_1' },
        { id: 'period-1-2-mini-body', key: 'period_1_2' },
        { id: 'period-1-3-mini-body', key: 'period_1_3' },
        { id: 'neighbor-mini-body', key: 'neighbor' },
        { id: 'consecutive-mini-body', key: 'consecutive' },
        { id: 'bucket-15-mini-body', key: 'b15' },
        { id: 'bucket-9-mini-body', key: 'b9' },
        { id: 'bucket-5-mini-body', key: 'b5' },
        { id: 'bucket-3-mini-body', key: 'b3' },
        { id: 'color-mini-body', key: 'color' },
        { id: 'ac-mini-body', key: 'ac' },
        { id: 'span-mini-body', key: 'span' }
    ];

    config.forEach(item => {
        const tbody = document.getElementById(item.id);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            let val = draw[item.key] !== undefined ? draw[item.key] : '-';
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
            tbody.appendChild(tr);
        });
    });
}

function renderDistChart(elementId, distData, unit = '개', autoSort = false) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    
    let entries = Array.isArray(distData) ? distData : Object.entries(distData);
    if (autoSort && !Array.isArray(distData)) {
        entries.sort((a, b) => {
            const keyA = isNaN(a[0]) ? a[0] : parseFloat(a[0]);
            const keyB = isNaN(b[0]) ? b[0] : parseFloat(b[0]);
            if (typeof keyA === 'number' && typeof keyB === 'number') return keyA - keyB;
            return String(keyA).localeCompare(String(keyB));
        });
    }

    const values = entries.map(e => e[1]);
    const maxVal = Math.max(...values, 1);
    
    entries.forEach(([label, value, percentage]) => {
        const height = (value / maxVal) * 80;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`;
        const displayVal = percentage ? `${value}<br><small style="font-size:0.6rem">${percentage}</small>` : value;
        const displayLabel = (label.includes(':') || label.includes('회전') || label.includes('개') || isNaN(label) ? label : label + unit);
        bar.innerHTML = `<span class="dist-value">${displayVal}</span><span class="dist-label">${displayLabel}</span>`;
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

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}