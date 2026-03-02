/**
 * Statistical Analysis Page v6.0 - FinTech Style Chart Enhancement
 */

let globalStatsData = null;

function restoreMyNumbers() {
    const section = document.getElementById('my-numbers-section');
    const list = document.getElementById('my-numbers-list');
    if (!section || !list) return;
    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (!saved) { section.style.display = 'none'; return; }
    try {
        const nums = JSON.parse(saved);
        if (Array.isArray(nums) && nums.length === 6) {
            section.style.display = 'flex';
            list.innerHTML = '';
            [...nums].sort((a, b) => a - b).forEach(n => {
                list.appendChild(LottoUI.createBall(n, true));
            });
        } else { section.style.display = 'none'; }
    } catch (e) { section.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', async function() {
    restoreMyNumbers();
    globalStatsData = await LottoDataManager.getStats();
    if (!globalStatsData) return;

    const dists = globalStatsData.distributions;
    const stats = globalStatsData.stats_summary || {};

    LottoConfig.INDICATORS.forEach(cfg => {
        const chartId = `${cfg.id}-chart`;
        if (dists[cfg.distKey]) {
            renderCurveChart(chartId, dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg);
        }
    });

    if (globalStatsData.recent_draws) renderMiniTables(globalStatsData.recent_draws.slice(0, 6));
    if (globalStatsData.frequency) renderFrequencyChart(globalStatsData.frequency);
});

function renderCurveChart(elementId, distData, unit = '', statSummary = null, config = null) {
    const container = document.getElementById(elementId);
    if (!container || !statSummary) return;
    container.innerHTML = '';

    const entries = Array.isArray(distData) ? distData : Object.entries(distData);
    if (entries.length < 2) return;

    if (!Array.isArray(distData)) {
        entries.sort((a, b) => {
            const valA = parseFloat(a[0].split(/[ :\-]/)[0]);
            const valB = parseFloat(b[0].split(/[ :\-]/)[0]);
            return isNaN(valA) ? 0 : valA - valB;
        });
    }

    const mu = statSummary.mean; const sd = statSummary.std;
    const valKeys = entries.map(e => parseFloat(e[0].split(/[ :\-]/)[0])).filter(v => !isNaN(v));
    if (valKeys.length === 0) return;
    const minVal = Math.min(...valKeys);
    const maxVal = Math.max(...valKeys);

    const rawPoints = [
        { label: '최소', val: minVal, cls: 'min-max' },
        { label: '미니 세이프', val: Math.max(minVal, Math.round(mu - 2 * sd)), cls: 'safe-zone' },
        { label: '미니 옵티멀', val: Math.max(minVal, Math.round(mu - sd)), cls: 'optimal-zone' },
        { label: '맥스 옵티멀', val: Math.min(maxVal, Math.round(mu + sd)), cls: 'optimal-zone' },
        { label: '맥스 세이프', val: Math.min(maxVal, Math.round(mu + 2 * sd)), cls: 'safe-zone' },
        { label: '최대', val: maxVal, cls: 'min-max' }
    ];

    const priority = { 'optimal-zone': 3, 'safe-zone': 2, 'min-max': 1 };
    const unifiedMap = new Map();
    rawPoints.forEach(p => {
        const existing = unifiedMap.get(p.val);
        if (!existing || priority[p.cls] > priority[existing.cls]) { unifiedMap.set(p.val, p); }
    });
    const finalPoints = Array.from(unifiedMap.values()).sort((a, b) => a.val - b.val);

    const width = container.clientWidth || 600;
    const height = 200; const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 70;
    const baselineY = height - 40;

    const maxFreq = Math.max(...entries.map(e => e[1]), 1);
    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = baselineY - (e[1] / maxFreq) * chartHeight;
        return { x, y, label: e[0], value: e[1], index: i };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

    // [디자인 고도화] 필터 및 그라디언트 정의
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // 차트 선 그림자
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "chart-shadow");
    filter.innerHTML = `<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(49, 130, 246, 0.2)"/>`;
    defs.appendChild(filter);

    const hatchIdOptimal = `hatch-optimal-${elementId}`;
    const hatchIdSafe = `hatch-safe-${elementId}`;
    
    // [옵티멀] 핀테크 그린 빗금
    const patternOpt = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    patternOpt.setAttribute("id", hatchIdOptimal); patternOpt.setAttribute("patternUnits", "userSpaceOnUse");
    patternOpt.setAttribute("width", "6"); patternOpt.setAttribute("height", "6"); patternOpt.setAttribute("patternTransform", "rotate(45)");
    patternOpt.innerHTML = `<line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.5" opacity="0.4"/>`;
    defs.appendChild(patternOpt);

    // [세이프] 핀테크 블루 빗금
    const patternSafe = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    patternSafe.setAttribute("id", hatchIdSafe); patternSafe.setAttribute("patternUnits", "userSpaceOnUse");
    patternSafe.setAttribute("width", "6"); patternSafe.setAttribute("height", "6"); patternSafe.setAttribute("patternTransform", "rotate(-45)");
    patternSafe.innerHTML = `<line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1" opacity="0.2"/>`;
    defs.appendChild(patternSafe);
    
    svg.appendChild(defs);

    const drawZone = (z, color) => {
        const minBound = Math.round(mu - z * sd);
        const maxBound = Math.round(mu + z * sd);
        const zPoints = points.filter(p => {
            const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
            return !isNaN(pVal) && pVal >= minBound && pVal <= maxBound;
        });
        if (zPoints.length > 0) {
            const firstP = zPoints[0]; const lastP = zPoints[zPoints.length - 1];
            let d = zPoints.length === 1 ? 
                `M ${firstP.x-25},${baselineY} L ${firstP.x-25},${firstP.y} L ${firstP.x+25},${firstP.y} L ${firstP.x+25},${baselineY} Z` :
                `M ${firstP.x},${baselineY} ` + zPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${lastP.x},${baselineY} Z`;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
        }
    };
    
    // 구역 색상 핀테크 스타일로 튜닝
    drawZone(2, `url(#${hatchIdSafe})`); 
    drawZone(1, `url(#${hatchIdOptimal})`); 
    drawZone(2, "rgba(49, 130, 246, 0.02)"); 
    drawZone(1, "rgba(46, 204, 113, 0.02)"); 

    // 바닥선 가이드
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding - 10); xAxis.setAttribute("y1", baselineY);
    xAxis.setAttribute("x2", width - padding + 10); xAxis.setAttribute("y2", baselineY);
    xAxis.setAttribute("stroke", "#e5e8eb"); xAxis.setAttribute("stroke-width", "1");
    svg.appendChild(xAxis);

    // 차트 곡선 (더 두껍고 부드럽게)
    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3182f6"); curvePath.setAttribute("stroke-width", "3"); 
    curvePath.setAttribute("stroke-linecap", "round"); curvePath.setAttribute("filter", "url(#chart-shadow)");
    svg.appendChild(curvePath);

    // 라벨 렌더링
    finalPoints.forEach(fp => {
        let bestIdx = -1; let minD = Infinity;
        points.forEach((p, idx) => {
            const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
            const diff = Math.abs(pVal - fp.val);
            if (diff < minD) { minD = diff; bestIdx = idx; }
        });
        if (bestIdx !== -1) {
            const p = points[bestIdx];
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 4);
            circle.setAttribute("fill", "#3182f6"); 
            circle.setAttribute("stroke", "white"); circle.setAttribute("stroke-width", "2");
            svg.appendChild(circle);

            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
            let textColor = fp.cls === 'safe-zone' ? "#3182f6" : (fp.cls === 'optimal-zone' ? "#2ecc71" : "#8b95a1");
            txt.setAttribute("fill", textColor); txt.style.fontSize = "0.8rem"; txt.style.fontWeight = "700";
            txt.textContent = p.label + unit; svg.appendChild(txt);
        }
    });

    // 내 번호 마킹 고도화
    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (saved && config && config.calc) {
        try {
            const nums = JSON.parse(saved); const myVal = config.calc(nums.sort((a,b)=>a-b), globalStatsData);
            if (myVal !== null) {
                let closestP = points[0]; let minD = Infinity;
                points.forEach(p => {
                    const v = parseFloat(p.label.split(/[ :\-]/)[0]); const d = Math.abs(v - myVal);
                    if (d < minD) { minD = d; closestP = p; }
                });
                const mc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                mc.setAttribute("cx", closestP.x); mc.setAttribute("cy", closestP.y); mc.setAttribute("r", 7);
                mc.setAttribute("fill", "#f04452"); mc.setAttribute("stroke", "white"); mc.setAttribute("stroke-width", "2");
                svg.appendChild(mc);
                const ml = document.createElementNS("http://www.w3.org/2000/svg", "text");
                ml.setAttribute("x", closestP.x); ml.setAttribute("y", closestP.y - 15); ml.setAttribute("text-anchor", "middle");
                ml.setAttribute("fill", "#f04452"); ml.style.fontSize = "0.75rem"; ml.style.fontWeight = "900";
                ml.textContent = "내 번호"; svg.appendChild(ml);
            }
        } catch(e) {}
    }
    container.appendChild(svg);
}

function renderMiniTables(draws) {
    LottoConfig.INDICATORS.forEach(cfg => {
        const bodyId = `${cfg.id}-mini-body`;
        const tbody = document.getElementById(bodyId);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = (draw.nums || []).map(n => LottoUI.createBall(n, true).outerHTML).join('');
            const val = draw[cfg.drawKey] !== undefined ? draw[cfg.drawKey] : (draw[cfg.statKey] !== undefined ? draw[cfg.statKey] : '-');
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
            tbody.appendChild(tr);
        });
    });
}

function renderFrequencyChart(data) {
    const container = document.getElementById('full-frequency-chart'); if(!container) return;
    container.innerHTML = '';
    const freqs = Object.values(data); const maxFreq = Math.max(...freqs, 1);
    for (let i = 1; i <= 45; i++) {
        const f = data[i] || 0; const h = (f / maxFreq) * 85;
        const w = document.createElement('div'); w.className = 'bar-wrapper';
        const b = document.createElement('div'); b.className = `bar ${LottoUtils.getBallColorClass(i)}`; b.style.height = `${h}%`;
        const v = document.createElement('span'); v.className = 'bar-value'; v.innerText = f;
        b.appendChild(v);
        const l = document.createElement('span'); l.className = 'bar-label'; l.innerText = i;
        w.appendChild(b); w.appendChild(l); container.appendChild(w);
    }
}
