/**
 * Pension AI Analysis & Prediction Engine v2.0 (ES5 Safe Mode)
 */

document.addEventListener('DOMContentLoaded', function() {
    LottoDataManager.getPensionRecords(function(records) {
        if (!records || records.length === 0) return;

        var lastDraw = records[0];
        var total = records.length;

        // 통계 분석 (AI 가중치 산출용)
        var stats = {
            posFreq: [],
            lastAppear: []
        };
        for (var k = 0; k < 6; k++) {
            stats.posFreq[k] = [0,0,0,0,0,0,0,0,0,0];
            stats.lastAppear[k] = [0,0,0,0,0,0,0,0,0,0];
        }

        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            for (var pos = 0; pos < 6; pos++) {
                var n = rec.nums[pos];
                stats.posFreq[pos][n]++;
                if (stats.lastAppear[pos][n] === 0 && n !== lastDraw.nums[pos]) {
                    stats.lastAppear[pos][n] = i;
                }
            }
        }

        // UI 렌더링
        renderLastDraw(lastDraw);
        renderIndicators(lastDraw);
        
        var bestPicks = calculateBestPicks(stats);
        renderBestPicks(bestPicks);
        renderRecommendations(bestPicks);

        var refreshBtn = document.getElementById('refresh-pension-btn');
        if (refreshBtn) {
            refreshBtn.onclick = function() { renderRecommendations(bestPicks); };
        }
    });
});

function renderLastDraw(draw) {
    var container = document.getElementById('pension-last-draw');
    if (!container) return;
    var groupBall = '<div class="pension-ball group">' + draw.group + '</div>';
    var numBalls = '';
    for (var i = 0; i < draw.nums.length; i++) {
        numBalls += '<div class="pension-ball">' + draw.nums[i] + '</div>';
    }
    container.innerHTML = '<span style="font-size: 0.9rem; font-weight: 800; margin-right: 15px; color: #64748b;">' + draw.drawNo + '회:</span> ' + groupBall + ' ' + numBalls;
}

function renderIndicators(draw) {
    var grid = document.getElementById('pension-indicator-grid');
    if (!grid) return;
    var p = PensionUtils.analyzePatterns(draw.nums);
    var b = PensionUtils.analyzeBalance(draw.nums);

    var items = [
        { label: '합계 점수', val: b.sum, status: (b.sum >= 20 && b.sum <= 34) ? 'safe' : 'warning' },
        { label: '홀짝 비율', val: (6 - b.odd) + ':' + b.odd, status: (b.odd >= 2 && b.odd <= 4) ? 'safe' : 'warning' },
        { label: '연속 번호', val: p.seq > 0 ? p.seq + '개' : '없음', status: p.seq >= 2 ? 'safe' : 'warning' },
        { label: '번호 종류', val: p.unique + '종', status: p.unique >= 4 ? 'safe' : 'warning' }
    ];

    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        html += '<div class="best-box" style="padding: 10px; display: flex; justify-content: space-between; align-items: center;">';
        html += '<span style="font-size: 0.75rem; color: #64748b;">' + item.label + '</span>';
        html += '<span style="font-size: 0.85rem; font-weight: 900; color: ' + (item.status === 'safe' ? '#2ecc71' : '#ff8c00') + '">' + item.val + '</span>';
        html += '</div>';
    }
    grid.innerHTML = html;
}

function calculateBestPicks(stats) {
    var bestPicks = [];
    for (var pos = 0; pos < 6; pos++) {
        var scores = [];
        for (var num = 0; num < 10; num++) {
            var score = (stats.posFreq[pos][num] * 0.7) + (stats.lastAppear[pos][num] * 0.3);
            scores.push({ num: num, score: score });
        }
        scores.sort(function(a, b) { return b.score - a.score; });
        var top3 = [];
        for (var j = 0; j < 3; j++) { top3.push(scores[j].num); }
        bestPicks.push(top3);
    }
    return bestPicks;
}

function renderBestPicks(picks) {
    var container = document.getElementById('pension-best-digits');
    if (!container) return;
    var labels = ['십만', '만', '천', '백', '십', '일'];
    var html = '';
    for (var i = 0; i < picks.length; i++) {
        var nums = picks[i];
        html += '<div class="best-box"><span class="best-label">' + labels[i] + '의 자리</span><div class="best-nums">';
        for (var j = 0; j < nums.length; j++) {
            html += '<div class="best-num ' + (j === 0 ? 'rank-1' : '') + '">' + nums[j] + '</div>';
        }
        html += '</div></div>';
    }
    container.innerHTML = html;
}

function renderRecommendations(bestPicks) {
    var container = document.getElementById('pension-recommendations');
    if (!container) return;
    var combos = [];
    var attempts = 0;
    
    var strategies = [
        { label: "💎 다차원 최적화", desc: "밸런스 최상" },
        { label: "🔥 기세 추종형", desc: "다출현 가중" },
        { label: "🔄 이월 시너지", desc: "직전 연계형" },
        { label: "⚖️ 수치 균형형", desc: "합계 중앙값" },
        { label: "🛡️ 데이터 방어형", desc: "안정적 패턴" }
    ];

    while (combos.length < 5 && attempts < 500) {
        attempts++;
        var group = Math.floor(Math.random() * 5) + 1;
        var nums = [];
        var sum = 0;
        for (var i = 0; i < 6; i++) {
            var pick = bestPicks[i][Math.floor(Math.random() * 3)];
            nums.push(pick);
            sum += pick;
        }
        // 중복 조합 방지
        var key = group + ":" + nums.join('');
        var isDuplicate = false;
        for(var j=0; j<combos.length; j++) { if(combos[j].group + ":" + combos[j].nums.join('') === key) isDuplicate = true; }

        if (!isDuplicate && sum >= 20 && sum <= 34) {
            combos.push({ group: group, nums: nums, sum: sum });
        }
    }

    var html = '';
    for (var k = 0; k < combos.length; k++) {
        var c = combos[k];
        html += '<div class="p-combo-card" style="flex: 1; min-width: 170px; margin: 5px; padding: 15px;">';
        html += '<span class="p-combo-rank" style="font-size: 0.65rem;">' + strategies[k].label + '</span>';
        html += '<div class="pension-ball-row" style="margin: 10px 0;"><div class="pension-ball group small">' + c.group + '</div>';
        for (var m = 0; m < c.nums.length; m++) {
            html += '<div class="pension-ball small">' + c.nums[m] + '</div>';
        }
        html += '</div><div style="font-size: 0.7rem; color: #94a3b8;">합계: ' + c.sum + ' | ' + strategies[k].desc + '</div></div>';
    }
    container.innerHTML = html;
}
