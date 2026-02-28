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

function getZoneClass(val, stat) {
    if (!stat || typeof val !== 'number') return '';
    const z = Math.abs(val - stat.mean) / stat.std;
    if (z <= 1.0) return 'text-optimal'; // Optimal (68%)
    if (z <= 2.0) return 'text-safe';    // Safe (95%)
    return 'text-warning';              // Danger
}

function renderHistoryTable(draws, statsSummary) {
    const tbody = document.getElementById('history-analysis-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = (draw.nums || []).map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
        
        // 데이터 매핑 및 상태 클래스 적용
        const ac = draw.ac;
        const span = draw.span;
        const color = draw.color;
        const sum = draw.sum;
        const odd_cnt = parseInt(draw.odd_even.split(':')[0]);
        const low_cnt = parseInt(draw.high_low.split(':')[0]);
        const prime = draw.prime;
        const composite = draw.composite;
        const m3 = draw.multiple_3;
        const m5 = draw.m5 !== undefined ? draw.m5 : draw.multiple_5;
        const square = draw.square;
        const double = draw.double;
        const p1 = draw.period_1;
        const p1_2 = draw.period_1_2;
        const p1_3 = draw.period_1_3;
        const neighbor = draw.neighbor;
        const div3 = draw.b15;
        const div5 = draw.b9;
        const div15 = draw.b3;
        const pCorner = draw.p_corner;

        tr.innerHTML = `
            <td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <!-- G1 -->
            <td class="stat-val ${getZoneClass(sum, statsSummary.sum)}">${sum}</td>
            <td class="stat-val ${getZoneClass(odd_cnt, statsSummary.odd_count)}">${draw.odd_even}</td>
            <td class="stat-val ${getZoneClass(low_cnt, statsSummary.low_count)}">${draw.high_low}</td>
            <!-- G2 -->
            <td class="stat-val ${getZoneClass(p1, statsSummary.period_1)}">${p1}</td>
            <td class="stat-val ${getZoneClass(p1_2, statsSummary.period_1_2)}">${p1_2}</td>
            <td class="stat-val ${getZoneClass(p1_3, statsSummary.period_1_3)}">${p1_3}</td>
            <td class="stat-val ${getZoneClass(neighbor, statsSummary.neighbor)}">${neighbor}</td>
            <!-- G3 -->
            <td class="stat-val ${getZoneClass(prime, statsSummary.prime)}">${prime}</td>
            <td class="stat-val ${getZoneClass(composite, statsSummary.composite)}">${composite}</td>
            <td class="stat-val ${getZoneClass(m3, statsSummary.multiple_3)}">${m3}</td>
            <td class="stat-val ${getZoneClass(m5, statsSummary.multiple_5)}">${m5}</td>
            <td class="stat-val ${getZoneClass(square, statsSummary.square)}">${square}</td>
            <td class="stat-val ${getZoneClass(double, statsSummary.double_num)}">${double}</td>
            <!-- G4 -->
            <td class="stat-val ${getZoneClass(div3, statsSummary.bucket_15)}">${div3}</td>
            <td class="stat-val ${getZoneClass(div5, statsSummary.bucket_9)}">${div5}</td>
            <td class="stat-val ${getZoneClass(div15, statsSummary.bucket_3)}">${div15}</td>
            <td class="stat-val ${getZoneClass(pCorner, statsSummary.pattern_corner)}">${pCorner}</td>
            <!-- G5 -->
            <td class="stat-val ${getZoneClass(ac, statsSummary.ac)}">${ac}</td>
            <td class="stat-val ${getZoneClass(span, statsSummary.span)}">${span}</td>
            <td class="stat-val ${getZoneClass(color, statsSummary.color)}">${color}</td>
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