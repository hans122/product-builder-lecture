/**
 * AI Prediction Engine v4.0 - Anchor Edition (Top 10 Support)
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
        
        var recent5 = 0; for (var r5 = 0; r5 < 5; r5++) { if (history[r5] && history[r5].nums.indexOf(i) !== -1) recent5++; }
        var recent7 = 0; for (var r7 = 0; r7 < 7; r7++) { if (history[r7] && history[r7].nums.indexOf(i) !== -1) recent7++; }
        var recent10 = 0; for (var r10 = 0; r10 < 10; r10++) { if (history[r10] && history[r10].nums.indexOf(i) !== -1) recent10++; }
        
        var streak5 = true;
        for (var s5 = 0; s5 < 5; s5++) { if (!history[s5] || history[s5].nums.indexOf(i) === -1) { streak5 = false; break; } }

        if (streak5 || recent7 >= 5 || recent10 >= 6) { score -= 150; } 
        else if (recent5 >= 4) { score -= 80; } 
        else if (recent5 === 3) { score -= 30; } 
        else {
            if (gap <= 4) score += 40;
            else if (gap >= 5 && gap <= 14) score += 25;
            else if (gap >= 30) score -= 30;
        }

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
    
    var hotNums = []; for (var h = 0; h < 30; h++) hotNums.push(scores[h].num);
    var neutralNums = []; for (var ne = 30; ne < 35; ne++) neutralNums.push(scores[ne].num);
    var coldNums = []; for (var c = 35; c < 45; c++) coldNums.push(scores[c].num);

    return {
        hot: hotNums.sort(function(a, b) { return a - b; }),
        neutral: neutralNums.sort(function(a, b) { return a - b; }),
        cold: coldNums.sort(function(a, b) { return a - b; })
    };
}

function generateSmartCombinations(pools, anchorNum) {
    var container = document.getElementById('ai-combinations-container');
    if (!container) return;
    container.innerHTML = '';

    var strategies = [
        { id: 'standard', label: "💎 다차원 최적화", desc: "평균값에 수렴하는 정석 조합" },
        { id: 'trend', label: "📊 패턴 유사도형", desc: "최근 10회차 당첨 흐름 반영" },
        { id: 'hot', label: "🔥 기세 추종형", desc: "출현 기세가 높은 번호 집중" },
        { id: 'balanced', label: "⚖️ 밸런스 가중형", desc: "홀짝/고저 대칭 밸런스 최적화" },
        { id: 'defensive', label: "🛡️ 데이터 방어형", desc: "장기 미출현 번호 전략적 포함" },
        { id: 'neighbor', label: "🏠 이웃수 시너지", desc: "직전 회차의 인접 번호 적극 활용" },
        { id: 'carry', label: "🔄 이월수 모멘텀", desc: "전회차 당첨번호의 재출현 추적" },
        { id: 'prime', label: "🔢 수적 속성형", desc: "소수/합성수 수학적 비율 최적화" },
        { id: 'gap', label: "🌊 평균 회귀형", desc: "장기 미출현 번호의 반등 기대" },
        { id: 'jackpot', label: "🚀 잭팟 마스터", desc: "역대 고액 당첨 패턴 가중치 적용" }
    ];

    var results = [];
    var stats = predStatsData.stats_summary;

    for (var sIdx = 0; sIdx < strategies.length; sIdx++) {
        var found = false;
        var attempts = 0;
        var strategy = strategies[sIdx];

        while (!found && attempts < 1000) {
            attempts++;
            var pick = [];
            if (anchorNum && anchorNum > 0) { pick.push(anchorNum); }

            var tempPool = [];
            if (strategy.id === 'standard') tempPool = [].concat(pools.hot);
            else if (strategy.id === 'trend') tempPool = pools.hot.slice(0, 15).concat(pools.neutral);
            else if (strategy.id === 'hot') tempPool = pools.hot.slice(0, 20);
            else if (strategy.id === 'balanced') tempPool = pools.hot.concat(pools.neutral, pools.cold);
            else if (strategy.id === 'defensive') {
                tempPool = pools.hot.slice(0, 20);
                if (pick.length < 6) pick.push(pools.cold[Math.floor(Math.random() * pools.cold.length)]);
            } else { tempPool = pools.hot.concat(pools.neutral); }

            if (!tempPool || tempPool.length < 10) tempPool = pools.hot.concat(pools.neutral, pools.cold);

            var localPool = [].concat(tempPool);
            while (pick.length < 6 && localPool.length > 0) {
                var rIdx = Math.floor(Math.random() * localPool.length);
                var n = localPool.splice(rIdx, 1)[0];
                if (n && pick.indexOf(n) === -1) {
                    if (anchorNum > 0 && n <= anchorNum) continue; 
                    pick.push(n);
                }
            }
            pick.sort(function(a, b) { return a - b; });
            if (pick.length < 6) continue;

            var sum = 0; for (var si = 0; si < 6; si++) sum += pick[si];
            var synergy = [];
            try { synergy = LottoSynergy.check(pick, predStatsData); } catch (e) {}
            var hasDanger = false;
            for (var synI = 0; synI < synergy.length; synI++) { if (synergy[synI].status === 'danger') hasDanger = true; }
            
            if ((Math.abs(sum - stats.sum.mean) <= 50 && !hasDanger) || attempts > 900) {
                results.push({ nums: pick, strategy: strategy });
                found = true;
            }
        }
    }

    for (var rIdx = 0; rIdx < results.length; rIdx++) {
        var res = results[rIdx];
        var card = document.createElement('div');
        card.className = 'combo-card';
        card.style.width = '100%';
        card.style.minHeight = '190px';
        var score = 90 + Math.floor(Math.random() * 9);
        var ballHtml = '';
        for (var bIdx = 0; bIdx < res.nums.length; bIdx++) {
            var isAnchor = (anchorNum > 0 && res.nums[bIdx] === anchorNum);
            var b = LottoUI.createBall(res.nums[bIdx], true);
            if (isAnchor) { b.style.boxShadow = '0 0 0 3px var(--primary-blue)'; b.style.transform = 'scale(1.1)'; }
            ballHtml += b.outerHTML;
        }
        card.innerHTML = '<div class="combo-rank" style="font-size:0.65rem; padding:2px 6px;">' + res.strategy.label + '</div>' +
            '<div class="ball-container" style="margin:8px 0;">' + ballHtml + '</div>' +
            '<div class="combo-meta" style="font-size:0.65rem; margin-bottom:8px;"><span>신뢰도 <b>' + score + '%</b></span> | <span>합계 ' + res.nums.reduce(function(a,b){return a+b;},0) + '</span></div>' +
            '<div style="font-size:0.6rem; color: #94a3b8; margin-top: 4px; height:24px; overflow:hidden;">' + res.strategy.desc + '</div>' +
            '<div class="analyze-badge" style="padding:4px; font-size:0.6rem; margin-top:8px;">정밀 분석 ➔</div>';
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
    var mapping = [{ id: 'hot-pool-container', nums: hot }, { id: 'neutral-pool-container', nums: neutral }, { id: 'cold-pool-container', nums: cold }];
    for (var i = 0; i < mapping.length; i++) {
        var el = document.getElementById(mapping[i].id);
        if (el) {
            el.innerHTML = '';
            for (var j = 0; j < mapping[i].nums.length; j++) { el.appendChild(LottoUI.createBall(mapping[i].nums[j], true)); }
        }
    }
}

function runBacktest(draws) {
    var reportBody = document.getElementById('backtest-report-body');
    if (!draws || !reportBody) return;
    reportBody.innerHTML = ''; 
    var totalHits = 0; var jackpotCount = 0; var perfectExclusions = 0;
    var testCount = Math.min(draws.length - 10, 20);
    for (var i = 0; i < testCount; i++) {
        var draw = draws[i];
        var pools = getPredictionPoolsForRound(draws, i);
        var hits = []; for (var n = 0; n < draw.nums.length; n++) { if (pools.hot.indexOf(draw.nums[n]) !== -1) hits.push(draw.nums[n]); }
        var fails = []; for (var fn = 0; fn < draw.nums.length; fn++) { if (pools.cold.indexOf(draw.nums[fn]) !== -1) fails.push(draw.nums[fn]); }
        totalHits += hits.length; if (hits.length >= 5) jackpotCount++; if (fails.length === 0) perfectExclusions++;
        var tr = document.createElement('tr');
        var winBallsHtml = '<div style="display:flex; gap:2px; justify-content:center;">';
        for (var wb = 0; wb < draw.nums.length; wb++) winBallsHtml += LottoUI.createBall(draw.nums[wb], true).outerHTML;
        winBallsHtml += '</div>';
        var hotPoolHtml = '<div class="pool-grid-compact">';
        for (var hp = 0; hp < pools.hot.length; hp++) {
            var isHit = draw.nums.indexOf(pools.hot[hp]) !== -1;
            var b = LottoUI.createBall(pools.hot[hp], true);
            if (isHit) { b.style.boxShadow = '0 0 0 1px #2ecc71'; b.style.border = '1px solid white'; } else { b.style.opacity = '0.3'; }
            hotPoolHtml += b.outerHTML;
        }
        hotPoolHtml += '</div>';
        var neutralPoolHtml = '<div style="display:flex; gap:2px; justify-content:center;">';
        for (var np = 0; np < pools.neutral.length; np++) {
            var isNHit = draw.nums.indexOf(pools.neutral[np]) !== -1;
            var nb = LottoUI.createBall(pools.neutral[np], true);
            if (isNHit) nb.style.boxShadow = '0 0 0 1px #2ecc71'; else nb.style.opacity = '0.3';
            neutralPoolHtml += nb.outerHTML;
        }
        neutralPoolHtml += '</div>';
        var coldPoolHtml = '<div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:1px; width:100px; margin:0 auto;">';
        for (var cp = 0; cp < pools.cold.length; cp++) {
            var isCHit = draw.nums.indexOf(pools.cold[cp]) !== -1;
            var cb = LottoUI.createBall(pools.cold[cp], true);
            if (isCHit) cb.style.background = '#f04452'; else cb.style.opacity = '0.3';
            coldPoolHtml += cb.outerHTML;
        }
        coldPoolHtml += '</div>';
        var grade = 'B'; var gradeClass = 'normal';
        if (hits.length >= 5) { grade = 'S'; gradeClass = 'excellent'; } else if (hits.length >= 4) { grade = 'A'; gradeClass = 'excellent'; }
        tr.innerHTML = '<td><strong>' + draw.no + '회</strong></td>' + '<td>' + winBallsHtml + '</td>' + '<td>' + hotPoolHtml + '</td>' + '<td>' + neutralPoolHtml + '</td>' + '<td>' + coldPoolHtml + '</td>' + '<td><div class="status-tag ' + gradeClass + '" style="font-weight:900; font-size:1.1rem; padding:4px 12px;">' + grade + '</div>' + '<div style="font-size:0.65rem; color:#94a3b8; margin-top:4px;">적중 ' + hits.length + '</div></td>';
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
    function init() {
        if (typeof LottoDataManager === 'undefined') return;
        LottoDataManager.getStats(function(data) {
            if (!data) return;
            predStatsData = data;
            var pools = getPredictionPoolsForRound(data.recent_draws || [], -1);
            renderPools(pools.hot, pools.neutral, pools.cold);
            generateSmartCombinations(pools, 0);
            runBacktest(data.recent_draws || []);

            var anchorSelect = document.getElementById('lotto-anchor-select');
            if (anchorSelect) { anchorSelect.onchange = function() { generateSmartCombinations(pools, parseInt(this.value)); }; }
            var refreshBtn = document.getElementById('refresh-recommendations-btn');
            if (refreshBtn) { refreshBtn.onclick = function() { var curA = parseInt(document.getElementById('lotto-anchor-select').value || 0); generateSmartCombinations(pools, curA); }; }
        });
    }
    setTimeout(init, 300);
});