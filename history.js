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
    if (!container || !data.distributions.period_1_stats) return;

    const statsData = data.distributions.period_1_stats;
    
    container.innerHTML = '';
    
    Object.entries(statsData).forEach(([label, count]) => {
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
            <span style="font-size: 0.7rem; color: #64748b; margin-bottom: 2px;">이월 ${label}개</span>
            <span style="font-size: 0.9rem; font-weight: bold; color: #1e293b;">${count}회</span>
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
        
        // 번호 구슬 생성
        const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
        
        // 각 지표별 최적 상태 체크 (시각적 도움)
        const sumClass = (draw.sum >= 120 && draw.sum <= 180) ? 'optimal-text' : '';
        const oeParts = draw.odd_even.split(':').map(Number);
        const oeClass = (oeParts[0] >= 2 && oeParts[0] <= 4) ? 'optimal-text' : '';
        
        // 이월수 개별 개수 체크
        const p1 = draw.period_1 || 0;
        const is1 = (p1 === 1) ? '<span class="optimal-text">O</span>' : '-';
        const is2 = (p1 === 2) ? '<span class="optimal-text">O</span>' : '-';
        const is3 = (p1 === 3) ? '<span class="optimal-text">O</span>' : '-';

        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td class="stat-val ${sumClass}">${draw.sum}</td>
            <td class="stat-val ${oeClass}">${draw.odd_even}</td>
            <td class="stat-val">${draw.high_low}</td>
            <td class="stat-val">${draw.ac}</td>
            <td class="stat-val">${draw.span}</td>
            <td class="stat-val">${p1}개</td>
            <td class="stat-val">${is1}</td>
            <td class="stat-val">${is2}</td>
            <td class="stat-val">${is3}</td>
            <td class="stat-val">${draw.consecutive}쌍</td>
            <td class="stat-val">${draw.b15}구간</td>
            <td class="stat-val">${draw.b9}구간</td>
            <td class="stat-val">${draw.b5}구간</td>
            <td class="stat-val">${draw.b3}구간</td>
            <td class="stat-val">${draw.color}색상</td>
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