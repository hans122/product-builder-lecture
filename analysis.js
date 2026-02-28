document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const total = data.total_draws;
            const stats = data.stats_summary || {};

            // 0. 파레토 영역 데이터 처리
            if (data.frequency && data.recent_draws) {
                renderParetoMiniTable(data.frequency, data.recent_draws.slice(0, 6));
            }

            // 1. 기본 및 합계
            if (dists.sum) {
                const sumOrder = ["100 미만", "100-119", "120-139", "140-159", "160-179", "180-199", "200 이상"];
                const sortedSum = {};
                sumOrder.forEach(range => { if (dists.sum[range] !== undefined) sortedSum[range] = dists.sum[range]; });
                renderCurveChart('sum-chart', sortedSum, '', stats.sum);
            }
            if (dists.odd_even) renderCurveChart('odd-even-chart', dists.odd_even, ' : ');
            if (dists.high_low) renderCurveChart('high-low-chart', dists.high_low, ' : ');

            // 2. 특수 번호 및 끝수
            if (dists.prime) renderCurveChart('prime-chart', dists.prime, '개');
            if (dists.composite) renderCurveChart('composite-chart', dists.composite, '개');
            if (dists.multiple_3) renderCurveChart('multiple-3-chart', dists.multiple_3, '개');
            if (dists.multiple_5) renderCurveChart('multiple-5-chart', dists.multiple_5, '개');
            if (dists.square) renderCurveChart('square-chart', dists.square, '개');
            if (dists.double_num) renderCurveChart('double-chart', dists.double_num, '개');
            if (dists.same_end) renderCurveChart('same-end-chart', dists.same_end, '개');

            // 3. 상관관계
            if (dists.period_1) renderCurveChart('period-1-chart', dists.period_1, '개');
            if (dists.period_1_2) {
                const data1_2 = Object.entries(dists.period_1_2).map(([k, v]) => [`${k}개`, v, `${((v/total)*100).toFixed(1)}%`]);
                renderCurveChart('period-1-2-chart', data1_2, '회');
            }
            if (dists.period_1_3) {
                const data1_3 = Object.entries(dists.period_1_3).map(([k, v]) => [`${k}개`, v, `${((v/total)*100).toFixed(1)}%`]);
                renderCurveChart('period-1-3-chart', data1_3, '회');
            }
            if (dists.neighbor) renderCurveChart('neighbor-chart', dists.neighbor, '개');
            if (dists.consecutive) renderCurveChart('consecutive-chart', dists.consecutive, '쌍');

            // 4. 구간 및 패턴
            if (dists.bucket_15) renderCurveChart('bucket-15-chart', dists.bucket_15, '구간');
            if (dists.bucket_9) renderCurveChart('bucket-9-chart', dists.bucket_9, '구간');
            if (dists.bucket_5) renderCurveChart('bucket-5-chart', dists.bucket_5, '구간');
            if (dists.bucket_3) renderCurveChart('bucket-3-chart', dists.bucket_3, '구간');
            if (dists.color) renderCurveChart('color-chart', dists.color, '색상');
            if (dists.pattern_corner) renderCurveChart('pattern-corner-chart', dists.pattern_corner, '개');
            if (dists.pattern_triangle) renderCurveChart('pattern-triangle-chart', dists.pattern_triangle, '개');

            // 5. 전문 지표
            if (dists.ac) renderCurveChart('ac-chart', dists.ac, '', stats.ac);
            if (dists.span) renderCurveChart('span-chart', dists.span, '', stats.span);
            if (dists.end_sum) renderCurveChart('end-sum-chart', dists.end_sum, '');

            // 미니 테이블 렌더링
            setTimeout(() => {
                if (data.recent_draws) renderMiniTables(data.recent_draws.slice(0, 6));
            }, 100);
            
            if (data.frequency) renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('Stats flow failed:', err));

    restoreMyNumbers();
});

function getZones(frequency) {
    const sortedFreq = Object.entries(frequency)
        .map(([num, freq]) => ({ num: parseInt(num), freq }))
        .sort((a, b) => b.freq - a.freq);
    
    return {
        gold: sortedFreq.slice(0, 9).map(x => x.num),
        silver: sortedFreq.slice(9, 23).map(x => x.num),
        normal: sortedFreq.slice(23, 36).map(x => x.num),
        cold: sortedFreq.slice(36).map(x => x.num)
    };
}

function renderParetoMiniTable(frequency, recentDraws) {
    const tbody = document.getElementById('pareto-mini-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const zones = getZones(frequency);

    recentDraws.forEach(draw => {
        const nums = draw.nums || [];
        const g = nums.filter(n => zones.gold.includes(n)).length;
        const s = nums.filter(n => zones.silver.includes(n)).length;
        const n = nums.filter(n => zones.normal.includes(n)).length;
        const c = nums.filter(n => zones.cold.includes(n)).length;

        const tr = document.createElement('tr');
        const ballsHtml = nums.map(num => {
            let zoneClass = '';
            if (zones.gold.includes(num)) zoneClass = 'golden';
            else if (zones.silver.includes(num)) zoneClass = 'silver';
            return `<div class="table-ball mini ${getBallColorClass(num)} ${zoneClass}">${num}</div>`;
        }).join('');

        tr.innerHTML = `
            <td>${draw.no}회</td>
            <td><div class="table-nums">${ballsHtml}</div></td>
            <td><strong style="color:#2c3e50;">${g}:${s}:${n}:${c}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMiniTables(draws) {
    const config = [
        { id: 'sum-mini-body', key: 'sum' },
        { id: 'odd-even-mini-body', key: 'odd_even' },
        { id: 'high-low-mini-body', key: 'high_low' },
        { id: 'period-1-mini-body', key: 'period_1' },
        { id: 'period-1-2-mini-body', key: 'period_1_2' },
        { id: 'period-1-3-mini-body', key: 'period_1_3' },
        { id: 'neighbor-mini-body', key: 'neighbor' },
        { id: 'consecutive-mini-body', key: 'consecutive' },
        { id: 'prime-mini-body', key: 'prime' },
        { id: 'composite-mini-body', key: 'composite' },
        { id: 'multiple-3-mini-body', key: 'multiple_3' },
        { id: 'multiple-5-mini-body', key: 'm5' },
        { id: 'square-mini-body', key: 'square' },
        { id: 'double-mini-body', key: 'double' },
        { id: 'bucket-15-mini-body', key: 'b15' },
        { id: 'bucket-9-mini-body', key: 'b9' },
        { id: 'bucket-5-mini-body', key: 'b5' },
        { id: 'bucket-3-mini-body', key: 'b3' },
        { id: 'color-mini-body', key: 'color' },
        { id: 'pattern-corner-mini-body', key: 'p_corner' },
        { id: 'pattern-triangle-mini-body', key: 'p_tri' },
        { id: 'end-sum-mini-body', key: 'end_sum' },
        { id: 'same-end-mini-body', key: 'same_end' },
        { id: 'ac-mini-body', key: 'ac' },
        { id: 'span-mini-body', key: 'span' }
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

    // 내 번호 분석값 계산
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    let myCurrentVal = null;
    if (savedNumbers) {
        const nums = JSON.parse(savedNumbers);
        if (elementId.includes('sum-chart')) myCurrentVal = nums.reduce((a,b)=>a+b, 0);
        else if (elementId.includes('ac-chart')) myCurrentVal = calculate_ac(nums);
        else if (elementId.includes('span-chart')) myCurrentVal = nums[5] - nums[0];
        else if (elementId.includes('odd-even')) myCurrentVal = nums.filter(n => n % 2 !== 0).length + ":" + nums.filter(n => n % 2 === 0).length;
        else if (elementId.includes('high-low')) myCurrentVal = nums.filter(n => n <= 22).length + ":" + nums.filter(n => n > 22).length;
        else if (elementId.includes('prime')) myCurrentVal = nums.filter(isPrime).length;
        else if (elementId.includes('multiple-3')) myCurrentVal = nums.filter(n => n % 3 === 0).length;
        else if (elementId.includes('multiple-5')) myCurrentVal = nums.filter(n => n % 5 === 0).length;
        else if (elementId.includes('bucket-15')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/15))).size;
        else if (elementId.includes('bucket-3')) myCurrentVal = new Set(nums.map(n => Math.floor((n-1)/3))).size;
        else if (elementId.includes('color')) myCurrentVal = new Set(nums.map(getBallColorClass)).size;
    }

    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = baselineY - (e[1] / maxVal) * chartHeight;
        return { x, y, label: e[0], value: e[1], percentage: e[2] };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

    // 1. 실버 존 (±2σ, 95% 범위)
    if (statSummary) {
        const silverPoints = points.filter(p => {
            const val = parseFloat(p.label.includes('-') ? p.label.split('-')[0] : p.label);
            return !isNaN(val) && Math.abs(val - statSummary.mean) <= statSummary.std * 2;
        });
        if (silverPoints.length > 1) {
            const sPathData = `M ${silverPoints[0].x},${baselineY} ` + silverPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${silverPoints[silverPoints.length-1].x},${baselineY} Z`;
            const sPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            sPath.setAttribute("d", sPathData);
            sPath.setAttribute("fill", "rgba(52, 152, 219, 0.1)"); // 매우 연한 파랑
            svg.appendChild(sPath);
        }
    }

    // 2. 골드 존 (±1σ, 68% 범위)
    let goldenPoints = [];
    if (statSummary) {
        goldenPoints = points.filter(p => {
            const val = parseFloat(p.label.includes('-') ? p.label.split('-')[0] : p.label);
            return !isNaN(val) && Math.abs(val - statSummary.mean) <= statSummary.std;
        });
    } else {
        goldenPoints = points.filter(p => p.value >= maxVal * 0.5);
    }

    if (goldenPoints.length > 1) {
        const gPathData = `M ${goldenPoints[0].x},${baselineY} ` + goldenPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${goldenPoints[goldenPoints.length-1].x},${baselineY} Z`;
        const gPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        gPath.setAttribute("d", gPathData);
        gPath.setAttribute("fill", "rgba(241, 196, 15, 0.2)"); // 매우 연한 금색
        svg.appendChild(gPath);
    }

    // 3. 곡선 라인
    const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData);
    curvePath.setAttribute("fill", "none");
    curvePath.setAttribute("stroke", "#3498db");
    curvePath.setAttribute("stroke-width", "3");
    svg.appendChild(curvePath);

    // 4. 평균선 가이드
    if (statSummary) {
        const meanIdx = entries.findIndex(e => {
            const val = parseFloat(e[0].includes('-') ? e[0].split('-')[0] : e[0]);
            return val >= statSummary.mean;
        });
        if (meanIdx !== -1) {
            const meanX = padding + (meanIdx / (entries.length - 1)) * chartWidth;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", meanX); line.setAttribute("y1", baselineY);
            line.setAttribute("x2", meanX); line.setAttribute("y2", baselineY - chartHeight - 10);
            line.setAttribute("stroke", "#27ae60"); line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-dasharray", "4 2");
            svg.appendChild(line);
        }
    }

    // 5. 포인트 및 마커
    points.forEach(p => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 3);
        circle.setAttribute("fill", "#3498db");
        svg.appendChild(circle);

        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", "#7f8c8d"); txt.style.fontSize = "0.6rem"; txt.style.fontWeight = "bold";
        txt.textContent = p.label + (isNaN(p.label) ? "" : unit);
        svg.appendChild(txt);
    });

    // 내 위치 마커 최상단
    points.forEach(p => {
        let isMine = false;
        if (myCurrentVal !== null) {
            if (typeof myCurrentVal === 'string') { if (p.label === myCurrentVal) isMine = true; }
            else {
                if (p.label.includes('-')) {
                    const [min, max] = p.label.split('-').map(Number);
                    if (myCurrentVal >= min && myCurrentVal <= max) isMine = true;
                } else if (Math.round(myCurrentVal) === Math.round(parseFloat(p.label))) { isMine = true; }
            }
        }

        if (isMine) {
            const myCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            myCircle.setAttribute("cx", p.x); myCircle.setAttribute("cy", p.y);
            myCircle.setAttribute("r", 8);
            myCircle.setAttribute("class", "my-pos-marker");
            svg.appendChild(myCircle);

            const myLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            myLabel.setAttribute("x", p.x); myLabel.setAttribute("y", p.y - 15);
            myLabel.setAttribute("text-anchor", "middle"); myLabel.setAttribute("fill", "#e74c3c");
            myLabel.style.fontSize = "0.75rem"; myLabel.style.fontWeight = "bold";
            myLabel.textContent = "내 번호";
            svg.appendChild(myLabel);
        }
    });

    container.appendChild(svg);
}

function renderFrequencyChart(data) {
    const container = document.getElementById('full-frequency-chart');
    if(!container) return;
    container.innerHTML = '';
    const freqs = Object.values(data);
    const maxFreq = Math.max(...freqs, 1);
    for (let i = 1; i <= 45; i++) {
        const f = data[i] || 0;
        const h = (f / maxFreq) * 85;
        const w = document.createElement('div');
        w.className = 'bar-wrapper';
        const b = document.createElement('div');
        b.className = `bar ${getBallColorClass(i)}`;
        b.style.height = `${h}%`;
        const v = document.createElement('span');
        v.className = 'bar-value'; v.innerText = f;
        const l = document.createElement('span');
        l.className = 'bar-label'; l.innerText = i;
        w.appendChild(v); w.appendChild(b); w.appendChild(l);
        container.appendChild(w);
    }
}

function restoreMyNumbers() {
    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (saved) {
        const nums = JSON.parse(saved);
        const section = document.getElementById('my-numbers-section');
        const list = document.getElementById('my-numbers-list');
        if (section && list) {
            section.style.display = 'flex';
            list.innerHTML = '';
            nums.forEach(n => {
                const b = document.createElement('div');
                b.className = `ball mini ${getBallColorClass(n)}`;
                b.innerText = n;
                list.appendChild(b);
            });
        }
    }
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}
