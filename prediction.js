/**
 * AI Prediction Logic - LottoCore v4.3 기반 리팩토링
 */

let predStatsData = null;

// [1] 모든 수치에 롤링 윈도우가 적용된 정밀 추출 함수 (v2.2)
function getPredictionPoolsForRound(allDraws, currentIndex) {
    const drawsBefore = allDraws.slice(currentIndex + 1);
    const last3 = drawsBefore.slice(0, 3).map(d => d.nums);
    
    const midTermWindow = drawsBefore.slice(0, 60);
    const midFreq = {};
    midTermWindow.forEach(d => d.nums.forEach(n => { midFreq[n] = (midFreq[n] || 0) + 1; }));

    const shortTermWindow = drawsBefore.slice(0, 15);
    const shortFreq = {};
    shortTermWindow.forEach(d => d.nums.forEach(n => { shortFreq[n] = (shortFreq[n] || 0) + 1; }));

    const sectorHits = [0, 0, 0, 0, 0];
    drawsBefore.slice(0, 5).forEach(d => d.nums.forEach(n => { sectorHits[Math.floor((n-1)/9)]++; }));

    const scores = [];
    for (let i = 1; i <= 45; i++) {
        let score = 0;
        const sectorIdx = Math.floor((i-1)/9);
        score += ((shortFreq[i] || 0) / 5) * 35;
        if (last3[0] && last3[0].includes(i)) score += 15;
        if (last3[0]) {
            const neighbors = new Set();
            last3[0].forEach(n => { if(n>1) neighbors.add(n-1); if(n<45) neighbors.add(n+1); });
            if (neighbors.has(i)) score += 10;
        }
        score += ((midFreq[i] || 0) / 15) * 20;
        let gap = 0;
        for (let d = 0; d < drawsBefore.length; d++) { if (drawsBefore[d].nums.includes(i)) { gap = d; break; } }
        if (gap >= 5 && gap <= 15) score += 15;
        else if (gap > 20) score -= 5;
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

let lastHotPool = [];
let lastNeutralPool = [];

document.addEventListener('DOMContentLoaded', async function() {
    predStatsData = await LottoDataManager.getStats();
    if (!predStatsData) return;

    const currentPools = getPredictionPoolsForRound(predStatsData.recent_draws, -1);
    lastHotPool = currentPools.hot;
    lastNeutralPool = currentPools.neutral;
    renderPools(currentPools.hot, currentPools.neutral, currentPools.cold);
    generateSmartCombinations(currentPools.hot, currentPools.neutral);
    runBacktest(predStatsData.recent_draws);

    document.getElementById('refresh-recommendations-btn')?.addEventListener('click', function() {
        if (lastHotPool.length > 0) {
            this.innerText = "⏳ 생성 중..."; this.disabled = true;
            setTimeout(() => {
                generateSmartCombinations(lastHotPool, lastNeutralPool);
                this.innerText = "🔄 조합 새로고침"; this.disabled = false;
            }, 300);
        }
    });
});

function renderPools(hot, neutral, cold) {
    const hotContainer = document.getElementById('hot-pool-container');
    const neutralContainer = document.getElementById('neutral-pool-container');
    const coldContainer = document.getElementById('cold-pool-container');
    if(hotContainer) {
        hotContainer.innerHTML = '';
        hot.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball mini ${LottoUtils.getBallColorClass(num)}`;
            ball.innerText = num;
            hotContainer.appendChild(ball);
        });
    }
    if(neutralContainer) {
        neutralContainer.innerHTML = '';
        neutral.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball mini yellow`;
            ball.innerText = num;
            neutralContainer.appendChild(ball);
        });
    }
    if(coldContainer) {
        coldContainer.innerHTML = '';
        cold.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball mini gray`;
            ball.innerText = num;
            coldContainer.appendChild(ball);
        });
    }
}

function generateSmartCombinations(hotPool, neutralPool) {
    const container = document.getElementById('ai-combinations-container');
    if (!container) return;
    container.innerHTML = '';
    const results = []; let attempts = 0;
    while (results.length < 5 && attempts < 1000) {
        attempts++;
        const combined = [...hotPool, ...neutralPool];
        const shuffled = [...combined].sort(() => 0.5 - Math.random());
        const pick = shuffled.slice(0, 6).sort((a, b) => a - b);
        const sum = pick.reduce((a, b) => a + b, 0);
        const odds = pick.filter(n => n % 2 !== 0).length;
        if (sum >= 100 && sum <= 175 && odds >= 2 && odds <= 4) { 
            // [추가] G7 시너지 필터: 심각한 지표 충돌이 없는 조합만 선별
            const synergy = LottoSynergy.check(pick, predStatsData);
            if (!synergy.some(s => s.status === 'warning')) {
                results.push(pick); 
            }
        }
    }
    const strategyLabels = ["💎 최우선 추천", "⚖️ 균형 최적화", "🔥 기세형 조합", "🌊 흐름 추종", "🛡️ 안정형 필터"];
    results.forEach((combo, idx) => {
        const card = document.createElement('div');
        card.className = 'combo-card clickable';
        card.innerHTML = `
            <div class="combo-rank">${strategyLabels[idx] || "#" + (idx + 1)}</div>
            <div class="ball-container">${combo.map(n => `<div class="ball ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('')}</div>
            <div class="combo-meta">합계: ${combo.reduce((a,b)=>a+b,0)} | 홀짝: ${combo.filter(n=>n%2!==0).length}:${6-combo.filter(n=>n%2!==0).length}</div>
            <div class="analyze-badge" style="background: #ebf8ff; padding: 5px; border-radius: 4px; margin-top: 10px;">정밀 분석 리포트 보기 ➔</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.combo-card').forEach(c => c.style.borderColor = '#edf2f7');
            card.style.borderColor = 'var(--secondary-blue)'; card.style.background = '#f0f7ff';
            localStorage.setItem('lastGeneratedNumbers', JSON.stringify(combo));
            if (typeof analyzeNumbers === 'function') {
                const sourceTitle = document.getElementById('analysis-source-title');
                if (sourceTitle) sourceTitle.innerText = `📊 분석 결과: ${strategyLabels[idx] || '추천 조합'}`;
                analyzeNumbers(combo);
                document.getElementById('analysis-source-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        card.querySelector('.analyze-badge').addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.setItem('lastGeneratedNumbers', JSON.stringify(combo));
            localStorage.setItem('pending_analysis_numbers', JSON.stringify(combo));
            window.location.href = 'combination.html';
        });
        container.appendChild(card);
    });
}

function runBacktest(draws) {
    const reportBody = document.getElementById('backtest-report-body');
    if (!draws || !reportBody) return;
    let totalHits = 0; let jackpotCount = 0; let perfectExclusions = 0;
    const testCount = Math.min(draws.length - 10, 20);
    const testData = draws.slice(0, testCount);
    testData.forEach((draw, index) => {
        const pools = getPredictionPoolsForRound(draws, index);
        const hits = draw.nums.filter(n => pools.hot.includes(n));
        const neutralHits = draw.nums.filter(n => pools.neutral.includes(n));
        const fails = draw.nums.filter(n => pools.cold.includes(n));
        totalHits += hits.length;
        if (hits.length >= 5) jackpotCount++;
        if (fails.length === 0) perfectExclusions++;

        const hotDisplay = pools.hot.map(n => draw.nums.includes(n) ? `<strong class="hit-num">${n}</strong>` : `<span class="pool-num">${n}</span>`).join(''); 
        const neutralDisplay = pools.neutral.map(n => draw.nums.includes(n) ? `<strong class="neutral-hit-num">${n}</strong>` : `<span class="pool-num">${n}</span>`).join('');
        const coldDisplay = pools.cold.map(n => draw.nums.includes(n) ? `<strong class="fail-num">${n}</strong>` : `<span class="pool-num">${n}</span>`).join('');

        const tr = document.createElement('tr');
        let statusTag = hits.length >= 5 ? '<span class="status-tag excellent">우수</span>' : (hits.length >= 4 ? '<span class="status-tag good">양호</span>' : '<span class="status-tag fail">보통</span>');
        tr.innerHTML = `
            <td>${draw.no}회</td>
            <td><div class="pool-grid-win">${draw.nums.map(n => `<div class="ball mini ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('')}</div></td>
            <td class="text-left"><div class="hit-summary-top">적중: <strong>${hits.length}개</strong></div><div class="pool-grid-mini expected">${hotDisplay}</div></td>
            <td class="text-left"><div class="hit-summary-top">적중: <strong>${neutralHits.length}개</strong></div><div class="pool-grid-mini neutral-grid">${neutralDisplay}</div></td>
            <td class="text-left"><div class="fail-summary-top ${fails.length > 0 ? 'text-danger' : 'text-success'}">${fails.length > 0 ? `실패: ${fails.join(',')}` : '제외성공'}</div><div class="pool-grid-mini excluded">${coldDisplay}</div></td>
            <td>${statusTag}</td>
        `;
        reportBody.appendChild(tr);
    });
    const summaryCard = document.getElementById('summary-stat-board');
    if (summaryCard) {
        summaryCard.style.display = 'block';
        document.getElementById('avg-hit-count').textContent = (totalHits / testCount).toFixed(1);
        document.getElementById('jackpot-count').textContent = jackpotCount;
        document.getElementById('total-exclude-success').textContent = perfectExclusions;
        document.getElementById('exclude-rate').textContent = ((perfectExclusions / testCount) * 100).toFixed(0);
    }
}
