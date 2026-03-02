// [표준 지표 설정] DATA_SCHEMA.md(v4.0) 마스터 매핑 테이블 엄격 준수
const INDICATOR_CONFIG = [
    { id: 'sum', label: '총합', unit: '', group: 'G1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
    { id: 'odd-even', label: '홀짝 비율', unit: ' : ', group: 'G1', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'odd_even', calc: (nums) => nums.filter(n => n % 2 !== 0).length },
    { id: 'high-low', label: '고저 비율', unit: ' : ', group: 'G1', distKey: 'high_low', statKey: 'low_count', drawKey: 'high_low', calc: (nums) => nums.filter(n => n <= 22).length },
    { id: 'period_1', label: '직전 1회차 매칭', unit: '개', group: 'G2', distKey: 'period_1', statKey: 'period_1', drawKey: 'period_1', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : null },
    { id: 'neighbor', label: '이웃수', unit: '개', group: 'G2', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'neighbor', calc: (nums, data) => {
        if (!data || !data.last_3_draws) return null;
        const neighbors = new Set();
        data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
        return nums.filter(n => neighbors.has(n)).length;
    }},
    { id: 'period_1_2', label: '1~2회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_2', statKey: 'period_1_2', drawKey: 'period_1_2', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length : null },
    { id: 'period_1_3', label: '1~3회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_3', statKey: 'period_1_3', drawKey: 'period_1_3', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[]), ...(data.last_3_draws[2]||[])]).has(n)).length : null },
    { id: 'consecutive', label: '연속번호 쌍', unit: '쌍', group: 'G2', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'consecutive', calc: (nums) => {
        let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++; return cnt;
    }},
    { id: 'prime', label: '소수 포함', unit: '개', group: 'G3', distKey: 'prime', statKey: 'prime', drawKey: 'prime', calc: (nums) => nums.filter(isPrime).length },
    { id: 'composite', label: '합성수 포함', unit: '개', group: 'G3', distKey: 'composite', statKey: 'composite', drawKey: 'composite', calc: (nums) => nums.filter(isComposite).length },
    { id: 'multiple-3', label: '3배수 포함', unit: '개', group: 'G3', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'multiple_3', calc: (nums) => nums.filter(n => n % 3 === 0).length },
    { id: 'multiple-5', label: '5배수 포함', unit: '개', group: 'G3', distKey: 'multiple_5', statKey: 'multiple_5', drawKey: 'm5', calc: (nums) => nums.filter(n => n % 5 === 0).length },
    { id: 'square', label: '제곱수 포함', unit: '개', group: 'G3', distKey: 'square', statKey: 'square', drawKey: 'square', calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length },
    { id: 'double', label: '쌍수 포함', unit: '개', group: 'G3', distKey: 'double_num', statKey: 'double_num', drawKey: 'double', calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length },
    { id: 'bucket-15', label: '3분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size },
    { id: 'bucket-9', label: '5분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size },
    { id: 'bucket-5', label: '9분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size },
    { id: 'bucket-3', label: '15분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_3', statKey: 'bucket_3', drawKey: 'b3', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size },
    { id: 'color', label: '포함 색상수', unit: '색상', group: 'G4', distKey: 'color', statKey: 'color', drawKey: 'color', calc: (nums) => new Set(nums.map(getBallColorClass)).size },
    { id: 'pattern-corner', label: '모서리 패턴', unit: '개', group: 'G4', distKey: 'pattern_corner', statKey: 'pattern_corner', drawKey: 'p_corner', calc: (nums) => nums.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length },
    { id: 'pattern-triangle', label: '삼각형 패턴', unit: '개', group: 'G4', distKey: 'pattern_triangle', statKey: 'pattern_triangle', drawKey: 'p_tri', calc: (nums) => nums.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length },
    { id: 'end-sum', label: '끝수합', unit: '', group: 'G5', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'end_sum', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0) },
    { id: 'same-end', label: '동끝수', unit: '개', group: 'G5', distKey: 'same_end', statKey: 'same_end', drawKey: 'same_end', calc: (nums) => {
        const ends = nums.map(n => n % 10);
        const counts = ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {});
        return Math.max(...Object.values(counts));
    }},
    { id: 'ac', label: 'AC값', unit: '', group: 'G5', distKey: 'ac', statKey: 'ac', drawKey: 'ac', calc: (nums) => calculate_ac(nums) },
    { id: 'span', label: 'Span(간격)', unit: '', group: 'G5', distKey: 'span', statKey: 'span', drawKey: 'span', calc: (nums) => nums[nums.length-1] - nums[0] }
];

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
            nums.sort((a, b) => a - b).forEach(n => {
                const b = document.createElement('div');
                b.className = `ball mini ${getBallColorClass(n)}`;
                b.innerText = n;
                list.appendChild(b);
            });
        } else { section.style.display = 'none'; }
    } catch (e) { section.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', function() {
    restoreMyNumbers();
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            globalStatsData = data;
            const dists = data.distributions;
            const stats = data.stats_summary || {};
            INDICATOR_CONFIG.forEach(cfg => {
                const chartId = `${cfg.id}-chart`;
                if (dists[cfg.distKey]) {
                    renderCurveChart(chartId, dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg);
                }
            });
            if (data.recent_draws) renderMiniTables(data.recent_draws.slice(0, 6));
            if (data.frequency) renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('Stats flow failed:', err));
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
    const minVal = Math.min(...valKeys);
    const maxVal = Math.max(...valKeys);

    // [개선] '평균' 지점을 추가하여 '1개' 등의 핵심 데이터 누락 방지
    const statPoints = [
        { label: '최소', val: minVal, cls: 'min-max' },
        { label: '미니 세이프', val: Math.max(minVal, Math.round(mu - 2*sd)), cls: 'safe-zone' },
        { label: '미니 옵티멀', val: Math.max(minVal, Math.round(mu - sd)), cls: 'optimal-zone' },
        { label: '평균', val: Math.round(mu), cls: 'optimal-zone' }, 
        { label: '맥스 옵티멀', val: Math.min(maxVal, Math.round(mu + sd)), cls: 'optimal-zone' },
        { label: '맥스 세이프', val: Math.min(maxVal, Math.round(mu + 2*sd)), cls: 'safe-zone' },
        { label: '최대', val: maxVal, cls: 'min-max' }
    ];

    const priority = { 'optimal-zone': 3, 'safe-zone': 2, 'min-max': 1 };
    
    // [중복 제거 로직 통합] 배지와 라벨이 동일한 데이터를 보게 함
    const labelMap = new Map();
    statPoints.forEach(sp => {
        const existing = labelMap.get(sp.val);
        if (!existing || priority[sp.cls] > priority[existing.cls]) {
            labelMap.set(sp.val, { cls: sp.cls, label: sp.label });
        }
    });

    // 상단 배지 생성 (중복 제거된 고유 값만 표시)
    const bContainer = document.createElement('div');
    bContainer.className = 'stat-badge-container';
    Array.from(labelMap.entries()).sort((a, b) => a[0] - b[0]).forEach(([val, info]) => {
        const badge = document.createElement('div');
        badge.className = `stat-badge ${info.cls}`;
        badge.innerHTML = `${val}${unit.trim()}`;
        bContainer.appendChild(badge);
    });
    container.appendChild(bContainer);

    const width = container.clientWidth || 600;
    const height = 180;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 50;
    const baselineY = height - 25;

    const maxFreq = Math.max(...entries.map(e => e[1]), 1);
    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = baselineY - (e[1] / maxFreq) * chartHeight;
        return { x, y, label: e[0], value: e[1], index: i };
    });

    const finalLabels = [];
    labelMap.forEach((info, val) => {
        let bestIdx = -1; let minD = Infinity;
        points.forEach((p, idx) => {
            const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
            const diff = Math.abs(pVal - val);
            if (diff < minD) { minD = diff; bestIdx = idx; }
        });
        if (bestIdx !== -1) finalLabels.push({ index: bestIdx, cls: info.cls });
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

    const hatchId = `hatch-optimal-${elementId}`;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", hatchId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "4"); pattern.setAttribute("height", "4");
    pattern.setAttribute("patternTransform", "rotate(45)");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0"); line.setAttribute("y1", "0");
    line.setAttribute("x2", "0"); line.setAttribute("y2", "4");
    line.setAttribute("stroke", "rgba(46, 204, 113, 0.6)"); line.setAttribute("stroke-width", "1.5");
    pattern.appendChild(line); defs.appendChild(pattern); svg.appendChild(defs);

    const drawZone = (z, color) => {
        // 라벨과 동일하게 반올림된 정수 경계를 기준으로 구역 설정
        const minBound = Math.round(mu - z * sd);
        const maxBound = Math.round(mu + z * sd);

        const zPoints = points.filter(p => {
            const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
            return !isNaN(pVal) && pVal >= minBound && pVal <= maxBound;
        });

        if (zPoints.length > 0) {
            const firstP = zPoints[0]; const lastP = zPoints[zPoints.length - 1];
            let d = "";
            // 단일 포인트인 경우(예: 1개만 옵티멀일 때) 가시성 확보를 위해 너비 부여
            if (zPoints.length === 1) {
                const w = 25; 
                d = `M ${firstP.x - w},${baselineY} L ${firstP.x - w},${firstP.y} L ${firstP.x + w},${firstP.y} L ${firstP.x + w},${baselineY} Z`;
            } else {
                // 여러 포인트인 경우 점들을 잇고 아래 바닥까지 채움
                d = `M ${firstP.x},${baselineY} `;
                zPoints.forEach(p => { d += `L ${p.x},${p.y} `; });
                d += `L ${lastP.x},${baselineY} Z`;
            }
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
        }
    };
    drawZone(2, "rgba(52, 152, 219, 0.12)"); 
    drawZone(1, `url(#${hatchId})`); 
    drawZone(1, "rgba(46, 204, 113, 0.05)"); 

    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3498db"); curvePath.setAttribute("stroke-width", "2"); svg.appendChild(curvePath);

    finalLabels.forEach(lb => {
        const p = points[lb.index];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 3);
        circle.setAttribute("fill", "#2980b9"); svg.appendChild(circle);
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
        let textColor = "#718096";
        if (lb.cls === 'safe-zone') textColor = "#3498db";
        else if (lb.cls === 'optimal-zone') textColor = "#27ae60";
        txt.setAttribute("fill", textColor); txt.style.fontSize = "0.75rem"; txt.style.fontWeight = "900";
        txt.textContent = p.label + unit; svg.appendChild(txt);
    });

    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (saved && config && config.calc) {
        try {
            const nums = JSON.parse(saved);
            const myVal = config.calc(nums.sort((a,b)=>a-b), globalStatsData);
            if (myVal !== null) {
                let closestP = points[0]; let minD = Infinity;
                points.forEach(p => {
                    const v = parseFloat(p.label.split(/[ :\-]/)[0]);
                    const d = Math.abs(v - myVal);
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
    INDICATOR_CONFIG.forEach(cfg => {
        const bodyId = `${cfg.id}-mini-body`;
        const tbody = document.getElementById(bodyId);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const balls = (draw.nums || []).map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            const val = draw[cfg.drawKey] !== undefined ? draw[cfg.drawKey] : (draw[cfg.statKey] !== undefined ? draw[cfg.statKey] : '-');
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${balls}</div></td><td><strong>${val}</strong></td>`;
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
        const b = document.createElement('div'); b.className = `bar ${getBallColorClass(i)}`; b.style.height = `${h}%`;
        const v = document.createElement('span'); v.className = 'bar-value'; v.innerText = f;
        const l = document.createElement('span'); l.className = 'bar-label'; l.innerText = i;
        w.appendChild(v); w.appendChild(b); w.appendChild(l); container.appendChild(w);
    }
}

function isPrime(num) { if (num <= 1) return false; return [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43].includes(num); }
function isComposite(num) { return num > 1 && !isPrime(num); }
function calculate_ac(nums) {
    const diffs = new Set();
    for (let i = 0; i < nums.length; i++) { for (let j = i + 1; j < nums.length; j++) { diffs.add(Math.abs(nums[i] - nums[j])); } }
    return diffs.size - (nums.length - 1);
}
function getBallColorClass(num) {
    if (num <= 10) return 'yellow'; if (num <= 20) return 'blue'; if (num <= 30) return 'red';
    if (num <= 40) return 'gray'; return 'green';
}
