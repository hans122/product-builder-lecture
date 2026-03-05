/**
 * Pension Analysis Engine v2.4 (ES3/ES5 Hyper Stability)
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
            // LottoUI.renderGapChart는 내부적으로 0~5 인덱스를 사용하므로 뒤집힌 데이터를 전달
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
            
            // LottoUI.createCurveChart 호환을 위해 객체 형태 분포 데이터 생성
            var pSumDistObj = {};
            for (var s = 0; s <= 54; s++) { pSumDistObj[s] = stats.sumFreq[s] || 0; }
            
            // 최근 5회차 데이터에 p_sum 속성 주입 (renderMiniTable 호환용)
            var recent5 = records.slice(0, 5).map(function(r) {
                var copy = { no: r.drawNo, nums: r.nums };
                copy.p_sum = r.nums.reduce(function(a,b){return a+b;}, 0);
                return copy;
            });

            LottoUI.createCurveChart('sum-dist-chart', pSumDistObj, '', pSumStat, pSumCfg);
            LottoUI.renderMiniTable('p-sum-mini-body', recent5, pSumCfg);

            // [FIX] 모든 지표에 대한 통계 수치(Mean, Std) 계산 및 곡선 차트 렌더링
            var indicators = [
                { id: 'sequence-dist-chart', data: stats.seqFreq, label: '연속 번호', unit: '개', limit: 6 },
                { id: 'repeat-dist-chart', data: stats.repeatFreq, label: '직전 중복', unit: '개', limit: 6 },
                { id: 'occurrence-dist-chart', data: stats.occurrenceFreq, label: '최대 중복', unit: '개', limit: 6 },
                { id: 'unique-dist-chart', data: stats.uniqueFreq, label: '번호 종류', unit: '종', limit: 6 },
                { id: 'carry-pos-chart', data: stats.carryPosFreq, label: '자리 이월', unit: '개', limit: 6 },
                { id: 'carry-num-chart', data: stats.carryNumFreq, label: '숫자 이월', unit: '개', limit: 6 },
                { id: 'neighbor-dist-chart', data: stats.neighborFreq, label: '이웃수', unit: '개', limit: 6 },
                { id: 'odd-dist-chart', stats: stats.oddFreq, label: '홀수 개수', unit: '개', limit: 6 },
                { id: 'low-dist-chart', stats: stats.lowFreq, label: '저번호 개수', unit: '개', limit: 6 },
                { id: 'prime-dist-chart', stats: stats.primeFreq, label: '소수 개수', unit: '개', limit: 6 }
            ];

            // 수동으로 전달된 데이터 객체(stats.*Freq)를 기반으로 통계 계산 및 렌더링
            var processChart = function(cfg) {
                var freq = cfg.data || cfg.stats;
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

function renderPositionFreq(posFreq) {
    var container = document.getElementById('pos-freq-container');
    if (!container) return;
    var labels = ['일', '십', '백', '천', '만', '십만']; // [P9] 역방향 라벨
    var html = '';
    for (var i = 0; i < 6; i++) {
        var freq = posFreq[i];
        var max = 0;
        for (var j = 0; j < 10; j++) { if(freq[j] > max) max = freq[j]; }
        if (max === 0) max = 1;

        var bars = '';
        for (var val = 0; val < 10; val++) {
            var f = freq[val];
            var h = (f / max) * 100;
            var bH = f > 0 ? (h < 4 ? 4 : h) : 2;
            var isMax = f === max && f > 0;
            bars += '<div style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">' +
                    '<div class="pos-bar ' + (isMax?'active':'') + '" style="height: ' + bH + '%; width: 80%; max-width: 12px; background:' + (i===0?'#3182f6':'#94a3b8') + ';"></div>' +
                    '<span class="pos-label" style="margin-top: 5px; font-size: 0.6rem; font-weight:' + (isMax?'900':'normal') + ';">' + val + '</span></div>';
        }
        var specialStyle = i === 0 ? 'border: 2px solid #3182f6; background: #f0f7ff;' : ''; // 1의 자리 강조
        html += '<div class="pos-chart-box" style="padding: 12px 8px; ' + specialStyle + '"><h4>' + labels[i] + ' 단위</h4><div class="pos-bar-container" style="height: 80px; display: flex; align-items: flex-end; justify-content: space-around;">' + bars + '</div></div>';
    }
    container.innerHTML = html;
}

// [P10] 역방향 미출현 주기 차트 렌더러
function renderReverseGapChart(containerId, gapData) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '<div class="gap-chart-grid" style="display:grid; grid-template-columns: repeat(11, 1fr); gap: 2px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
    html += '<div style="background:#f1f5f9; font-size:0.6rem; font-weight:900; color:#475569; display:flex; align-items:center; justify-content:center;">단위</div>';
    for (var h = 0; h <= 9; h++) html += '<div style="text-align:center; font-size:0.6rem; font-weight:bold; background:#f1f5f9; padding:8px 0; color:#475569;">' + h + '</div>';
    
    var labels = ['일', '십', '백', '천', '만', '십만'];
    for (var i = 0; i < 6; i++) {
        var isPrimary = i === 0; // 1의 자리 강조
        html += '<div style="font-size:0.65rem; font-weight:bold; color:' + (isPrimary?'#3182f6':'#64748b') + '; display:flex; align-items:center; justify-content:center; background:' + (isPrimary?'#f0f7ff':'#f8fafc') + '; border-right: 1px solid #e2e8f0;">' + labels[i] + '</div>';
        for (var n = 0; n <= 9; n++) {
            var gap = gapData[i][n];
            var color = gap > 20 ? '#f04452' : (gap > 10 ? '#ff9500' : (gap === 0 ? '#3182f6' : '#94a3b8'));
            var opacity = gap === 0 ? 1 : Math.min(0.8, 0.2 + (gap / 40));
            var borderStyle = (isPrimary && gap === 0) ? 'box-shadow: inset 0 0 0 2px #3182f6;' : '';
            html += '<div style="text-align:center; padding:10px 0; font-size:0.75rem; font-weight:900; color:white; background:' + color + '; opacity:' + opacity + '; ' + borderStyle + '">' + gap + '</div>';
        }
    }
    html += '</div>';
    container.innerHTML = html;
}
// [P13] 당첨 번호 흐름 타임라인 렌더러
function renderFlowTimeline(recent15) {
    var container = document.getElementById('pension-flow-timeline-container');
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
        var prevDraw = recent15[i+1]; // 이전 회차 (배열이 최신순이므로 i+1)
        
        html += '<tr style="border-bottom:1px solid #f1f5f9; ' + (i===0?'background:#f0f7ff;':'') + '">';
        html += '<td style="padding:12px; text-align:center; font-size:0.75rem; font-weight:700;">' + draw.drawNo + '회</td>';
        html += '<td style="padding:12px; text-align:center;"><div class="pension-ball group mini" style="width:24px; height:24px; font-size:0.75rem;">' + draw.group + '</div></td>';
        
        // 역방향 (5 -> 0) 렌더링
        for (var p = 5; p >= 0; p--) {
            var val = draw.nums[p];
            var style = 'display:flex; justify-content:center; align-items:center;';
            var ballStyle = 'width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800; border:1px solid #e2e8f0; background:white;';
            var marker = '';

            if (prevDraw) {
                var prevVal = prevDraw.nums[p];
                if (val === prevVal) {
                    ballStyle = 'width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:900; border:2px solid #3182f6; background:#f0f7ff; color:#3182f6;';
                    marker = '<span style="position:absolute; top:2px; right:5px; font-size:0.5rem; color:#3182f6;">●</span>';
                } else if (Math.abs(val - prevVal) === 1) {
                    ballStyle = 'width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:900; border:2px solid #ff9500; background:#fffaf0; color:#ff9500;';
                    marker = '<span style="position:absolute; top:2px; right:5px; font-size:0.5rem; color:#ff9500;">○</span>';
                }
            }
            
            html += '<td style="padding:8px; text-align:center; position:relative;">' +
                    '<div style="' + style + '"><div style="' + ballStyle + '">' + val + '</div>' + marker + '</div></td>';
        }
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}
