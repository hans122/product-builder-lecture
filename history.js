document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data && data.recent_draws) {
                renderHistoryTable(data.recent_draws);
            }
        })
        .catch(err => console.error('History load failed:', err));
});

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
        
        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td class="stat-val ${sumClass}">${draw.sum}</td>
            <td class="stat-val ${oeClass}">${draw.odd_even}</td>
            <td class="stat-val">${draw.high_low}</td>
            <td class="stat-val" title="직전 회차와 중복된 번호">${draw.period_1}개</td>
            <td class="stat-val" title="직전 회차의 ±1 번호">${draw.neighbor}개</td>
            <td class="stat-val">${draw.consecutive}쌍</td>
            <td class="stat-val">${draw.prime}개</td>
            <td class="stat-val">${draw.b3}구간</td>
            <td class="stat-val">${draw.end_sum}</td>
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