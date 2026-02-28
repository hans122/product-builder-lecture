document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const stats = data.stats_summary || {};

            // 1. 기본 및 합계
            if (dists.sum) renderCurveChart('sum-chart', dists.sum, '', stats.sum);
            if (dists.odd_even) renderCurveChart('odd-even-chart', dists.odd_even, ' : ', stats.odd_count);
            if (dists.high_low) renderCurveChart('high-low-chart', dists.high_low, ' : ', stats.low_count);

            // 2. 상관관계
            if (dists.period_1) renderCurveChart('period-1-chart', dists.period_1, '개', stats.period_1);
            if (dists.neighbor) renderCurveChart('neighbor-chart', dists.neighbor, '개', stats.neighbor);
            if (dists.period_1_2) renderCurveChart('period-1-2-chart', dists.period_1_2, '개', stats.period_1_2);
            if (dists.period_1_3) renderCurveChart('period-1-3-chart', dists.period_1_3, '개', stats.period_1_3);
            if (dists.consecutive) renderCurveChart('consecutive-chart', dists.consecutive, '쌍', stats.consecutive);

            // 3. 특수 번호
            if (dists.prime) renderCurveChart('prime-chart', dists.prime, '개', stats.prime);
            if (dists.composite) renderCurveChart('composite-chart', dists.composite, '개', stats.composite);
            if (dists.multiple_3) renderCurveChart('multiple-3-chart', dists.multiple_3, '개', stats.multiple_3);
            if (dists.multiple_5) renderCurveChart('multiple-5-chart', dists.multiple_5, '개', stats.multiple_5);
            if (dists.square) renderCurveChart('square-chart', dists.square, '개', stats.square);
            if (dists.double_num) renderCurveChart('double-chart', dists.double_num, '개', stats.double_num);

            // 4. 구간 및 패턴
            if (dists.bucket_15) renderCurveChart('bucket-15-chart', dists.bucket_15, '구간', stats.bucket_15);
            if (dists.bucket_9) renderCurveChart('bucket-9-chart', dists.bucket_9, '구간', stats.bucket_9);
            if (dists.bucket_5) renderCurveChart('bucket-5-chart', dists.bucket_5, '구간', stats.bucket_5);
            if (dists.bucket_3) renderCurveChart('bucket-3-chart', dists.bucket_3, '구간', stats.bucket_3);
            if (dists.color) renderCurveChart('color-chart', dists.color, '색상', stats.color);
            if (dists.pattern_corner) renderCurveChart('pattern-corner-chart', dists.pattern_corner, '개', stats.pattern_corner);
            if (dists.pattern_triangle) renderCurveChart('pattern-triangle-chart', dists.pattern_triangle, '개', stats.pattern_triangle);

            // 5. 전문 지표
            if (dists.end_sum) renderCurveChart('end-sum-chart', dists.end_sum, '', stats.end_sum);
            if (dists.same_end) renderCurveChart('same-end-chart', dists.same_end, '개', stats.same_end);
            if (dists.ac) renderCurveChart('ac-chart', dists.ac, '', stats.ac);
            if (dists.span) renderCurveChart('span-chart', dists.span, '', stats.span);

            setTimeout(() => { if (data.recent_draws) renderMiniTables(data.recent_draws.slice(0, 6)); }, 100);
            if (data.frequency) renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('Stats flow failed:', err));

    restoreMyNumbers();
});

function renderMiniTables(draws) {
    const config = [
        { id: 'sum-mini-body', key: 'sum' }, { id: 'odd-even-mini-body', key: 'odd_even' }, { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'period-1-mini-body', key: 'period_1' }, { id: 'neighbor-mini-body', key: 'neighbor' },
        { id: 'period-1-2-mini-body', key: 'period_1_2' }, { id: 'period-1-3-mini-body', key: 'period_1_3' }, { id: 'consecutive-mini-body', key: 'consecutive' },
        { id: 'prime-mini-body', key: 'prime' }, { id: 'composite-mini-body', key: 'composite' }, { id: 'multiple-3-mini-body', key: 'multiple_3' },
        { id: 'multiple-5-mini-body', key: 'm5' }, { id: 'square-mini-body', key: 'square' }, { id: 'double-mini-body', key: 'double' },
        { id: 'bucket-15-mini-body', key: 'b15' }, { id: 'bucket-9-mini-body', key: 'b9' }, { id: 'bucket-5-mini-body', key: 'b5' },
        { id: 'bucket-3-mini-body', key: 'b3' }, { id: 'color-mini-body', key: 'color' }, { id: 'pattern-corner-mini-body', key: 'p_corner' },
        { id: 'pattern-triangle-mini-body', key: 'p_tri' }, { id: 'end-sum-mini-body', key: 'end_sum' }, { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'ac-mini-body', key: 'ac' }, { id: 'span-mini-body', key: 'span' }
    ];
    config.forEach(item => {
        const tbody = document.getElementById(item.id);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = (draw.nums || []).map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            let val = draw[item.key] !== undefined ? draw[item.key] : '-';
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
            tbody.appendChild(tr);
        });
    });
}

function isPrime(num) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) {
    return num > 1 && !isPrime(num);
}

function calculate_ac(nums) {
    const diffs = new Set();
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            diffs.add(Math.abs(nums[i] - nums[j]));
        }
    }
    return diffs.size - (nums.length - 1);
}

function renderCurveChart(elementId, distData, unit = '개', statSummary = null) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    const entries = Array.isArray(distData) ? distData : Object.entries(distData);
    if (entries.length < 2) return;

    if (!Array.isArray(distData)) {
        entries.sort((a, b) => {
            const valA = parseFloat(a[0].includes(':') ? a[0].split(':')[0] : (a[0].includes('-') ? a[0].split('-')[0] : a[0]));
            const valB = parseFloat(b[0].includes(':') ? b[0].split(':')[0] : (b[0].includes('-') ? b[0].split('-')[0] : b[0]));
            return isNaN(valA) ? 0 : valA - valB;
        });
    }

    const width = container.clientWidth || 600;
    const height = 180;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 40;
    const baselineY = height - 20;

    const values = entries.map(e => e[1]);
    const maxVal = Math.max(...values, 1);

    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    let myCurrentVal = null;
    if (savedNumbers) {
        const nums = JSON.parse(savedNumbers);
        if (elementId.includes('sum-chart')) myCurrentVal = nums.reduce((a,b)=>a+b, 0);
        else if (elementId.includes('odd-even')) myCurrentVal = nums.filter(n => n % 2 !== 0).length + ":" + nums.filter(n => n % 2 === 0).length;
        else if (elementId.includes('high-low')) myCurrentVal = nums.filter(n => n <= 22).length + ":" + nums.filter(n => n > 22).length;
        else if (elementId.includes('prime')) myCurrentVal = nums.filter(isPrime).length;
        else if (elementId.includes('composite')) myCurrentVal = nums.filter(isComposite).length;
        else if (elementId.includes('multiple-3')) myCurrentVal = nums.filter(n => n % 3 === 0).length;
        else if (elementId.includes('multiple-5')) myCurrentVal = nums.filter(n => n % 5 === 0).length;
        else if (elementId.includes('square')) myCurrentVal = nums.filter(n => [1,4,9,16,25,36].includes(n)).length;
        else if (elementId.includes('double')) myCurrentVal = nums.filter(n => [11,22,33,44].includes(n)).length;
        else if (elementId.includes('bucket-15')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/15))).size;
        else if (elementId.includes('bucket-9')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/9))).size;
        else if (elementId.includes('bucket-5')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/5))).size;
        else if (elementId.includes('bucket-3')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/3))).size;
        else if (elementId.includes('color')) myCurrentVal = new Set(nums.map(getBallColorClass)).size;
        else if (elementId.includes('pattern-corner')) myCurrentVal = nums.filter(n => [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42].includes(n)).length;
        else if (elementId.includes('pattern-triangle')) myCurrentVal = nums.filter(n => [4,10,11,12,16,17,18,19,20,24,25,26,32].includes(n)).length;
        else if (elementId.includes('end-sum')) myCurrentVal = nums.reduce((a, b) => a + (b % 10), 0);
        else if (elementId.includes('same-end')) {
            const counts = {}; nums.map(n => n % 10).forEach(x => counts[x] = (counts[x] || 0) + 1);
            myCurrentVal = Math.max(...Object.values(counts));
        }
        else if (elementId.includes('ac-chart')) myCurrentVal = calculate_ac(nums);
        else if (elementId.includes('span-chart')) myCurrentVal = nums[5] - nums[0];
    }

    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = baselineY - (e[1] / maxVal) * chartHeight;
        return { x, y, label: e[0], value: e[1] };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

    if (statSummary) {
        const mu = statSummary.mean; const sd = statSummary.std;
        const drawZone = (z, color) => {
            const zPoints = points.filter(p => {
                const val = parseFloat(p.label.includes(':') ? p.label.split(':')[0] : (p.label.includes('-') ? p.label.split('-')[0] : p.label));
                return !isNaN(val) && Math.abs(val - mu) <= sd * z;
            });
            if (zPoints.length > 1) {
                const data = `M ${zPoints[0].x},${baselineY} ` + zPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${zPoints[zPoints.length-1].x},${baselineY} Z`;
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", data); path.setAttribute("fill", color); svg.appendChild(path);
            }
        };
        drawZone(2, "rgba(52, 152, 219, 0.1)"); drawZone(1, "rgba(46, 204, 113, 0.2)");
    }

    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3498db"); curvePath.setAttribute("stroke-width", "3"); svg.appendChild(curvePath);

    points.forEach(p => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 3);
        circle.setAttribute("fill", "#3498db"); svg.appendChild(circle);

        let isBoundary = false;
        if (statSummary) {
            const val = parseFloat(p.label.includes(':') ? p.label.split(':')[0] : (p.label.includes('-') ? p.label.split('-')[0] : p.label));
            const z = Math.abs(val - statSummary.mean) / statSummary.std;
            if (Math.abs(z - Math.round(z)) < 0.1 && Math.round(z) <= 2) isBoundary = true;
        }
        if (entries.length <= 10 || isBoundary || p === points[0] || p === points[points.length-1]) {
            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
            txt.setAttribute("fill", "#7f8c8d"); txt.style.fontSize = "0.6rem"; txt.style.fontWeight = "bold";
            txt.textContent = p.label + (isNaN(p.label) ? "" : unit); svg.appendChild(txt);
        }

        let isMine = false;
        if (myCurrentVal !== null) {
            if (typeof myCurrentVal === 'string') { if (p.label === myCurrentVal) isMine = true; }
            else if (Math.round(myCurrentVal) === Math.round(parseFloat(p.label))) isMine = true;
        }
        if (isMine) {
            const mc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            mc.setAttribute("cx", p.x); mc.setAttribute("cy", p.y); mc.setAttribute("r", 8);
            mc.setAttribute("class", "my-pos-marker"); svg.appendChild(mc);
            const ml = document.createElementNS("http://www.w3.org/2000/svg", "text");
            ml.setAttribute("x", p.x); ml.setAttribute("y", p.y - 15); ml.setAttribute("text-anchor", "middle");
            ml.setAttribute("fill", "#e74c3c"); ml.style.fontSize = "0.75rem"; ml.style.fontWeight = "bold";
            ml.textContent = "내 번호"; svg.appendChild(ml);
        }
    });
    container.appendChild(svg);
}

function renderFrequencyChart(data) {
    const container = document.getElementById('full-frequency-chart');
    if(!container) return;
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

function restoreMyNumbers() {
    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (saved) {
        const nums = JSON.parse(saved); const section = document.getElementById('my-numbers-section');
        const list = document.getElementById('my-numbers-list');
        if (section && list) {
            section.style.display = 'flex'; list.innerHTML = '';
            nums.forEach(n => {
                const b = document.createElement('div'); b.className = `ball mini ${getBallColorClass(n)}`;
                b.innerText = n; list.appendChild(b);
            });
        }
    }
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow'; if (num <= 20) return 'blue'; if (num <= 30) return 'red';
    if (num <= 40) return 'gray'; return 'green';
}