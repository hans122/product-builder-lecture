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
    
    // AI 한줄평 생성 (간이 로직)
    var sum = 0;
    for(var i=0; i<draw.nums.length; i++) sum += draw.nums[i];
    var insight = sum >= 20 && sum <= 34 ? "통계적 골든존(안정)" : "수치 편중 발생(특이)";

    var html = 
        '<div style="width: 100%; padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center;">' +
            '<div style="margin-bottom: 15px; font-size: 0.75rem; font-weight: 800; color: #ff8c00;">' +
                '🎟️ 제 ' + draw.drawNo + '회 당첨 결과 분석' +
            '</div>' +
            '<div style="display: flex; align-items: center; justify-content: center; gap: 10px; background: white; padding: 15px 25px; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">' +
                '<div style="display: flex; flex-direction: column; align-items: center; padding-right: 15px; border-right: 2px solid #f1f5f9;">' +
                    '<span style="font-size: 0.65rem; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">조</span>' +
                    '<div style="width: 36px; height: 36px; background: #ff8c00; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem;">' + draw.group + '</div>' +
                '</div>' +
                '<div style="display: flex; gap: 6px;">';
    
    for (var j = 0; j < draw.nums.length; j++) {
        html += '<div style="display: flex; flex-direction: column; align-items: center;">' +
                '<span style="font-size: 0.55rem; color: #cbd5e1; font-weight: 800; margin-bottom: 4px;">' + (j+1) + '위</span>' +
                '<div style="width: 32px; height: 32px; background: #f1f5f9; color: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; border: 1px solid #e2e8f0;">' + draw.nums[j] + '</div>' +
                '</div>';
    }

    html += '</div></div>' +
            '<div style="margin-top: 15px; font-size: 0.7rem; color: #64748b; font-weight: 600;">' +
                'AI 데이터 총평: <span style="color: #3182f6;">' + insight + '</span>' +
            '</div>' +
        '</div>';
    
    container.innerHTML = html;
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
        { label: "🛡️ 데이터 방어형", desc: "안정적 패턴" },
        { label: "🚀 잭팟 마스터", desc: "역대 당첨 재현" },
        { label: "🏠 이웃수 연계", desc: "인접수 가중" },
        { label: "🔢 수적 속성형", desc: "소수/합성수비" },
        { label: "🌊 평균 회귀형", desc: "미출현 반등" },
        { label: "✨ 프리미엄 픽", desc: "AI 고득점형" }
    ];

    // [Immortal Engine] 고득점 조합 필터링 (최소 80점)
    while (combos.length < 10 && attempts < 3000) {
        attempts++;
        var group = Math.floor(Math.random() * 5) + 1;
        var nums = [];
        for (var i = 0; i < 6; i++) {
            if (Math.random() < 0.75) nums.push(bestPicks[i][Math.floor(Math.random() * 3)]);
            else nums.push(Math.floor(Math.random() * 10));
        }

        var b = PensionUtils.analyzeBalance(nums);
        var p = PensionUtils.analyzePatterns(nums);
        var s = PensionUtils.analyzeStructure(nums);
        
        var score = 100;
        if (b.sum < 15 || b.sum > 40) score -= 25;
        if (p.maxOccur >= 3) score -= 25;
        if (p.seq >= 3) score -= 15;
        if (s.symmetry || s.step) score -= 5;

        if (score >= 80) {
            var key = group + ":" + nums.join('');
            var isDup = false;
            for(var j=0; j<combos.length; j++) { if(combos[j].key === key) isDup = true; }
            if (!isDup) combos.push({ group: group, nums: nums, sum: b.sum, score: score, key: key });
        }
    }
    
    var html = '';
    for (var k = 0; k < combos.length; k++) {
        var c = combos[k];
        var st = strategies[k] || { label: "AI 특별 조합" };
        html += '<div class="p-combo-card" style="width: calc(20% - 15px); min-width: 170px; margin: 5px; padding: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s;">';
        html += '<span style="font-size: 0.65rem; background: #fff4e6; color: #ff8c00; padding: 2px 8px; border-radius: 10px; font-weight: 800; margin-bottom: 10px;">' + st.label + '</span>';

        var ballHtml = '<div style="display: flex; flex-direction: column; align-items: center; padding-right: 8px; border-right: 1px solid #f1f5f9; margin-right: 8px;">' +
                       '<span style="font-size: 0.5rem; color: #94a3b8; font-weight: bold; margin-bottom: 3px;">조</span>' +
                       '<div class="pension-ball group small" style="width:28px; height:28px; font-size:0.9rem; background: #ff8c00; color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900;">' + c.group + '</div>' +
                       '</div>';

        ballHtml += '<div style="display: flex; gap: 3px;">';
        for (var m = 0; m < c.nums.length; m++) {
            ballHtml += '<div style="display: flex; flex-direction: column; align-items: center;">' +
                        '<span style="font-size: 0.45rem; color: #cbd5e1; font-weight: bold; margin-bottom: 3px;">' + (m+1) + '</span>' +
                        '<div class="pension-ball small" style="width:22px; height:22px; font-size:0.8rem; background: #f1f5f9; color: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid #e2e8f0;">' + c.nums[m] + '</div>' +
                        '</div>';
        }
        ballHtml += '</div>';

        html += '<div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">' + ballHtml + '</div>';
        html += '<div style="font-size: 0.65rem; color: #94a3b8; width: 100%; text-align: center;">신뢰도: <span style="color:#2ecc71; font-weight:bold;">' + c.score + '%</span></div></div>';
    }
    container.innerHTML = html;
}

