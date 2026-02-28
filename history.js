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
        
        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <!-- G1 -->
            <td class="stat-val ${getZoneClass(draw.sum, statsSummary.sum)}">${draw.sum}</td>
            <td class="stat-val ${getZoneClass(draw.odd_even, statsSummary.odd_count)}">${draw.odd_even}</td>
            <td class="stat-val ${getZoneClass(draw.high_low, statsSummary.low_count)}">${draw.high_low}</td>
            <!-- G2 -->
            <td class="stat-val ${getZoneClass(draw.period_1, statsSummary.period_1)}">${draw.period_1}</td>
            <td class="stat-val ${getZoneClass(draw.neighbor, statsSummary.neighbor)}">${draw.neighbor}</td>
            <td class="stat-val ${getZoneClass(draw.period_1_2, statsSummary.period_1_2)}">${draw.period_1_2}</td>
            <td class="stat-val ${getZoneClass(draw.period_1_3, statsSummary.period_1_3)}">${draw.period_1_3}</td>
            <td class="stat-val ${getZoneClass(draw.consecutive, statsSummary.consecutive)}">${draw.consecutive}</td>
            <!-- G3 -->
            <td class="stat-val ${getZoneClass(draw.prime, statsSummary.prime)}">${draw.prime}</td>
            <td class="stat-val ${getZoneClass(draw.composite, statsSummary.composite)}">${draw.composite}</td>
            <td class="stat-val ${getZoneClass(draw.multiple_3, statsSummary.multiple_3)}">${draw.multiple_3}</td>
            <td class="stat-val ${getZoneClass(draw.m5, statsSummary.multiple_5)}">${draw.m5}</td>
            <td class="stat-val ${getZoneClass(draw.square, statsSummary.square)}">${draw.square}</td>
            <td class="stat-val ${getZoneClass(draw.double, statsSummary.double_num)}">${draw.double}</td>
            <!-- G4 -->
            <td class="stat-val ${getZoneClass(draw.b15, statsSummary.bucket_15)}">${draw.b15}</td>
            <td class="stat-val ${getZoneClass(draw.b9, statsSummary.bucket_9)}">${draw.b9}</td>
            <td class="stat-val ${getZoneClass(draw.b5, statsSummary.bucket_5)}">${draw.b5}</td>
            <td class="stat-val ${getZoneClass(draw.b3, statsSummary.bucket_3)}">${draw.b3}</td>
            <td class="stat-val ${getZoneClass(draw.color, statsSummary.color)}">${draw.color}</td>
            <td class="stat-val ${getZoneClass(draw.p_corner, statsSummary.pattern_corner)}">${draw.p_corner}</td>
            <td class="stat-val ${getZoneClass(draw.p_tri, statsSummary.pattern_triangle)}">${draw.p_tri}</td>
            <!-- G5 -->
            <td class="stat-val ${getZoneClass(draw.end_sum, statsSummary.end_sum)}">${draw.end_sum}</td>
            <td class="stat-val ${getZoneClass(draw.same_end, statsSummary.same_end)}">${draw.same_end}</td>
            <td class="stat-val ${getZoneClass(draw.ac, statsSummary.ac)}">${draw.ac}</td>
            <td class="stat-val ${getZoneClass(draw.span, statsSummary.span)}">${draw.span}</td>
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