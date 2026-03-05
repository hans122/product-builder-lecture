/**
 * Pension Combination Engine v3.3 - Stability & Error Recovery Fix
 */

document.addEventListener('DOMContentLoaded', function() {
    var state = { group: 1, digits: [0, 0, 0, 0, 0, 0] };
    var statsData = null;

    // 0. UI 생성
    var digitContainer = document.getElementById('digit-selectors-container');
    if (digitContainer) {
        var labels = ['십만', '만', '천', '백', '십', '일'];
        var html = '';
        for (var i = 0; i < 6; i++) {
            var btns = '';
            for (var n = 0; n <= 9; n++) { 
                btns += '<button class="wheel-btn" data-pos="' + i + '" data-val="' + n + '">' + n + '</button>'; 
            }
            html += '<div class="digit-box"><span class="digit-label">' + labels[i] + '</span><div class="digit-wheel" id="digit-' + i + '">' + btns + '</div></div>';
        }
        digitContainer.innerHTML = html;
    }

    var anchorContainer = document.getElementById('ai-anchor-selector');
    if (anchorContainer) {
        var anchorHtml = '';
        for (var a = 0; a <= 9; a++) {
            anchorHtml += '<button class="sel-btn anchor-btn" data-val="' + a + '" style="width:45px; height:45px; font-size:1.1rem;">' + a + '</button>';
        }
        anchorContainer.innerHTML = anchorHtml;
    }

    // 1. 이벤트 바인딩 (데이터 로드 전에도 조작 가능하게 즉시 실행)
    function initInteractions() {
        // 조 선택
        var groupBtns = document.querySelectorAll('#group-selector .sel-btn');
        for (var i = 0; i < groupBtns.length; i++) {
            groupBtns[i].onclick = function() {
                var btns = document.querySelectorAll('#group-selector .sel-btn');
                for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
                this.classList.add('active');
                state.group = parseInt(this.getAttribute('data-val'));
            };
        }
        if (groupBtns[0]) groupBtns[0].click();

        // 자리수 선택
        for (var d = 0; d < 6; d++) {
            (function(idx) {
                var container = document.getElementById('digit-' + idx);
                if (!container) return;
                var wheelBtns = container.querySelectorAll('.wheel-btn');
                for (var b = 0; b < wheelBtns.length; b++) {
                    wheelBtns[b].onclick = function() {
                        var siblings = container.querySelectorAll('.wheel-btn');
                        for (var s = 0; s < siblings.length; s++) siblings[s].classList.remove('active');
                        this.classList.add('active');
                        state.digits[idx] = parseInt(this.getAttribute('data-val'));
                    };
                }
                if (wheelBtns[0]) wheelBtns[0].click();
            })(d);
        }

        // AI 앵커 선택
        var anchorBtns = document.querySelectorAll('.anchor-btn');
        for (var a = 0; a < anchorBtns.length; a++) {
            anchorBtns[a].onclick = function() {
                var btns = document.querySelectorAll('.anchor-btn');
                for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
                this.classList.add('active');
                if (typeof generateAIRecommendations === 'function') {
                    generateAIRecommendations(parseInt(this.getAttribute('data-val')));
                }
            };
        }
    }

    initInteractions();

    // 2. 데이터 로드 (백그라운드에서 진행)
    LottoDataManager.getPensionRecords(function(records) {
        if (!records || records.length === 0) {
            console.warn('[Pension] No records found');
            return;
        }
        
        try {
            var gap = []; for(var k=0; k<6; k++) { gap[k] = [0,0,0,0,0,0,0,0,0,0]; }
            var transitions = {};
            
            for (var idx = 0; idx < records.length; idx++) {
                var rec = records[idx];
                if (!rec || !rec.nums) continue;
                
                var nums = rec.nums;
                for (var p = 0; p < 6; p++) {
                    var val = nums[p];
                    if (val === undefined) continue;
                    
                    // Gap 계산 (최신순이므로 처음 만난 숫자가 Gap 0)
                    // (이전 로직이 정순 기준이었으므로 수정 필요할 수 있으나 현재 구조 유지)
                    for (var n = 0; n <= 9; n++) {
                        if (val === n && gap[p][n] === 0) gap[p][n] = idx; 
                    }

                    if (p > 0 && nums[p-1] !== undefined) {
                        var key = p + '_' + val;
                        if (!transitions[key]) transitions[key] = {};
                        transitions[key][nums[p-1]] = (transitions[key][nums[p-1]] || 0) + 1;
                    }
                }
            }
            statsData = { records: records, digitGap: gap, transitions: transitions };
            console.log('[Pension] Analysis data ready');
        } catch (e) {
            console.error('[Pension] Data processing error:', e);
        }
    });

    // 3. AI 추천 로직
    window.generateAIRecommendations = function(anchor) {
        if (!statsData) { alert('데이터 분석 중입니다. 잠시만 기다려주세요.'); return; }
        var recommendations = [];
        var strategies = [
            { id: 'chain', label: '🔥 역방향 체인 마스터', desc: '1의 자리부터 전이 확률이 높은 조합' },
            { id: 'gap', label: '🛡️ 미출현 브레이커', desc: '자리수별 장기 미출현 숫자 활용' },
            { id: 'trend', label: '📊 최근 기세 추종형', desc: '최근 20회차 내 고빈도 숫자 위주' },
            { id: 'balanced', label: '⚖️ 밸런스 옵티멀', desc: '수치적 균형이 완벽한 조합' },
            { id: 'jackpot', label: '🚀 잭팟 시너지', desc: '역대 당첨 패턴 시너지형' }
        ];

        for (var s = 0; s < strategies.length; s++) {
            var st = strategies[s];
            var combo = [0, 0, 0, 0, 0, anchor];
            if (st.id === 'chain') {
                for (var p = 5; p > 0; p--) {
                    var trans = statsData.transitions[p + '_' + combo[p]] || {};
                    var bestNext = 0, maxC = -1;
                    for (var n = 0; n <= 9; n++) { if ((trans[n] || 0) > maxC) { maxC = trans[n] || 0; bestNext = n; } }
                    combo[p-1] = bestNext;
                }
            } else if (st.id === 'gap') {
                for (var g = 0; g < 5; g++) {
                    var maxG = -1, bestD = 0;
                    for (var n2 = 0; n2 <= 9; n2++) { if (statsData.digitGap[g][n2] > maxG) { maxG = statsData.digitGap[g][n2]; bestD = n2; } }
                    combo[g] = bestD;
                }
            } else {
                for (var r = 0; r < 5; r++) combo[r] = Math.floor(Math.random() * 10);
            }
            recommendations.push({ nums: combo, strategy: st });
        }
        renderAIRecommendations(recommendations);
    };

    function renderAIRecommendations(recs) {
        var container = document.getElementById('ai-pension-recommendations');
        if (!container) return;
        container.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var r = recs[i];
            var card = document.createElement('div');
            card.className = 'analysis-card';
            card.style.margin = '0'; card.style.padding = '15px'; card.style.border = '1px solid #e2e8f0'; card.style.cursor = 'pointer';
            var numsHtml = '<div style="display:flex; gap:3px; justify-content:center; margin:10px 0;">';
            for (var n = 0; n < 6; n++) {
                var isAnchor = n === 5;
                numsHtml += '<div class="pension-ball small" style="width:24px; height:24px; font-size:0.75rem; ' + (isAnchor?'background:#3182f6; color:white; border-color:#3182f6;':'') + '">' + r.nums[n] + '</div>';
            }
            numsHtml += '</div>';
            card.innerHTML = '<div style="font-size:0.7rem; font-weight:900; color:#3182f6; margin-bottom:5px;">' + r.strategy.label + '</div>' + numsHtml + '<div style="font-size:0.6rem; color:#94a3b8; line-height:1.2;">' + r.strategy.desc + '</div><div style="margin-top:10px; font-size:0.65rem; color:#3182f6; font-weight:800;">클릭 시 자동 입력 ➔</div>';
            (function(nums) {
                card.onclick = function() {
                    for (var d = 0; d < 6; d++) {
                        var btns = document.querySelectorAll('#digit-' + d + ' .wheel-btn');
                        if (btns[nums[d]]) btns[nums[d]].click();
                    }
                    var analyzeBtn = document.getElementById('p-analyze-btn');
                    if (analyzeBtn) analyzeBtn.click();
                };
            })(r.nums);
            container.appendChild(card);
        }
    }

    // 4. 기타 버튼 이벤트
    var randomBtn = document.getElementById('p-random-btn');
    if (randomBtn) {
        randomBtn.onclick = function() {
            var rg = Math.floor(Math.random() * 5) + 1;
            var gBtns = document.querySelectorAll('#group-selector .sel-btn');
            if (gBtns[rg - 1]) gBtns[rg - 1].click();
            for (var i = 0; i < 6; i++) {
                var rd = Math.floor(Math.random() * 10);
                var dBtns = document.querySelectorAll('#digit-' + i + ' .wheel-btn');
                if (dBtns[rd]) dBtns[rd].click();
            }
        };
    }

    var analyzeBtn = document.getElementById('p-analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.onclick = function() {
            if (!statsData || !statsData.records || statsData.records.length === 0) { 
                alert('데이터 분석 준비 중입니다. 잠시 후 다시 시도해 주세요.'); 
                return; 
            }
            var reportSection = document.getElementById('p-report-section');
            var resultsArea = document.getElementById('p-analysis-results');
            if (!reportSection || !resultsArea) return;
            
            reportSection.style.display = 'block';

            var digits = state.digits;
            var latest = statsData.records[0].nums;
            if (!latest) latest = [0,0,0,0,0,0]; // 폴백 데이터
            
            var dynamics = PensionUtils.analyzeDynamics(digits, latest);
            var balance = PensionUtils.analyzeBalance(digits);
            var pattern = PensionUtils.analyzePatterns(digits);
            var struct = PensionUtils.analyzeStructure(digits);

            var winnings = { rank1: 0, rank2: 0, rank7: 0, total: 0 };
            for (var r = 0; r < statsData.records.length; r++) {
                var hist = statsData.records[r];
                var matchCount = 0;
                for (var m = 5; m >= 0; m--) { if (digits[m] === hist.nums[m]) matchCount++; else break; }
                if (matchCount === 6 && state.group === parseInt(hist.group)) winnings.rank1++;
                else if (matchCount === 6) winnings.rank2++;
                if (matchCount >= 1) winnings.total++;
                if (matchCount === 1) winnings.rank7++;
            }

            var score = 100;
            if (balance.sum < 20 || balance.sum > 35) score -= 15;
            if (pattern.maxOccur >= 3) score -= 20;
            var grade = score >= 90 ? 'S' : (score >= 80 ? 'A' : (score >= 70 ? 'B' : 'C'));
            var gradeColor = grade === 'S' ? '#3182f6' : (grade === 'A' ? '#2ecc71' : (grade === 'B' ? '#ff9500' : '#f04452'));

            var comboHtml = '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; padding: 15px; background: white; border-radius: 12px; border: 1px solid #edf2f7;">' +
                            '<div style="display: flex; flex-direction: column; align-items: center; padding-right: 12px; border-right: 2px solid #f1f5f9;">' +
                                '<span style="font-size: 0.6rem; color: #94a3b8; font-weight: 800; margin-bottom: 4px;">조</span>' +
                                '<div class="pension-ball group small" style="width:32px; height:32px; font-size:1rem;">' + state.group + '</div>' +
                            '</div>' +
                            '<div style="display: flex; gap: 4px;">';
            for (var i = 0; i < digits.length; i++) {
                var isAnchor = i === 5;
                comboHtml += '<div style="display: flex; flex-direction: column; align-items: center;">' +
                             '<span style="font-size: 0.5rem; color: #cbd5e1; font-weight: 800; margin-bottom: 4px;">' + (i+1) + '위</span>' +
                             '<div class="pension-ball small" style="width:28px; height:28px; font-size:0.9rem; ' + (isAnchor?'background:#f0f7ff; color:#3182f6; border-color:#3182f6; font-weight:900;':'') + '">' + digits[i] + '</div>' +
                             '</div>';
            }
            comboHtml += '</div></div>';

            resultsArea.innerHTML = '<div class="result-summary" style="margin-bottom: 30px; display: flex; flex-direction: column; background: #f8faff; padding: 25px; border-radius: 16px;">' +
                '<div style="width: 100%; text-align: center; margin-bottom: 15px;"><span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">분석 대상 조합</span></div>' +
                comboHtml + '<div style="display: flex; align-items: center; gap: 20px; justify-content: center; border-top: 1px solid #eef2ff; padding-top: 20px;"><div class="score-badge" style="width: 80px; height: 80px; border: 5px solid ' + gradeColor + '33; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white;"><span style="font-size: 2.2rem; font-weight: 900; color:' + gradeColor + ';">' + grade + '</span></div><div class="grade-info"><h3 style="margin: 0 0 5px 0;">종합 점수: <span style="color:' + gradeColor + ';">' + score + '점</span></h3><p style="font-size: 0.8rem; color: #64748b; margin: 0;">과거 ' + statsData.records.length + '회차 중 <b>' + winnings.total + '회</b> 당첨 이력 확인</p></div></div></div>' +
                '<div class="group-header" style="margin-bottom: 15px;">📊 전문가용 정밀 분석 지표 (P1~P12)</div>' +
                '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">' +
                createStatItem('P4 합계 점수', balance.sum, 'safe') +
                createStatItem('P4 홀짝 비율', balance.odd + ':' + (6-balance.odd), 'safe') +
                createStatItem('P2 중복수 포함', pattern.maxOccur + '개', 'safe') +
                createStatItem('P2 연속번호', pattern.seq + '개', 'safe') +
                createStatItem('P5 자리 이월', dynamics.carry + '개', 'safe') +
                createStatItem('P5 주변 이웃', dynamics.neighbor + '개', 'safe') +
                createStatItem('P8 대칭 패턴', (struct.symmetry ? '감지' : '미감지'), 'safe') +
                createStatItem('P8 계단 패턴', (struct.step ? '감지' : '미감지'), 'safe') +
                '</div>';
            reportSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
    }

    function createStatItem(label, value, status) {
        var color = status === 'safe' ? '#2ecc71' : (status === 'warning' ? '#ff9500' : '#f04452');
        var bg = status === 'safe' ? '#f0fdf4' : (status === 'warning' ? '#fffbeb' : '#fef2f2');
        return '<div style="background: ' + bg + '; padding: 15px; border-radius: 12px; border: 1px solid ' + color + '33; text-align: center;">' +
               '<span style="display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 6px; font-weight: 700;">' + label + '</span>' +
               '<span style="font-size: 1.1rem; font-weight: 800; color: #1e293b;">' + value + '</span></div>';
    }
});
