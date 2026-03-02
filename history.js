// [표준 지표 설정] DATA_SCHEMA.md(v4.0) 마스터 매핑 테이블 엄격 준수
const INDICATOR_CONFIG = [
    { id: 'sum', label: '총합', distKey: 'sum', statKey: 'sum', drawKey: 'sum' },
    { id: 'odd-even', label: '홀짝', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'odd_even' },
    { id: 'high-low', label: '고저', distKey: 'high_low', statKey: 'low_count', drawKey: 'high_low' },
    { id: 'period_1', label: '이월', distKey: 'period_1', statKey: 'period_1', drawKey: 'period_1' },
    { id: 'neighbor', label: '이웃', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'neighbor' },
    { id: 'period_1_2', label: '1~2회', distKey: 'period_1_2', statKey: 'period_1_2', drawKey: 'period_1_2' },
    { id: 'period_1_3', label: '1~3회', distKey: 'period_1_3', statKey: 'period_1_3', drawKey: 'period_1_3' },
    { id: 'consecutive', label: '연번', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'consecutive' },
    { id: 'prime', label: '소수', distKey: 'prime', statKey: 'prime', drawKey: 'prime' },
    { id: 'composite', label: '합성', distKey: 'composite', statKey: 'composite', drawKey: 'composite' },
    { id: 'multiple-3', label: '3배수', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'multiple_3' },
    { id: 'multiple-5', label: '5배수', distKey: 'multiple_5', statKey: 'multiple_5', drawKey: 'm5' },
    { id: 'square', label: '제곱', distKey: 'square', statKey: 'square', drawKey: 'square' },
    { id: 'double', label: '쌍수', distKey: 'double_num', statKey: 'double_num', drawKey: 'double' },
    { id: 'bucket-15', label: '3분할', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15' },
    { id: 'bucket-9', label: '5분할', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9' },
    { id: 'bucket-5', label: '9분할', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5' },
    { id: 'bucket-3', label: '15분할', distKey: 'bucket_3', statKey: 'bucket_3', drawKey: 'b3' },
    { id: 'color', label: '색상', distKey: 'color', statKey: 'color', drawKey: 'color' },
    { id: 'pattern-corner', label: '모서리', distKey: 'pattern_corner', statKey: 'pattern_corner', drawKey: 'p_corner' },
    { id: 'pattern-triangle', label: '삼각형', distKey: 'pattern_triangle', statKey: 'pattern_triangle', drawKey: 'p_tri' },
    { id: 'end-sum', label: '끝수합', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'end_sum' },
    { id: 'same-end', label: '동끝수', distKey: 'same_end', statKey: 'same_end', drawKey: 'same_end' },
    { id: 'ac', label: 'AC', distKey: 'ac', statKey: 'ac', drawKey: 'ac' },
    { id: 'span', label: 'Span', distKey: 'span', statKey: 'span', drawKey: 'span' }
];

document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data) {
                if (data.recent_draws) renderHistoryTable(data.recent_draws, data.stats_summary);
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
    
    Object.entries(statsData).sort((a,b)=>a[0]-b[0]).forEach(([label, count]) => {
        const prob = ((count / total) * 100).toFixed(1);
        const item = document.createElement('div');
        item.style.cssText = `background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`;
        item.innerHTML = `<span style="font-size: 0.7rem; color: #64748b; margin-bottom: 2px;">1~3회전 ${label}개</span><span style="font-size: 0.9rem; font-weight: bold; color: #1e293b;">${prob}%</span>`;
        container.appendChild(item);
    });
}

function getZoneClass(val, stat) {
    if (!stat || val === undefined) return '';
    const v = (typeof val === 'string' && val.includes(':')) ? parseInt(val.split(':')[0]) : parseFloat(val);
    if (isNaN(v)) return '';
    const z = Math.abs(v - stat.mean) / stat.std;
    if (z <= 1.0) return 'text-optimal';
    if (z <= 2.0) return 'text-safe';
    return 'text-warning';
}

function renderHistoryTable(draws, statsSummary) {
    const tbody = document.getElementById('history-analysis-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = (draw.nums || []).map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
        
        let rowHtml = `<td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
                       <td><div class="table-nums">${ballsHtml}</div></td>`;
        
        // [데이터 기반 자동화 루프] 테이블 셀 생성
        INDICATOR_CONFIG.forEach(cfg => {
            const val = draw[cfg.drawKey] !== undefined ? draw[cfg.drawKey] : '-';
            const statusClass = getZoneClass(val, statsSummary[cfg.statKey]);
            rowHtml += `<td class="stat-val ${statusClass}">${val}</td>`;
        });
        
        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow'; if (num <= 20) return 'blue';
    if (num <= 30) return 'red'; if (num <= 40) return 'gray'; return 'green';
}
