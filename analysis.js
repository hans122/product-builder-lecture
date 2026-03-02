/**
 * Statistical Analysis Page v5.4 - LottoCore 엔진 전면 도입
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

    const statPoints = [
        { label: '최소', val: minVal, cls: 'min-max' },
        { label: '미니 세이프', val: Math.max(minVal, Math.round(mu - 2 * sd)), cls: 'safe-zone' },
        { label: '미니 옵티멀', val: Math.max(minVal, Math.round(mu - sd)), cls: 'optimal-zone' },
        { label: '맥스 옵티멀', val: Math.min(maxVal, Math.round(mu + sd)), cls: 'optimal-zone' },
        { label: '맥스 세이프', val: Math.min(maxVal, Math.round(mu + 2 * sd)), cls: 'safe-zone' },
        { label: '최대', val: maxVal, cls: 'min-max' }
    ];

    const priority = { 'optimal-zone': 3, 'safe-zone': 2, 'min-max': 1 };
    const unifiedMap = new Map();
    statPoints.forEach(p => {
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

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding - 10); xAxis.setAttribute("y1", baselineY);
    xAxis.setAttribute("x2", width - padding + 10); xAxis.setAttribute("y2", baselineY);
    xAxis.setAttribute("stroke", "#edf2f7"); xAxis.setAttribute("stroke-width", "1.5");
    svg.appendChild(xAxis);

    const hatchIdOptimal = `hatch-optimal-${elementId}`;
    const hatchIdSafe = `hatch-safe-${elementId}`;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    const patternOpt = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    patternOpt.setAttribute("id", hatchIdOptimal); patternOpt.setAttribute("patternUnits", "userSpaceOnUse");
    patternOpt.setAttribute("width", "4"); patternOpt.setAttribute("height", "4"); patternOpt.setAttribute("patternTransform", "rotate(45)");
    const lineOpt = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineOpt.setAttribute("x1", "0"); lineOpt.setAttribute("y1", "0"); lineOpt.setAttribute("x2", "0"); lineOpt.setAttribute("y2", "4");
    lineOpt.setAttribute("stroke", "rgba(46, 204, 113, 0.6)"); lineOpt.setAttribute("stroke-width", "1.5");
    patternOpt.appendChild(lineOpt); defs.appendChild(patternOpt);

    const patternSafe = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    patternSafe.setAttribute("id", hatchIdSafe); patternSafe.setAttribute("patternUnits", "userSpaceOnUse");
    patternSafe.setAttribute("width", "4"); patternSafe.setAttribute("height", "4"); patternSafe.setAttribute("patternTransform", "rotate(-45)");
    const lineSafe = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineSafe.setAttribute("x1", "0"); lineSafe.setAttribute("y1", "0"); lineSafe.setAttribute("x2", "0"); lineSafe.setAttribute("y2", "4");
    lineSafe.setAttribute("stroke", "rgba(52, 152, 219, 0.4)"); lineSafe.setAttribute("stroke-width", "1.2");
    patternSafe.appendChild(lineSafe); defs.appendChild(patternSafe);
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
    drawZone(2, `url(#${hatchIdSafe})`); drawZone(1, `url(#${hatchIdOptimal})`); 
    drawZone(2, "rgba(52, 152, 219, 0.03)"); drawZone(1, "rgba(46, 204, 113, 0.03)"); 

    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3498db"); curvePath.setAttribute("stroke-width", "2"); svg.appendChild(curvePath);

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
            circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 3);
            circle.setAttribute("fill", "#2980b9"); svg.appendChild(circle);
            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
            let textColor = fp.cls === 'safe-zone' ? "#3498db" : (fp.cls === 'optimal-zone' ? "#27ae60" : "#718096");
            txt.setAttribute("fill", textColor); txt.style.fontSize = "0.75rem"; txt.style.fontWeight = "900";
            txt.textContent = p.label + unit; svg.appendChild(txt);
        }
    });

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
                mc.setAttribute("cx", closestP.x); mc.setAttribute("cy", closestP.y); mc.setAttribute("r", 6);
                mc.setAttribute("fill", "rgba(231, 76, 60, 0.4)"); mc.setAttribute("stroke", "#e74c3c"); svg.appendChild(mc);
                const ml = document.createElementNS("http://www.w3.org/2000/svg", "text");
                ml.setAttribute("x", closestP.x); ml.setAttribute("y", closestP.y - 12); ml.setAttribute("text-anchor", "middle");
                ml.setAttribute("fill", "#e74c3c"); ml.style.fontSize = "0.7rem"; ml.style.fontWeight = "900";
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
