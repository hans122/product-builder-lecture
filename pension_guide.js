/**
 * Pension Guide Live Data Loader v2.1 (ES5 Safe Mode)
 */

document.addEventListener('DOMContentLoaded', function() {
    LottoDataManager.getPensionRecords(function(records) {
        if (!records || records.length === 0) return;

        var total = records.length;

        // 분석용 변수 초기화
        var stats = {
            posFreq: [], groupFreq: [0,0,0,0,0,0],
            seqCount: 0, repeatCount: 0, scatterCount: 0, uniqueHighCount: 0,
            goldenSumCount: 0, carryCount: 0, odd33Count: 0, low33Count: 0, prime24Count: 0
        };
        for (var k = 0; k < 6; k++) { stats.posFreq[k] = [0,0,0,0,0,0,0,0,0,0]; }

        var primes = [2, 3, 5, 7];

        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            var group = parseInt(rec.group);
            var numsArr = rec.nums;
            
            // P1 & P3
            for (var pos = 0; pos < 6; pos++) { stats.posFreq[pos][numsArr[pos]]++; }
            if (group >= 1 && group <= 5) stats.groupFreq[group]++;

            // P2 Patterns
            var p = PensionUtils.analyzePatterns(numsArr);
            if (p.seq >= 2) stats.seqCount++;
            if (p.adjRep >= 3) stats.repeatCount++;
            if (p.maxOccur >= 2) stats.scatterCount++;
            if (p.unique >= 4) stats.uniqueHighCount++;

            // P4 & P6 Balance
            var b = PensionUtils.analyzeBalance(numsArr);
            if (b.sum >= 20 && b.sum <= 34) stats.goldenSumCount++;
            if (b.odd === 3) stats.odd33Count++;
            if (b.low === 3) stats.low33Count++;
            if (b.prime >= 2 && b.prime <= 4) stats.prime24Count++;

            // P5 Correlation
            if (i + 1 < records.length) {
                var prev = records[i+1].nums;
                var isCarried = false;
                for (var m = 0; m < 6; m++) { if (numsArr[m] === prev[m]) isCarried = true; }
                if (isCarried) stats.carryCount++;
            }
        }

        // 화면 업데이트
        var hotNums = [];
        for (var pIdx = 0; pIdx < 6; pIdx++) {
            var maxV = 0, maxN = 0;
            for (var v = 0; v < 10; v++) { if(stats.posFreq[pIdx][v] > maxV) { maxV = stats.posFreq[pIdx][v]; maxN = v; } }
            hotNums.push(maxN);
        }
        updateVal('p1-hot-numbers', hotNums.join(', '));

        updateRate('p2-seq-rate', stats.seqCount, total);
        updateRate('p2-repeat-rate', stats.repeatCount, total);
        updateRate('p2-scatter-rate', stats.scatterCount, total);
        updateRate('p2-unique-rate', stats.uniqueHighCount, total);

        var bestG = 1, maxG = 0;
        for (var gIdx = 1; gIdx <= 5; gIdx++) { if(stats.groupFreq[gIdx] > maxG) { maxG = stats.groupFreq[gIdx]; bestG = gIdx; } }
        updateVal('p3-best-group', bestG + '조');

        updateRate('p4-golden-rate', stats.goldenSumCount, total);
        updateRate('p5-carry-rate', stats.carryCount, total - 1);
        updateRate('p6-odd-rate', stats.odd33Count, total);
        updateRate('p6-low-rate', stats.low33Count, total);
        updateRate('p6-prime-rate', stats.prime24Count, total);
    });
});

function updateVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.innerText = val;
}

function updateRate(id, count, total) {
    var el = document.getElementById(id);
    if (el && total > 0) el.innerText = ((count / total) * 100).toFixed(1);
}
