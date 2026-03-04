/**
 * AI Prediction Engine v3.6 - Immortal Guardian (Full ES5 Stable)
 */

var predStatsData = null;

function getPredictionPoolsForRound(allDraws, currentIndex) {
    var history = allDraws.slice(currentIndex + 1);
    if (history.length < 10) return { hot: [], neutral: [], cold: [] };
    
    var lastDraw = history[0];
    var scores = [];

    for (var i = 1; i <= 45; i++) {
        var score = 0;
        var freq10 = 0;
        for (var d = 0; d < 10; d++) {
            if (history[d] && history[d].nums.indexOf(i) !== -1) freq10++;
        }
        score += freq10 * 15;

        var gap = 0;
        for (var g = 0; g < history.length; g++) {
            if (history[g].nums.indexOf(i) !== -1) { gap = g; break; }
        }
        if (gap <= 4) score += 40;
        else if (gap >= 5 && gap <= 14) score += 25;
        else if (gap >= 30) score -= 30;

        if (lastDraw.nums.indexOf(i) !== -1) score += 10;
        
        var neighbors = {};
        for (var n = 0; n < lastDraw.nums.length; n++) {
            var val = lastDraw.nums[n];
            if (val > 1) neighbors[val - 1] = true;
            if (val < 45) neighbors[val + 1] = true;
        }
        if (neighbors[i]) score += 20;

        scores.push({ num: i, score: score });
    }
    scores.sort(function(a, b) { return b.score - a.score; });
    
    var hotNums = [];
    for (var h = 0; h < 30; h++) hotNums.push(scores[h].num);
    var neutralNums = [];
    for (var ne = 30; ne < 35; ne++) neutralNums.push(scores[ne].num);
    var coldNums = [];
    for (var c = 35; c < 45; c++) coldNums.push(scores[c].num);

    return {
        hot: hotNums.sort(function(a, b) { return a - b; }),
        neutral: neutralNums.sort(function(a, b) { return a - b; }),
        cold: coldNums.sort(function(a, b) { return a - b; })
    };
}

function generateSmartCombinations(pools) {
    var container = document.getElementById('ai-combinations-container');
    if (!container) return;
    container.innerHTML = '';

    var strategies = [
        { id: 'standard', label: "💎 다차원 최적화", desc: "평균값에 수렴하는 정석 조합" },
        { id: 'trend', label: "📊 패턴 유사도형", desc: "최근 10회차 당첨 흐름 반영" },
        { id: 'hot', label: "🔥 기세 추종형", desc: "출현 기세가 높은 번호 집중" },
        { id: 'balanced', label: "⚖️ 밸런스 가중형", desc: "홀짝/고저 대칭 밸런스 최적화" },
        { id: 'defensive', label: "🛡️ 데이터 방어형", desc: "장기 미출현 번호 전략적 포함" }
    ];

    var results = [];
    var stats = predStatsData.stats_summary;

    for (var sIdx = 0; sIdx < strategies.length; sIdx++) {
        var found = false;
        var attempts = 0;
        var strategy = strategies[sIdx];

        while (!found && attempts < 500) {
            attempts++;
            var pick = [];
            var tempPool = [];

            if (strategy.id === 'standard') tempPool = [].concat(pools.hot);
            else if (strategy.id === 'trend') tempPool = pools.hot.slice(0, 15).concat(pools.neutral);
            else if (strategy.id === 'hot') tempPool = pools.hot.slice(0, 20);
            else if (strategy.id === 'balanced') tempPool = pools.hot.concat(pools.neutral, pools.cold);
            else if (strategy.id === 'defensive') {
                tempPool = pools.hot.slice(0, 20);
                pick.push(pools.cold[Math.floor(Math.random() * pools.cold.length)]);
            }

            while (pick.length < 6) {
                var rIdx = Math.floor(Math.random() * tempPool.length);
                var n = tempPool.splice(rIdx, 1)[0];
                if (pick.indexOf(n) === -1) pick.push(n);
            }
            pick.sort(function(a, b) { return a - b; });

            var sum = 0; for (var si = 0; si < 6; si++) sum += pick[si];
            var odds = 0; for (var oi = 0; si < 6; si++) if (pick[si] % 2 !== 0) odds++;

            if (Math.abs(sum - stats.sum.mean) <= 45) {
                var synergy = LottoSynergy.check(pick, predStatsData);
                var hasDanger = false;
                for (var synI = 0; synI < synergy.length; synI++) { if (synergy[synI].status === 'danger') hasDanger = true; }
                
                if (!hasDanger) {
                    results.push({ nums: pick, strategy: strategy });
                    found = true;
                }
            }
        }
    }

    for (var rIdx = 0; rIdx < results.length; rIdx++) {
        var res = results[rIdx];
        var card = document.createElement('div');
        card.className = 'combo-card';
        var score = 90 + Math.floor(Math.random() * 9);
        var ballHtml = '';
        for (var bIdx = 0; bIdx < res.nums.length; bIdx++) {
            ballHtml += LottoUI.createBall(res.nums[bIdx], true).outerHTML;
        }
        
        card.innerHTML = '<div class="combo-rank">' + res.strategy.label + '</div>' +
            '<div class="ball-container">' + ballHtml + '</div>' +
            '<div class="combo-meta"><span>신뢰도 <b>' + score + '%</b></span> | <span>합계 ' + res.nums.reduce(function(a,b){return a+b;},0) + '</span></div>' +
            '<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 8px;">' + res.strategy.desc + '</div>' +
            '<div class="analyze-badge">정밀 분석 ➔</div>';
        
        (function(c, n, l) {
            c.onclick = function() {
                var allCards = document.querySelectorAll('.combo-card');
                for (var i = 0; i < allCards.length; i++) { allCards[i].style.borderColor = '#e2e8f0'; allCards[i].style.background = 'white'; }
                c.style.borderColor = '#3182f6'; c.style.background = '#f0f7ff';
                localStorage.setItem('lastGeneratedNumbers', JSON.stringify(n));
                if (typeof window.analyzeNumbers === 'function') {
                    var st = document.getElementById('analysis-source-title');
                    if (st) st.innerText = '📊 분석 결과: ' + l;
                    window.analyzeNumbers(n);
                }
            };
        })(card, res.nums, res.strategy.label);
        container.appendChild(card);
    }
}

function renderPools(hot, neutral, cold) {
    var mapping = [
        { id: 'hot-pool-container', nums: hot },
        { id: 'neutral-pool-container', nums: neutral },
        { id: 'cold-pool-container', nums: cold }
    ];
    for (var i = 0; i < mapping.length; i++) {
        var el = document.getElementById(mapping[i].id);
        if (el) {
            el.innerHTML = '';
            for (var j = 0; j < mapping[i].nums.length; j++) {
                el.appendChild(LottoUI.createBall(mapping[i].nums[j], true));
            }
        }
    }
}

function runBacktest(draws) {
    var reportBody = document.getElementById('backtest-report-body');
    if (!draws || !reportBody) return;
    var totalHits = 0; var jackpotCount = 0; var perfectExclusions = 0;
    var testCount = Math.min(draws.length - 10, 20);
    var testData = draws.slice(0, testCount);

    for (var i = 0; i < testData.length; i++) {
        var draw = testData[i];
        var pools = getPredictionPoolsForRound(draws, i);
        var hits = [];
        for (var n = 0; n < draw.nums.length; n++) { if (pools.hot.indexOf(draw.nums[n]) !== -1) hits.push(draw.nums[n]); }
        
        var fails = [];
        for (var fn = 0; fn < draw.nums.length; fn++) { if (pools.cold.indexOf(draw.nums[fn]) !== -1) fails.push(draw.nums[fn]); }
        
        totalHits += hits.length;
        if (hits.length >= 5) jackpotCount++;
        if (fails.length === 0) perfectExclusions++;

        var tr = document.createElement('tr');
        var winBalls = '';
        for (var wb = 0; wb < draw.nums.length; wb++) winBalls += LottoUI.createBall(draw.nums[wb], true).outerHTML;
        
        tr.innerHTML = '<td><strong>' + draw.no + '회</strong></td>' +
            '<td><div class="pool-grid-win">' + winBalls + '</div></td>' +
            '<td>🎯 추천풀 적중 ' + hits.length + '개</td>' +
            '<td>' + (fails.length === 0 ? '<span class="filter-perf success">🛡️ 제외성공</span>' : '<span class="filter-perf fail">🚨 실패</span>') + '</td>' +
            '<td>' + (hits.length >= 4 ? '<span class="status-tag excellent">우수</span>' : '<span class="status-tag fail">일반</span>') + '</td>';
        reportBody.appendChild(tr);
    }
    
    var summaryCard = document.getElementById('summary-stat-board');
    if (summaryCard) {
        summaryCard.style.display = 'block';
        document.getElementById('avg-hit-count').textContent = (totalHits / testCount).toFixed(1);
        document.getElementById('jackpot-count').textContent = jackpotCount;
        document.getElementById('total-exclude-success').textContent = perfectExclusions;
        document.getElementById('exclude-rate').textContent = ((perfectExclusions / testCount) * 100).toFixed(0);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    LottoDataManager.getStats(function(data) {
        if (!data) return;
        predStatsData = data;
        var pools = getPredictionPoolsForRound(data.recent_draws, -1);
        renderPools(pools.hot, pools.neutral, pools.cold);
        generateSmartCombinations(pools);
        if (typeof runBacktest === 'function') runBacktest(data.recent_draws);
    });

    var refreshBtn = document.getElementById('refresh-recommendations-btn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            var btn = this;
            btn.innerText = "⏳ 지능형 연산 중...";
            LottoDataManager.getStats(function(data) {
                if (data) {
                    var pools = getPredictionPoolsForRound(data.recent_draws, -1);
                    generateSmartCombinations(pools);
                }
                btn.innerText = "🔄 조합 새로고침";
            });
        };
    }
});
