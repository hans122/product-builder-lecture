let statsData = null;

// [1] 모든 수치에 롤링 윈도우가 적용된 정밀 추출 함수 (v2.2)
function getPredictionPoolsForRound(allDraws, currentIndex) {
    // 검증 시점 기준 과거 데이터만 추출
    const drawsBefore = allDraws.slice(currentIndex + 1);
    const last3 = drawsBefore.slice(0, 3).map(d => d.nums);
    
    // A. 중기 안정성 (과거 60회차 빈도 - 데이터가 부족하면 가능한 만큼)
    const midTermWindow = drawsBefore.slice(0, 60);
    const midFreq = {};
    midTermWindow.forEach(d => d.nums.forEach(n => {
        midFreq[n] = (midFreq[n] || 0) + 1;
    }));

    // B. 단기 기세 (과거 15회차 빈도)
    const shortTermWindow = drawsBefore.slice(0, 15);
    const shortFreq = {};
    shortTermWindow.forEach(d => d.nums.forEach(n => {
        shortFreq[n] = (shortFreq[n] || 0) + 1;
    }));

    // C. 구간별 출현 데이터 (5개 구간: 1-9, 10-18, 19-27, 28-36, 37-45)
    const sectorHits = [0, 0, 0, 0, 0];
    drawsBefore.slice(0, 5).forEach(d => d.nums.forEach(n => {
        sectorHits[Math.floor((n-1)/9)]++;
    }));

    const scores = [];
    for (let i = 1; i <= 45; i++) {
        let score = 0;
        const sectorIdx = Math.floor((i-1)/9);

        // 1. 단기 기세 (35점)
        score += ((shortFreq[i] || 0) / 5) * 35;

        // 2. 사용자 로직: 이월/이웃 (25점)
        if (last3[0] && last3[0].includes(i)) score += 15;
        if (last3[0]) {
            const neighbors = new Set();
            last3[0].forEach(n => { if(n>1) neighbors.add(n-1); if(n<45) neighbors.add(n+1); });
            if (neighbors.has(i)) score += 10;
        }

        // 3. 중기 안정성 (20점)
        score += ((midFreq[i] || 0) / 15) * 20;

        // 4. 출현 주기 및 미출현 보정 (15점)
        let gap = 0;
        for (let d = 0; d < drawsBefore.length; d++) {
            if (drawsBefore[d].nums.includes(i)) {
                gap = d;
                break;
            }
        }
        if (gap >= 5 && gap <= 15) score += 15; // 적정 골든 타임
        else if (gap > 20) score -= 5; // 너무 안 나오면 제외 후보

        // 5. 구간 밸런스 보정 (5점)
        // 최근 5회 동안 해당 구간이 적게 나왔다면 가점
        if (sectorHits[sectorIdx] < 5) score += 5;

        scores.push({ num: i, score: score });
    }

    scores.sort((a, b) => b.score - a.score);

    return {
        hot: scores.slice(0, 30).map(s => s.num).sort((a,b)=>a-b),
        neutral: scores.slice(30, 35).map(s => s.num).sort((a,b)=>a-b),
        cold: scores.slice(35, 45).map(s => s.num).sort((a,b)=>a-b)
    };
    }

    document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            const currentPools = getPredictionPoolsForRound(data.recent_draws, -1);
            renderPools(currentPools.hot, currentPools.neutral, currentPools.cold);
            generateSmartCombinations(currentPools.hot, currentPools.neutral);

            runBacktest(data.recent_draws);
        })
        .catch(err => console.error('Data load failed:', err));
    });

    function renderPools(hot, neutral, cold) {
    const hotContainer = document.getElementById('hot-pool-container');
    const neutralContainer = document.getElementById('neutral-pool-container');
    const coldContainer = document.getElementById('cold-pool-container');

    if(hotContainer) hotContainer.innerHTML = '';
    if(neutralContainer) neutralContainer.innerHTML = '';
    if(coldContainer) coldContainer.innerHTML = '';

    hot.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `ball mini ${getBallColorClass(num)}`;
        ball.innerText = num;
        hotContainer.appendChild(ball);
    });
    neutral.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `ball mini yellow`; // 보류수는 노란색
        ball.innerText = num;
        neutralContainer.appendChild(ball);
    });
    cold.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `ball mini gray`;
        ball.innerText = num;
        coldContainer.appendChild(ball);
    });
    }

    // 예상수 풀 내에서 필터링을 거친 스마트 조합 생성
    function generateSmartCombinations(hotPool, neutralPool) {
    const container = document.getElementById('ai-combinations-container');
    if (!container) return;
    container.innerHTML = '';

    const results = [];
    let attempts = 0;

    // 30개 예상수 + 5개 보류수 중 랜덤하게 섞어서 5개 조합 추출 (필터링 적용)
    while (results.length < 5 && attempts < 1000) {
        attempts++;
        const combined = [...hotPool, ...neutralPool];
        const shuffled = combined.sort(() => 0.5 - Math.random());
        const pick = shuffled.slice(0, 6).sort((a, b) => a - b);

        // 필터링 적용 (총합, 홀짝 등 기본 균형 필터)
        const sum = pick.reduce((a, b) => a + b, 0);
        const odds = pick.filter(n => n % 2 !== 0).length;

        // 통계적으로 유리한 범위 (합계 100~175, 홀짝 2:4~4:2)
        if (sum >= 100 && sum <= 175 && odds >= 2 && odds <= 4) {
            results.push(pick);
        }
    }

    results.forEach((combo, idx) => {
        const card = document.createElement('div');
        card.className = 'combo-card';
        card.innerHTML = `
            <div class="combo-rank">#${idx + 1}</div>
            <div class="ball-container">
                ${combo.map(n => `<div class="ball ${getBallColorClass(n)}">${n}</div>`).join('')}
            </div>
            <div class="combo-meta">합계: ${combo.reduce((a,b)=>a+b,0)} | 홀짝: ${combo.filter(n=>n%2!==0).length}:${6-combo.filter(n=>n%2!==0).length}</div>
        `;
        container.appendChild(card);
    });
    }

function runBacktest(draws) {
    const reportBody = document.getElementById('backtest-report-body');
    if (!draws || !reportBody) return;

    let totalHits = 0;
    let maxHits = 0;
    let jackpotCount = 0; // 5~6개 적중 횟수
    let perfectExclusions = 0; // 10개 모두 제외 성공한 횟수

    const testCount = Math.min(draws.length - 10, 20);
    const testData = draws.slice(0, testCount);

    testData.forEach((draw, index) => {
        const pools = getPredictionPoolsForRound(draws, index);
        const hotPool = pools.hot;
        const neutralPool = pools.neutral;
        const coldPool = pools.cold;

        const hits = draw.nums.filter(n => hotPool.includes(n));
        const neutralHits = draw.nums.filter(n => neutralPool.includes(n));
        const fails = draw.nums.filter(n => coldPool.includes(n));
        
        totalHits += hits.length;
        if (hits.length > maxHits) maxHits = hits.length;
        if (hits.length >= 5) jackpotCount++; // 잭팟 카운트
        if (fails.length === 0) perfectExclusions++; // 완벽 제외 카운트

        const tr = document.createElement('tr');
        
        let statusTag = '';
        if (hits.length >= 6) statusTag = '<span class="status-tag excellent">잭팟(6)</span>';
        else if (hits.length >= 5) statusTag = '<span class="status-tag excellent">우수(5)</span>';
        else if (hits.length >= 4) statusTag = '<span class="status-tag good">양호(4)</span>';
        else statusTag = '<span class="status-tag fail">보통</span>';

        const hotDisplay = hotPool.map(n => 
            draw.nums.includes(n) ? `<strong class="hit-num">${n}</strong>` : `<span class="pool-num">${n}</span>`
        ).join(''); // 콤마 제거

        const neutralDisplay = neutralPool.map(n => 
            draw.nums.includes(n) ? `<strong class="neutral-hit-num">${n}</strong>` : `<span class="pool-num">${n}</span>`
        ).join('');

        const coldDisplay = coldPool.map(n => 
            draw.nums.includes(n) ? `<strong class="fail-num">${n}</strong>` : `<span class="pool-num">${n}</span>`
        ).join('');

        tr.innerHTML = `
            <td>${draw.no}회</td>
            <td><div class="pool-grid-win">${draw.nums.map(n => `<div class="ball mini ${getBallColorClass(n)}">${n}</div>`).join('')}</div></td>
            <td class="text-left">
                <div class="hit-summary-top">적중: <strong>${hits.length}개</strong></div>
                <div class="pool-grid-mini expected">${hotDisplay}</div>
            </td>
            <td class="text-left">
                <div class="hit-summary-top">적중: <strong>${neutralHits.length}개</strong></div>
                <div class="pool-grid-mini neutral-grid">${neutralDisplay}</div>
            </td>
            <td class="text-left">
                <div class="fail-summary-top ${fails.length > 0 ? 'text-danger' : 'text-success'}">
                    ${fails.length > 0 ? `실패: <strong>${fails.join(',')}</strong>` : '제외성공'}
                </div>
                <div class="pool-grid-mini excluded">${coldDisplay}</div>
            </td>
            <td>${statusTag}</td>
        `;
        reportBody.appendChild(tr);
    });

    // 요약 바 업데이트 및 노출 (유일한 ID 참조 강화)
    const summaryCard = document.getElementById('summary-stat-board');
    if (summaryCard) {
        summaryCard.style.display = 'block';
        
        const avgHitVal = (testCount > 0) ? (totalHits / testCount).toFixed(1) : "0.0";
        const excludeRateVal = (testCount > 0) ? ((perfectExclusions / testCount) * 100).toFixed(0) : "0";
        
        const elAvg = document.getElementById('avg-hit-count');
        const elJackpot = document.getElementById('jackpot-count');
        const elPerfect = document.getElementById('total-exclude-success');
        const elExcludeRate = document.getElementById('exclude-rate');

        if (elAvg) elAvg.textContent = avgHitVal;
        if (elJackpot) elJackpot.textContent = jackpotCount;
        if (elPerfect) elPerfect.textContent = perfectExclusions;
        if (elExcludeRate) elExcludeRate.textContent = excludeRateVal;

        console.log("Summary updated:", { avgHitVal, jackpotCount, perfectExclusions, excludeRateVal });
    }
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}
