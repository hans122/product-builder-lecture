document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data) {
                if (data.recent_draws) renderHistoryTable(data.recent_draws);
                renderHistorySummary(data);
            }
        })
        .catch(err => console.error('History load failed:', err));
});

function renderHistorySummary(data) {
    const container = document.getElementById('history-p1-cum-container');
    if (!container || !data.distributions.period_1_3) return;

    const statsData = data.distributions.period_1_3;
    const total = data.total_draws;
    
    container.innerHTML = '';
    
    // 1~3회차 합집합과의 매칭 분포 요약
    Object.entries(statsData).sort((a,b)=>a[0]-b[0]).forEach(([label, count]) => {
        const prob = ((count / total) * 100).toFixed(1);
        const item = document.createElement('div');
        item.style.cssText = `
            background: white;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 80px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        `;
        item.innerHTML = `
            <span style="font-size: 0.7rem; color: #64748b; margin-bottom: 2px;">1~3회전 ${label}개</span>
            <span style="font-size: 0.9rem; font-weight: bold; color: #1e293b;">${prob}%</span>
        `;
        container.appendChild(item);
    });
}

function renderHistoryTable(draws) {
    const tbody = document.getElementById('history-analysis-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
        
        // 데이터 누락 방지를 위한 기본값 처리 및 매핑 확인
        const p1 = draw.period_1 !== undefined ? draw.period_1 : '-';
        const p1_2 = draw.period_1_2 !== undefined ? draw.period_1_2 : '-';
        const p1_3 = draw.period_1_3 !== undefined ? draw.period_1_3 : '-';
        const prime = draw.prime !== undefined ? draw.prime : '-';
        const composite = draw.composite !== undefined ? draw.composite : '-';
        const m3 = draw.multiple_3 !== undefined ? draw.multiple_3 : '-';
        const m5 = draw.m5 !== undefined ? draw.m5 : (draw.multiple_5 !== undefined ? draw.multiple_5 : '-');
        const square = draw.square !== undefined ? draw.square : '-';
        const double = draw.double !== undefined ? draw.double : '-';
        const ac = draw.ac !== undefined ? draw.ac : '-';
        const span = draw.span !== undefined ? draw.span : '-';
        
        // DATA_SCHEMA v1.4 기준: b15는 3분할, b3는 15분할
        const div3 = draw.b15 !== undefined ? draw.b15 : '-';
        const div15 = draw.b3 !== undefined ? draw.b3 : '-';
        const color = draw.color !== undefined ? draw.color : '-';

        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td class="stat-val">${draw.sum}</td>
            <td class="stat-val">${draw.odd_even}</td>
            <td class="stat-val">${draw.high_low}</td>
            <td class="stat-val">${p1}</td>
            <td class="stat-val">${p1_2}</td>
            <td class="stat-val">${p1_3}</td>
            <td class="stat-val">${prime}</td>
            <td class="stat-val">${composite}</td>
            <td class="stat-val">${m3}</td>
            <td class="stat-val">${m5}</td>
            <td class="stat-val">${square}</td>
            <td class="stat-val">${double}</td>
            <td class="stat-val">${ac}</td>
            <td class="stat-val">${span}</td>
            <td class="stat-val">${div3}</td>
            <td class="stat-val">${div15}</td>
            <td class="stat-val">${color}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}