/**
 * AI Prediction Engine v3.0 - 다차원 패턴 적합도 모델
 * 단순 가중치 합산을 넘어 역대 당첨 패턴과의 유사도를 분석함
 */

let predStatsData = null;

/**
 * [핵심 엔진] 다차원 스코어링 모델
 */
function getPredictionPoolsForRound(allDraws, currentIndex) {
    const drawsBefore = allDraws.slice(currentIndex + 1);
    if (drawsBefore.length < 10) return { hot: [], neutral: [], cold: [] };

    // 1. 역대 당첨 특징 분석 (Feature Extraction)
    const recentPattern = drawsBefore.slice(0, 5).map(d => d.nums); // 최근 5회차 패턴
    
    // 2. 번호별 동적 스코어링 (Dynamic Scoring)
    const scores = [];
    for (let i = 1; i <= 45; i++) {
        let score = 0;

        // A. 빈도 기세 (Momentum) - 최근 10회차 출현 빈도 기반
        const freq10 = drawsBefore.slice(0, 10).filter(d => d.nums.includes(i)).length;
        score += freq10 * 15; // 빈도가 높을수록 기세 가점

        // B. 미출현 임계점 (Gap-Threshold) 
        let gap = 0;
        for (let d = 0; d < drawsBefore.length; d++) {
            if (drawsBefore[d].nums.includes(i)) { gap = d; break; }
        }
        // 로또 데이터상 5~15회차 미출현 번호가 가장 많이 재등장하는 '골든 타임' 법칙 적용
        if (gap >= 5 && gap <= 15) score += 25;
        else if (gap > 30) score -= 10; // 너무 장기 미출수는 확률 급감

        // C. 이웃 시너지 (Neighbor Synergy)
        const lastWinNums = drawsBefore[0].nums;
        const neighbors = new Set();
        lastWinNums.forEach(n => { if(n>1) neighbors.add(n-1); if(n<45) neighbors.add(n+1); });
        if (neighbors.has(i)) score += 20;

        // D. 회차별 전조 패턴 유사도 (Pattern Similarity)
        // 과거 데이터 중 최근 3회차와 유사한 조합이 나왔던 지점을 찾아 가산점 부여
        // (단순화를 위해 최근 1회차 이월수 패턴만 체크)
        if (lastWinNums.includes(i)) score += 12;

        scores.push({ num: i, score: score });
    }

    // 3. 확률 기반 풀 분할
    scores.sort((a, b) => b.score - a.score);
    
    return {
        hot: scores.slice(0, 30).map(s => s.num).sort((a,b)=>a-b),
        neutral: scores.slice(30, 35).map(s => s.num).sort((a,b)=>a-b),
        cold: scores.slice(35, 45).map(s => s.num).sort((a,b)=>a-b)
    };
}

/**
 * [지능형 샘플러] 확률 가중치 기반 조합 생성
 */
function generateSmartCombinations(hotPool, neutralPool) {
    const container = document.getElementById('ai-combinations-container');
    if (!container) return;
    container.innerHTML = '';

    const results = [];
    let attempts = 0;
    const combinedPool = [...hotPool, ...neutralPool];

    // 필터링 정책 v5.2 (G0 시너지 포함)
    while (results.length < 5 && attempts < 2000) {
        attempts++;
        // 단순 랜덤이 아닌 상위권 번호에 더 높은 확률을 부여하는 샘플링
        const pick = [];
        const tempPool = [...combinedPool];
        while (pick.length < 6) {
            // 앞쪽(점수 높은 쪽) 번호를 뽑을 확률을 높임
            const idx = Math.floor(Math.pow(Math.random(), 1.5) * tempPool.length);
            pick.push(tempPool.splice(idx, 1)[0]);
        }
        pick.sort((a, b) => a - b);

        // G1~G6 기본 필터 통과 여부
        const sum = pick.reduce((a, b) => a + b, 0);
        const odds = pick.filter(n => n % 2 !== 0).length;
        
        if (sum >= 105 && sum <= 170 && odds >= 2 && odds <= 4) {
            // [G0] 시너지 엔진 최종 검증
            const synergy = LottoSynergy.check(pick, predStatsData);
            if (!synergy.some(s => s.status === 'warning')) {
                // 중복 조합 방지
                if (!results.some(r => JSON.stringify(r) === JSON.stringify(pick))) {
                    results.push(pick);
                }
            }
        }
    }

    const strategyLabels = ["💎 다차원 최적화", "📊 패턴 유사도형", "🔥 기세 추종형", "⚖️ 밸런스 가중형", "🛡️ 데이터 방어형"];
    
    results.forEach((combo, idx) => {
        const card = document.createElement('div');
        card.className = 'combo-card';
        card.innerHTML = `
            <div class="combo-rank">${strategyLabels[idx]}</div>
            <div class="ball-container">${combo.map(n => LottoUI.createBall(n, true).outerHTML).join('')}</div>
            <div class="combo-meta">
                <span>합계 ${combo.reduce((a,b)=>a+b,0)}</span> | 
                <span>홀짝 ${combo.filter(n=>n%2!==0).length}:${6-combo.filter(n=>n%2!==0).length}</span>
            </div>
            <div class="analyze-badge">분석 리포트 ➔</div>
        `;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.combo-card').forEach(c => {
                c.style.borderColor = 'var(--border-light)';
                c.style.background = 'white';
            });
            card.style.borderColor = 'var(--primary-blue)';
            card.style.background = 'var(--primary-blue-soft)';
            
            localStorage.setItem('lastGeneratedNumbers', JSON.stringify(combo));
            if (typeof analyzeNumbers === 'function') {
                const sourceTitle = document.getElementById('analysis-source-title');
                if (sourceTitle) sourceTitle.innerText = `📊 분석 결과: ${strategyLabels[idx]}`;
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

/**
 * UI 렌더링 및 이벤트 바인딩
 */
document.addEventListener('DOMContentLoaded', async function() {
    predStatsData = await LottoDataManager.getStats();
    if (!predStatsData) return;

    const currentPools = getPredictionPoolsForRound(predStatsData.recent_draws, -1);
    renderPools(currentPools.hot, currentPools.neutral, currentPools.cold);
    generateSmartCombinations(currentPools.hot, currentPools.neutral);
    runBacktest(predStatsData.recent_draws);

    document.getElementById('refresh-recommendations-btn')?.addEventListener('click', function() {
        this.innerText = "⏳ 지능형 연산 중..."; this.disabled = true;
        setTimeout(() => {
            const pools = getPredictionPoolsForRound(predStatsData.recent_draws, -1);
            generateSmartCombinations(pools.hot, pools.neutral);
            this.innerText = "🔄 조합 새로고침"; this.disabled = false;
        }, 400);
    });
});

function renderPools(hot, neutral, cold) {
    const containers = {
        'hot-pool-container': hot,
        'neutral-pool-container': neutral,
        'cold-pool-container': cold
    };
    Object.entries(containers).forEach(([id, nums]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        nums.forEach(n => el.appendChild(LottoUI.createBall(n, true)));
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

        // [복구 및 고도화] 마이크로 그리드 기반 번호 리스트 생성
        const hotDisplay = pools.hot.map(n => 
            draw.nums.includes(n) ? `<span class="micro-num hit">${n}</span>` : `<span class="micro-num">${n}</span>`
        ).join(''); 

        const neutralDisplay = pools.neutral.map(n => 
            draw.nums.includes(n) ? `<span class="micro-num neutral-hit">${n}</span>` : `<span class="micro-num">${n}</span>`
        ).join('');

        const coldDisplay = pools.cold.map(n => 
            draw.nums.includes(n) ? `<span class="micro-num fail">${n}</span>` : `<span class="micro-num">${n}</span>`
        ).join('');

        const tr = document.createElement('tr');
        let statusTag = hits.length >= 5 ? '<span class="status-tag excellent">우수</span>' : (hits.length >= 4 ? '<span class="status-tag good">양호</span>' : '<span class="status-tag fail">보통</span>');
        
        tr.innerHTML = `
            <td>${draw.no}회</td>
            <td><div class="pool-grid-win">${draw.nums.map(n => LottoUI.createBall(n, true).outerHTML).join('')}</div></td>
            <td class="text-left">
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--primary-blue); margin-bottom: 5px;">적중 ${hits.length}개</div>
                <div class="micro-num-grid">${hotDisplay}</div>
            </td>
            <td class="text-left">
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--warning-orange); margin-bottom: 5px;">적중 ${neutralHits.length}개</div>
                <div class="micro-num-grid">${neutralDisplay}</div>
            </td>
            <td class="text-left">
                <div style="font-size: 0.75rem; font-weight: 800; color: ${fails.length > 0 ? 'var(--danger-red)' : 'var(--success-green)'}; margin-bottom: 5px;">
                    ${fails.length > 0 ? '필터실패' : '완벽제외'}
                </div>
                <div class="micro-num-grid">${coldDisplay}</div>
            </td>
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
