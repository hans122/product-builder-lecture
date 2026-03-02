// [표준 지표 설정] 모든 화면에서 공통으로 사용 가능하도록 설계
const INDICATOR_CONFIG = [
    { id: 'sum', label: '총합', unit: '', group: 'G1', distKey: 'sum', statKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
    { id: 'odd-even', label: '홀짝 비율', unit: ' : ', group: 'G1', distKey: 'odd_even', statKey: 'odd_count', calc: (nums) => nums.filter(n => n % 2 !== 0).length },
    { id: 'high-low', label: '고저 비율', unit: ' : ', group: 'G1', distKey: 'high_low', statKey: 'low_count', calc: (nums) => nums.filter(n => n <= 22).length },
    { id: 'period-1', label: '직전 1회차 매칭', unit: '개', group: 'G2', distKey: 'period_1', statKey: 'period_1', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : null },
    { id: 'neighbor', label: '이웃수', unit: '개', group: 'G2', distKey: 'neighbor', statKey: 'neighbor', calc: (nums, data) => {
        if (!data || !data.last_3_draws) return null;
        const neighbors = new Set();
        data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
        return nums.filter(n => neighbors.has(n)).length;
    }},
    { id: 'period-1-2', label: '1~2회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_2', statKey: 'period_1_2', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length : null },
    { id: 'period-1-3', label: '1~3회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_3', statKey: 'period_1_3', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[]), ...(data.last_3_draws[2]||[])]).has(n)).length : null },
    { id: 'consecutive', label: '연속번호 쌍', unit: '쌍', group: 'G2', distKey: 'consecutive', statKey: 'consecutive', calc: (nums) => {
        let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++; return cnt;
    }},
    { id: 'prime', label: '소수 포함', unit: '개', group: 'G3', distKey: 'prime', statKey: 'prime', calc: (nums) => nums.filter(isPrime).length },
    { id: 'composite', label: '합성수 포함', unit: '개', group: 'G3', distKey: 'composite', statKey: 'composite', calc: (nums) => nums.filter(isComposite).length },
    { id: 'multiple-3', label: '3배수 포함', unit: '개', group: 'G3', distKey: 'multiple_3', statKey: 'multiple_3', calc: (nums) => nums.filter(n => n % 3 === 0).length },
    { id: 'multiple-5', label: '5배수 포함', unit: '개', group: 'G3', distKey: 'multiple_5', statKey: 'multiple_5', calc: (nums) => nums.filter(n => n % 5 === 0).length },
    { id: 'square', label: '제곱수 포함', unit: '개', group: 'G3', distKey: 'square', statKey: 'square', calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length },
    { id: 'double', label: '쌍수 포함', unit: '개', group: 'G3', distKey: 'double_num', statKey: 'double_num', calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length },
    { id: 'bucket-15', label: '3분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_15', statKey: 'bucket_15', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size },
    { id: 'bucket-9', label: '5분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_9', statKey: 'bucket_9', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size },
    { id: 'bucket-5', label: '9분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_5', statKey: 'bucket_5', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size },
    { id: 'bucket-3', label: '15분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_3', statKey: 'bucket_3', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size },
    { id: 'color', label: '포함 색상수', unit: '색상', group: 'G4', distKey: 'color', statKey: 'color', calc: (nums) => new Set(nums.map(getBallColorClass)).size },
    { id: 'pattern-corner', label: '모서리 패턴', unit: '개', group: 'G4', distKey: 'pattern_corner', statKey: 'pattern_corner', calc: (nums) => nums.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length },
    { id: 'pattern-triangle', label: '삼각형 패턴', unit: '개', group: 'G4', distKey: 'pattern_triangle', statKey: 'pattern_triangle', calc: (nums) => nums.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length },
    { id: 'end-sum', label: '끝수합', unit: '', group: 'G5', distKey: 'end_sum', statKey: 'end_sum', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0) },
    { id: 'same-end', label: '동끝수', unit: '개', group: 'G5', distKey: 'same_end', statKey: 'same_end', calc: (nums) => {
        const ends = nums.map(n => n % 10);
        return Math.max(...Object.values(ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {})));
    }},
    { id: 'ac', label: 'AC값', unit: '', group: 'G5', distKey: 'ac', statKey: 'ac', calc: (nums) => calculate_ac(nums) },
    { id: 'span', label: 'Span(간격)', unit: '', group: 'G5', distKey: 'span', statKey: 'span', calc: (nums) => nums[5] - nums[0] }
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

    // 핵심 통계 6개 지점 정의 (상단 배지와 하단 라벨 공용)
    const statPoints = [
        { label: '최소', val: minVal, cls: 'min-max' },
        { label: '미니 세이프', val: Math.max(minVal, Math.round(mu - 2*sd)), cls: 'safe-zone' },
        { label: '미니 옵티멀', val: Math.max(minVal, Math.round(mu - sd)), cls: 'optimal-zone' },
        { label: '맥스 옵티멀', val: Math.min(maxVal, Math.round(mu + sd)), cls: 'optimal-zone' },
        { label: '맥스 세이프', val: Math.min(maxVal, Math.round(mu + 2*sd)), cls: 'safe-zone' },
        { label: '최대', val: maxVal, cls: 'min-max' }
    ];

    // 상단 배지 생성 (값만 표시)
    const bContainer = document.createElement('div');
    bContainer.className = 'stat-badge-container';
    statPoints.forEach(p => {
        const badge = document.createElement('div');
        badge.className = `stat-badge ${p.cls}`;
        badge.innerHTML = `${p.val}${unit.trim()}`;
        bContainer.appendChild(badge);
    });
    container.appendChild(bContainer);

    const width = container.clientWidth || 600;
    const height = 180;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 50;
    const baselineY = height - 25;

    const values = entries.map(e => e[1]);
    const maxFreq = Math.max(...values, 1);

    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = baselineY - (e[1] / maxFreq) * chartHeight;
        return { x, y, label: e[0], value: e[1], index: i };
    });

    // [개선] 차트 하단 X축 라벨을 위 6개 지점과 정확히 일치하도록 설정
    const labelSet = new Set();
    statPoints.forEach(sp => {
        let bestIdx = -1; let minD = Infinity;
        points.forEach((p, idx) => {
            const val = parseFloat(p.label.split(/[ :\-]/)[0]);
            const diff = Math.abs(val - sp.val);
            if (diff < minD) { minD = diff; bestIdx = idx; }
        });
        if (bestIdx !== -1) labelSet.add(bestIdx);
    });

    const finalSafeIndices = Array.from(labelSet).sort((a, b) => a - b);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

    const drawZone = (z, color) => {
        const zPoints = points.filter(p => {
            const val = parseFloat(p.label.split(/[ :\-]/)[0]);
            return !isNaN(val) && Math.abs(val - mu) <= sd * z;
        });
        if (zPoints.length > 1) {
            const d = `M ${zPoints[0].x},${baselineY} ` + zPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${zPoints[zPoints.length-1].x},${baselineY} Z`;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
        }
    };
    drawZone(2, "rgba(52, 152, 219, 0.08)"); drawZone(1, "rgba(46, 204, 113, 0.15)");

    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3498db"); curvePath.setAttribute("stroke-width", "2"); svg.appendChild(curvePath);

    points.forEach(p => {
        const labelInfo = statPoints.find(sp => {
            const val = parseFloat(p.label.split(/[ :\-]/)[0]);
            return val === sp.val;
        });

        if (labelSet.has(p.index)) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 3);
            circle.setAttribute("fill", "#2980b9"); svg.appendChild(circle);

            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
            
            // 색상 적용
            let textColor = "#2c3e50"; // 기본값
            if (labelInfo) {
                if (labelInfo.cls === 'min-max') textColor = "#718096";
                else if (labelInfo.cls === 'safe-zone') textColor = "#3498db";
                else if (labelInfo.cls === 'optimal-zone') textColor = "#27ae60";
            }
            
            txt.setAttribute("fill", textColor);
            txt.style.fontSize = "0.75rem"; txt.style.fontWeight = "900";
            txt.textContent = p.label + unit; svg.appendChild(txt);
        }
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
            const val = draw[cfg.statKey] !== undefined ? draw[cfg.statKey] : (draw[cfg.distKey] !== undefined ? draw[cfg.distKey] : '-');
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
