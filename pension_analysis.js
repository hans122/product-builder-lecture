/**
 * Pension Analysis Engine v2.5 (High Performance & Premium UI)
 * No template literals, no let/const, no arrow functions
 */

document.addEventListener('DOMContentLoaded', function() {
    var containers = ['pos-freq-container', 'sequence-dist-chart', 'repeat-dist-chart', 'occurrence-dist-chart', 'unique-dist-chart', 'carry-pos-chart', 'carry-num-chart', 'neighbor-dist-chart', 'odd-dist-chart', 'low-dist-chart', 'prime-dist-chart', 'group-dist-chart', 'sum-dist-chart'];
    
    for (var i = 0; i < containers.length; i++) {
        var el = document.getElementById(containers[i]);
        if (el) el.innerHTML = '<div style="padding: 20px; text-align: center; font-size: 0.8rem; color: #94a3b8;">분석 데이터를 읽는 중...</div>';
    }

    try {
        LottoDataManager.getPensionRecords(function(records) {
            if (!records || records.length === 0) {
                for (var j = 0; j < containers.length; j++) {
                    var elErr = document.getElementById(containers[j]);
                    if (elErr) elErr.innerHTML = '<div style="padding: 20px; text-align: center; color: #f04452;">데이터 로드 실패</div>';
                }
                return;
            }

            var stats = {
                posFreq: [], groupFreq: [0,0,0,0,0,0],
                sumFreq: {}, seqFreq: {}, repeatFreq: {}, occurrenceFreq: {}, uniqueFreq: {},
                carryPosFreq: {}, carryNumFreq: {}, neighborFreq: {},
                oddFreq: {}, lowFreq: {}, primeFreq: {},
                digitGap: [], // [P6] 미출현 주기
                structStats: { symmetry: 0, arithmetic: 0, step: 0 } // [P8]
            };
            for (var k = 0; k < 6; k++) { 
                stats.posFreq[k] = [0,0,0,0,0,0,0,0,0,0];
                stats.digitGap[k] = [0,0,0,0,0,0,0,0,0,0];
            }

            // 역순(최신순) 데이터를 정순으로 돌려 Gap 계산 편의성 확보
            for (var idx = records.length - 1; idx >= 0; idx--) {
                var rec = records[idx];
                var nums = rec.nums;
                
                // 1. 기본 빈도 및 지표 계산
                for (var pIdx = 0; pIdx < 6; pIdx++) {
                    stats.posFreq[pIdx][nums[pIdx]]++;
                    // [P6] Gap 계산: 나온 숫자는 0으로 초기화, 나머지는 +1
                    for (var n = 0; n <= 9; n++) {
                        if (nums[pIdx] === n) stats.digitGap[pIdx][n] = 0;
                        else stats.digitGap[pIdx][n]++;
                    }
                }
                
                var g = parseInt(rec.group);
                if (g >= 1 && g <= 5) stats.groupFreq[g]++;

                var p = PensionUtils.analyzePatterns(nums);
                var b = PensionUtils.analyzeBalance(nums);
                var s = PensionUtils.analyzeStructure(nums);

                inc(stats.seqFreq, p.seq);
                inc(stats.repeatFreq, p.adjRep);
                inc(stats.occurrenceFreq, p.maxOccur);
                inc(stats.uniqueFreq, p.unique);
                inc(stats.sumFreq, b.sum);
                inc(stats.oddFreq, b.odd);
                inc(stats.lowFreq, b.low);
                inc(stats.primeFreq, b.prime);
                
                if (s.symmetry) stats.structStats.symmetry++;
                if (s.arithmetic) stats.structStats.arithmetic++;
                if (s.step) stats.structStats.step++;

                // [P5] 이월/이웃 분석 (직전 회차와 비교)
                if (idx < records.length - 1) {
                    var nextRecNums = records[idx+1].nums; // 최신순 배열이므로 다음 인덱스가 미래 데이터임
                    var dyn = PensionUtils.analyzeDynamics(nextRecNums, nums);
                    inc(stats.carryPosFreq, dyn.carry);
                    inc(stats.carryNumFreq, dyn.carryGlobal); // [FIX] 전역 숫자 이월 추가
                    inc(stats.neighborFreq, dyn.neighbor);
                }
            }

            // [P9/P10] 역방향 우선 렌더링을 위한 데이터 가공
            var reversePosFreq = [];
            var reverseDigitGap = [];
            for (var rIdx = 5; rIdx >= 0; rIdx--) {
                reversePosFreq.push(stats.posFreq[rIdx]);
                reverseDigitGap.push(stats.digitGap[rIdx]);
            }

            renderPositionFreq(reversePosFreq);
            renderReverseGapChart('digit-gap-container', reverseDigitGap);
            renderFlowTimeline(records.slice(0, 15)); // [P13] 최근 15회차 타임라인

            // [GP4] 로또 G1 스타일의 합계 차트 렌더링
            var sumValues = [];
            for (var rIdx = 0; rIdx < records.length; rIdx++) {
                sumValues.push(records[rIdx].nums.reduce(function(a,b){return a+b;}, 0));
            }
            var sumMean = sumValues.reduce(function(a,b){return a+b;}, 0) / sumValues.length;
            var sumSqDiff = sumValues.map(function(v){return Math.pow(v - sumMean, 2);});
            var sumStd = Math.sqrt(sumSqDiff.reduce(function(a,b){return a+b;}, 0) / sumValues.length);

            var pSumCfg = { id: 'p-sum', label: '6자리 합계', unit: '', group: 'GP4', distKey: 'p_sum', statKey: 'p_sum', drawKey: 'p_sum', maxLimit: 54 };
            var pSumStat = { mean: sumMean, std: sumStd };
            var pSumDistObj = {};
            for (var s = 0; s <= 54; s++) { pSumDistObj[s] = stats.sumFreq[s] || 0; }

            // 최근 5회차 데이터 가공 (모든 지표 리포트용)
            var recent5 = records.slice(0, 5).map(function(r, idx) {
                var copy = { no: r.drawNo, nums: r.nums };
                var p = PensionUtils.analyzePatterns(r.nums);
                var b = PensionUtils.analyzeBalance(r.nums);
                copy.p_sum = b.sum;
                copy.p_seq = p.seq;
                copy.p_repeat = p.adjRep;
                copy.p_occur = p.maxOccur;
                copy.p_unique = p.unique;
                copy.p_odd = b.odd;
                copy.p_low = b.low;
                copy.p_prime = b.prime;
                
                if (idx < records.length - 1) {
                    var prev = records[idx+1].nums;
                    var dyn = PensionUtils.analyzeDynamics(r.nums, prev);
                    copy.p_carry_pos = dyn.carry;
                    copy.p_carry_num = dyn.carryGlobal;
                    copy.p_neighbor = dyn.neighbor;
                } else {
                    copy.p_carry_pos = 0; copy.p_carry_num = 0; copy.p_neighbor = 0;
                }
                return copy;
            });

            LottoUI.createCurveChart('sum-dist-chart', pSumDistObj, '', pSumStat, pSumCfg);
            LottoUI.renderMiniTable('p-sum-mini-body', recent5, pSumCfg);

            // [FIX] 모든 지표에 대한 통계 수치(Mean, Std) 계산 및 곡선 차트/미니 표 렌더링
            var indicators = [
                { id: 'sequence-dist-chart', tableId: 'sequence-mini-body', data: stats.seqFreq, label: '연속 번호', unit: '개', limit: 6, drawKey: 'p_seq' },
                { id: 'repeat-dist-chart', tableId: 'repeat-mini-body', data: stats.repeatFreq, label: '직전 중복', unit: '개', limit: 6, drawKey: 'p_repeat' },
                { id: 'occurrence-dist-chart', tableId: 'occurrence-mini-body', data: stats.occurrenceFreq, label: '최대 중복', unit: '개', limit: 6, drawKey: 'p_occur' },
                { id: 'unique-dist-chart', tableId: 'unique-mini-body', data: stats.uniqueFreq, label: '번호 종류', unit: '종', limit: 6, drawKey: 'p_unique' },
                { id: 'carry-pos-chart', tableId: 'carry-pos-mini-body', data: stats.carryPosFreq, label: '자리 이월', unit: '개', limit: 6, drawKey: 'p_carry_pos' },
                { id: 'carry-num-chart', tableId: 'carry-num-mini-body', data: stats.carryNumFreq, label: '숫자 이월', unit: '개', limit: 6, drawKey: 'p_carry_num' },
                { id: 'neighbor-dist-chart', tableId: 'neighbor-mini-body', data: stats.neighborFreq, label: '이웃수', unit: '개', limit: 6, drawKey: 'p_neighbor' },
                { id: 'odd-dist-chart', tableId: 'odd-mini-body', data: stats.oddFreq, label: '홀수 개수', unit: '개', limit: 6, drawKey: 'p_odd' },
                { id: 'low-dist-chart', tableId: 'low-mini-body', data: stats.lowFreq, label: '저번호 개수', unit: '개', limit: 6, drawKey: 'p_low' },
                { id: 'prime-dist-chart', tableId: 'prime-mini-body', data: stats.primeFreq, label: '소수 개수', unit: '개', limit: 6, drawKey: 'p_prime' }
            ];

            var processChart = function(cfg) {
                var freq = cfg.data;
                var values = [];
                var sum = 0, count = 0;
                for (var k in freq) {
                    var v = parseInt(k);
                    var f = freq[k];
                    for (var i = 0; i < f; i++) { values.push(v); sum += v; count++; }
                }
                if (count === 0) return;
                var mean = sum / count;
                var sqDiffSum = 0;
                for (var j = 0; j < values.length; j++) { sqDiffSum += Math.pow(values[j] - mean, 2); }
                var std = Math.sqrt(sqDiffSum / count);

                LottoUI.createCurveChart(cfg.id, freq, cfg.unit, { mean: mean, std: std }, { label: cfg.label, maxLimit: cfg.limit });
                LottoUI.renderMiniTable(cfg.tableId, recent5, { drawKey: cfg.drawKey });
            };

            for (var cIdx = 0; cIdx < indicators.length; cIdx++) {
                processChart(indicators[cIdx]);
            }

            renderGroupDist(stats.groupFreq);
        });

    } catch (err) {
        var box = document.getElementById('pos-freq-container');
        if (box) box.innerHTML = '<div style="padding: 20px; text-align: center; color: #f04452;">WebView 호환 모드로 전환 실패</div>';
    }
});

function inc(obj, key) { obj[key] = (obj[key] || 0) + 1; }

// [P9] 역방향 자리수별 출현 빈도 카드 렌더러
function renderPositionFreq(posFreq) {
    var container = document.getElementById('pos-freq-container');
    if (!container) return;
    container.innerHTML = '';
    
    var labels = ['일의 자리', '십의 자리', '백의 자리', '천의 자리', '만의 자리', '십만의 자리'];
    var icons = ['➊', '➋', '➌', '➍', '➎', '➏'];

    for (var i = 0; i < posFreq.length; i++) {
        var freq = posFreq[i];
        var maxFreq = 0;
        for (var n = 0; n <= 9; n++) { if (freq[n] > maxFreq) maxFreq = freq[n]; }

        var card = document.createElement('div');
        card.className = 'analysis-card';
        card.style.margin = '0';
        card.style.background = '#ffffff';
        card.style.borderRadius = '12px';
        card.style.border = '1px solid #edf2f7';
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';

        var html = '<div class="card-header" style="padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid #edf2f7; display: flex; align-items: center; justify-content: space-between;">' +
                   '<div style="display: flex; align-items: center; gap: 8px;">' +
                   '<span style="font-size: 1.1rem; color: #3182f6; font-weight: 800;">' + icons[i] + '</span>' +
                   '<h3 style="margin:0; font-size: 0.9rem; font-weight: 800; color: #334155;">' + labels[i] + '</h3>' +
                   '</div>' +
                   '<span style="font-size: 0.65rem; color: #94a3b8; font-weight: 600;">0-9 빈도</span>' +
                   '</div>';

        html += '<div style="padding: 15px; display: flex; flex-direction: column; gap: 6px;">';
        for (var num = 0; num <= 9; num++) {
            var f = freq[num];
            var ratio = maxFreq > 0 ? (f / maxFreq) * 100 : 0;
            var isHot = f === maxFreq && f > 0;
            
            html += '<div style="display: flex; align-items: center; gap: 10px;">' +
                    '<span style="width: 12px; font-size: 0.75rem; font-weight: 800; color: ' + (isHot ? '#3182f6' : '#64748b') + ';">' + num + '</span>' +
                    '<div style="flex: 1; height: 10px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">' +
                    '<div style="width: ' + ratio + '%; height: 100%; background: ' + (isHot ? '#3182f6' : '#cbd5e1') + '; border-radius: 4px;"></div>' +
                    '</div>' +
                    '<span style="width: 18px; text-align: right; font-size: 0.65rem; font-weight: 700; color: #94a3b8;">' + f + '</span>' +
                    '</div>';
        }
        html += '</div>';
        card.innerHTML = html;
        container.appendChild(card);
    }
}

function renderReverseGapChart(containerId, gapData) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '<div class="gap-chart-grid" style="display:grid; grid-template-columns: repeat(11, 1fr); gap: 2px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
    html += '<div style="background:#f1f5f9; font-size:0.6rem; font-weight:900; color:#475569; display:flex; align-items:center; justify-content:center;">단위</div>';
    for (var h = 0; h <= 9; h++) html += '<div style="text-align:center; font-size:0.6rem; font-weight:bold; background:#f1f5f9; padding:8px 0; color:#475569;">' + h + '</div>';
    var labels = ['일', '십', '백', '천', '만', '십만'];
    for (var i = 0; i < 6; i++) {
        var isPrimary = i === 0;
        html += '<div style="font-size:0.65rem; font-weight:bold; color:' + (isPrimary?'#3182f6':'#64748b') + '; display:flex; align-items:center; justify-content:center; background:' + (isPrimary?'#f0f7ff':'#f8fafc') + '; border-right: 1px solid #e2e8f0;">' + labels[i] + '</div>';
        for (var n = 0; n <= 9; n++) {
            var gap = gapData[i][n];
            var color = gap > 20 ? '#f04452' : (gap > 10 ? '#ff9500' : (gap === 0 ? '#3182f6' : '#94a3b8'));
            var opacity = gap === 0 ? 1 : Math.min(0.8, 0.2 + (gap / 40));
            html += '<div style="text-align:center; padding:10px 0; font-size:0.75rem; font-weight:900; color:white; background:' + color + '; opacity:' + opacity + '">' + gap + '</div>';
        }
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderFlowTimeline(recent15) {
    var container = document.getElementById('flow-timeline-container');
    if (!container || !recent15 || recent15.length === 0) return;
    var html = '<table style="width:100%; border-collapse:collapse; min-width:600px; table-layout:fixed;">';
    html += '<thead><tr style="background:#f1f5f9; border-bottom:2px solid #e2e8f0;">' +
            '<th style="padding:10px; font-size:0.75rem; color:#475569; width:80px;">회차</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#475569; width:60px;">조</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#3182f6; font-weight:900;">일</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#64748b;">십</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#64748b;">백</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#64748b;">천</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#64748b;">만</th>' +
            '<th style="padding:10px; font-size:0.75rem; color:#64748b;">십만</th>' +
            '</tr></thead><tbody>';
    for (var i = 0; i < recent15.length; i++) {
        var draw = recent15[i];
        var prevDraw = recent15[i+1];
        html += '<tr style="border-bottom:1px solid #f1f5f9; ' + (i===0?'background:#f0f7ff;':'') + '">';
        html += '<td style="padding:12px; text-align:center; font-size:0.75rem; font-weight:700;">' + draw.drawNo + '회</td>';
        html += '<td style="padding:12px; text-align:center;"><div class="ball mini yellow" style="width:24px; height:24px; font-size:0.75rem;">' + draw.group + '</div></td>';
        for (var p = 5; p >= 0; p--) {
            var val = draw.nums[p];
            var ballStyle = 'width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800; border:1px solid #e2e8f0; background:white; margin:0 auto;';
            if (prevDraw && val === prevDraw.nums[p]) ballStyle = 'width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:900; border:2px solid #3182f6; background:#f0f7ff; color:#3182f6; margin:0 auto;';
            html += '<td style="padding:8px; text-align:center;"><div style="' + ballStyle + '">' + val + '</div></td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderGroupDist(groupFreq) {
    // 기존 조별 분포 유지 또는 확장 가능
}
