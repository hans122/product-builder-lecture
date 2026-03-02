/**
 * Draw History Page - LottoCore v4.3 기반 리팩토링
 */

document.addEventListener('DOMContentLoaded', async function() {
    const data = await LottoDataManager.getStats();
    if (data) {
        if (data.recent_draws) renderHistoryTable(data.recent_draws, data.stats_summary);
        renderHistorySummary(data);
    }
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

function renderHistoryTable(draws, statsSummary) {
    const thead = document.getElementById('history-table-head');
    const tbody = document.getElementById('history-analysis-body');
    if (!thead || !tbody) return;

    // 1. 헤더 자동 생성 (TR 명시적 생성)
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    
    const baseHeaders = [
        { label: '회차', width: '80' },
        { label: '당첨번호', width: '180' }
    ];

    baseHeaders.forEach(h => {
        const th = document.createElement('th');
        th.innerText = h.label;
        th.width = h.width;
        headerRow.appendChild(th);
    });

    LottoConfig.INDICATORS.forEach(cfg => {
        const th = document.createElement('th');
        th.innerText = cfg.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 2. 바디 데이터 생성
    tbody.innerHTML = '';
    draws.forEach(draw => {
        const tr = document.createElement('tr');
        const ballsHtml = (draw.nums || []).map(n => `<div class="table-ball mini ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('');
        
        let rowHtml = `<td><strong>${draw.no}</strong><br><small style="color:#999">${draw.date}</small></td>
                       <td><div class="table-nums">${ballsHtml}</div></td>`;
        
        LottoConfig.INDICATORS.forEach(cfg => {
            const val = draw[cfg.drawKey] !== undefined ? draw[cfg.drawKey] : '-';
            const status = LottoUtils.getZStatus(val, statsSummary[cfg.statKey]);
            
            let statusClass = '';
            if (status === 'safe') statusClass = 'text-safe';
            else if (status === 'warning') statusClass = 'text-warning';
            else if (status === 'danger') statusClass = 'text-danger';

            rowHtml += `<td class="stat-val ${statusClass}">${val}</td>`;
        });
        
        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    });
}
