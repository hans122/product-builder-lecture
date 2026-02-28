document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            const dists = data.distributions;
            const total = data.total_draws;
            const stats = data.stats_summary || {};

            // 1. 기본 및 합계 (정규분포 곡선 적용)
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

            // 5. 전문 지표 (AC, Span 곡선 적용)
            if (dists.ac) renderCurveChart('ac-chart', dists.ac, '', stats.ac);
            if (dists.span) renderCurveChart('span-chart', dists.span, '', stats.span);
            if (dists.end_sum) renderCurveChart('end-sum-chart', dists.end_sum, '');

            // 공통: 최근 6회차 미니 테이블
            if (data.recent_draws) renderMiniTables(data.recent_draws.slice(0, 6));
            
            // 번호별 빈도 차트
            if (data.frequency) renderFrequencyChart(data.frequency);
        })
        .catch(err => console.error('Stats load failed:', err));

    restoreMyNumbers();
});

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
            const ballsHtml = draw.nums.map(n => `<div class="table-ball mini ${getBallColorClass(n)}">${n}</div>`).join('');
            let val = draw[item.key] !== undefined ? draw[item.key] : '-';
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
            tbody.appendChild(tr);
        });
    });
}

/**
 * SVG 곡선 차트 렌더러
 */
function renderCurveChart(elementId, distData, unit = '개', statSummary = null) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    const entries = Array.isArray(distData) ? distData : Object.entries(distData);
    // 숫자형 라벨 정렬
    if (!Array.isArray(distData)) {
        entries.sort((a, b) => {
            const valA = parseFloat(a[0].includes('-') ? a[0].split('-')[0] : a[0]);
            const valB = parseFloat(b[0].includes('-') ? b[0].split('-')[0] : b[0]);
            return valA - valB;
        });
    }

    const width = container.clientWidth || 600;
    const height = 180;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 40;

    const values = entries.map(e => e[1]);
    const maxVal = Math.max(...values, 1);

    // 내 위치 값 계산
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    let myCurrentVal = null;
    if (savedNumbers) {
        const nums = JSON.parse(savedNumbers);
        if (elementId.includes('sum')) myCurrentVal = nums.reduce((a,b)=>a+b, 0);
        else if (elementId.includes('ac')) myCurrentVal = calculate_ac(nums);
        else if (elementId.includes('span')) myCurrentVal = nums[5] - nums[0];
    }

    // 좌표 계산
    const points = entries.map((e, i) => {
        const x = padding + (i / (entries.length - 1)) * chartWidth;
        const y = (height - 20) - (e[1] / maxVal) * chartHeight;
        return { x, y, label: e[0], value: e[1], percentage: e[2] };
    });

    // SVG 생성
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "dist-curve-svg");

    // 1. 영역 채우기 (Area)
    const areaPathData = `M ${points[0].x},${height - 20} ` + 
        points.map(p => `L ${p.x},${p.y}`).join(' ') + 
        ` L ${points[points.length-1].x},${height - 20} Z`;
    
    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    areaPath.setAttribute("d", areaPathData);
    areaPath.setAttribute("class", "area-path");
    svg.appendChild(areaPath);

    // 2. 골든존 채우기 (정규분포 요약이 있을 경우)
    if (statSummary) {
        const goldenPoints = points.filter(p => {
            const val = parseFloat(p.label.includes('-') ? p.label.split('-')[0] : p.label);
            return Math.abs(val - statSummary.mean) <= statSummary.std;
        });
        if (goldenPoints.length > 1) {
            const goldenPathData = `M ${goldenPoints[0].x},${height - 20} ` + 
                goldenPoints.map(p => `L ${p.x},${p.y}`).join(' ') + 
                ` L ${goldenPoints[goldenPoints.length-1].x},${height - 20} Z`;
            const goldenPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            goldenPath.setAttribute("d", goldenPathData);
            goldenPath.setAttribute("class", "golden-zone-path");
            svg.appendChild(goldenPath);
        }
    }

    // 3. 곡선 (Curve)
    const curvePathData = `M ${points[0].x},${points[0].y} ` + 
        points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    curvePath.setAttribute("d", curvePathData);
    curvePath.setAttribute("class", "curve-path");
    svg.appendChild(curvePath);

    // 4. 포인트 및 라벨
    points.forEach((p, i) => {
        // 포인트 마커
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x);
        circle.setAttribute("cy", p.y);
        circle.setAttribute("r", 4);
        circle.setAttribute("class", "curve-point");
        
        // 내 위치 마커 체크
        if (myCurrentVal !== null) {
            let isMine = false;
            if (p.label.includes('-')) {
                const [min, max] = p.label.split('-').map(Number);
                if (myCurrentVal >= min && myCurrentVal <= max) isMine = true;
            } else if (Math.round(myCurrentVal) === Math.round(parseFloat(p.label))) {
                isMine = true;
            }
            if (isMine) circle.setAttribute("class", "curve-point my-pos-marker");
        }
        svg.appendChild(circle);

        // 데이터 값 라벨 (상단)
        const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textVal.setAttribute("x", p.x);
        textVal.setAttribute("y", p.y - 10);
        textVal.setAttribute("text-anchor", "middle");
        textVal.setAttribute("class", "axis-label");
        textVal.style.fontSize = "0.55rem";
        textVal.textContent = p.value;
        svg.appendChild(textVal);

        // X축 라벨 (하단)
        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("x", p.x);
        textLabel.setAttribute("y", height - 2);
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.setAttribute("class", "axis-label");
        textLabel.textContent = p.label + (isNaN(p.label) ? "" : unit);
        svg.appendChild(textLabel);
    });

    container.appendChild(svg);
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

function renderFrequencyChart(data) {
    const chartContainer = document.getElementById('full-frequency-chart');
    if(!chartContainer) return;
    chartContainer.innerHTML = '';
    const maxFreq = Math.max(...Object.values(data), 1);
    for (let i = 1; i <= 45; i++) {
        const freq = data[i] || 0;
        const height = (freq / maxFreq) * 85;
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        const bar = document.createElement('div');
        bar.className = `bar ${getBallColorClass(i)}`;
        bar.style.height = `${height}%`;
        const valSpan = document.createElement('span');
        valSpan.className = 'bar-value';
        valSpan.innerText = freq;
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = i;
        barWrapper.appendChild(valSpan);
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    }
}

function restoreMyNumbers() {
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        const section = document.getElementById('my-numbers-section');
        const list = document.getElementById('my-numbers-list');
        if (section && list) {
            section.style.display = 'flex';
            list.innerHTML = '';
            numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = `ball mini ${getBallColorClass(num)}`;
                ball.innerText = num;
                list.appendChild(ball);
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