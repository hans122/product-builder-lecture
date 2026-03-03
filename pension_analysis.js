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
                    inc(stats.neighborFreq, dyn.neighbor);
                }
            }

            renderPositionFreq(stats.posFreq);
            LottoUI.renderGapChart('digit-gap-container', stats.digitGap);
            
            var cm = [
                ['sequence-dist-chart', stats.seqFreq, '개 연속'],
                ['repeat-dist-chart', stats.repeatFreq, '회 연속'],
                ['occurrence-dist-chart', stats.occurrenceFreq, '개 포함'],
                ['unique-dist-chart', stats.uniqueFreq, '종류'],
                ['carry-pos-chart', stats.carryPosFreq, '개 이월'],
                ['neighbor-dist-chart', stats.neighborFreq, '개 이웃'],
                ['odd-dist-chart', stats.oddFreq, '개 홀수'],
                ['low-dist-chart', stats.lowFreq, '개 저번호'],
                ['prime-dist-chart', stats.primeFreq, '개 소수']
            ];

            for (var nIdx = 0; nIdx < cm.length; nIdx++) {
                LottoUI.renderBarChart(cm[nIdx][0], cm[nIdx][1], cm[nIdx][2]);
            }

            renderGroupDist(stats.groupFreq);
            renderSumDist(stats.sumFreq);
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
    var labels = ['십만', '만', '천', '백', '십', '일'];
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
            bars += '<div style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">' +
                    '<div class="pos-bar ' + (f===max?'active':'') + '" style="height: ' + bH + '%; width: 80%; max-width: 12px;"></div>' +
                    '<span class="pos-label" style="margin-top: 5px; font-size: 0.6rem;">' + val + '</span></div>';
        }
        html += '<div class="pos-chart-box" style="padding: 12px 8px;"><h4>' + labels[i] + '</h4><div class="pos-bar-container" style="height: 80px; display: flex; align-items: flex-end; justify-content: space-around;">' + bars + '</div></div>';
    }
    container.innerHTML = html;
}

function renderGroupDist(groupFreq) {
    var container = document.getElementById('group-dist-chart');
    if (!container) return;
    var actual = groupFreq.slice(1);
    var max = 0;
    for (var i = 0; i < actual.length; i++) { if(actual[i] > max) max = actual[i]; }
    if (max === 0) max = 1;

    var html = '<div style="display: flex; align-items: flex-end; height: 100%; padding-bottom: 20px;">';
    for (var j = 0; j < actual.length; j++) {
        var f = actual[j];
        var h = (f / max) * 100;
        html += '<div style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; margin: 0 8px;">' +
                '<span style="font-size: 0.7rem; color: #64748b; font-weight: bold;">' + f + '회</span>' +
                '<div style="width: 100%; height: ' + (h < 8 ? 8 : h) + '%; background: #ff8c00; border-radius: 4px; opacity: ' + (0.5 + (f/max/2)) + ';"></div>' +
                '<span style="font-size: 0.8rem; font-weight: 900; color: #334155; margin-top: 8px;">' + (j+1) + '조</span></div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderSumDist(sumFreq) {
    var container = document.getElementById('sum-dist-chart');
    if (!container) return;
    var max = 0;
    for (var k in sumFreq) { if(sumFreq.hasOwnProperty(k)) { if(sumFreq[k] > max) max = sumFreq[k]; } }
    if (max === 0) max = 1;

    var html = '<div style="display: flex; align-items: flex-end; height: 100%; padding-bottom: 20px;">';
    for (var i = 0; i <= 54; i++) {
        var f = sumFreq[i] || 0;
        var h = (f / max) * 100;
        html += '<div style="flex: 1; height: ' + (f > 0 ? (h < 2 ? 2 : h) : 0) + '%; background: ' + (f>0?'#ff8c00':'#cbd5e1') + '; border-radius: 1px; margin: 0 0.5px;"></div>';
    }
    html += '</div><div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; margin-top: 5px;"><span>합계 0</span><span>중간 27</span><span>최대 54</span></div>';
    container.innerHTML = html;
}
