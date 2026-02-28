document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            updateGuideStats(data);
        })
        .catch(err => console.error('Guide stats load failed:', err));
});

function updateGuideStats(data) {
    if (!data || !data.distributions) return;
    const dists = data.distributions;
    const total = data.total_draws;

    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}% (${count}/${total})</strong>`;
    };

    // 1. 총합 요약
    const sumBox = document.getElementById('sum-stat-box');
    if (sumBox && dists.sum) {
        const sortedSum = Object.entries(dists.sum).sort((a, b) => b[1] - a[1]);
        const topRange = sortedSum[0][0];
        const topCount = sortedSum[0][1];
        sumBox.innerHTML = `<div class="stat-highlight">실제 통계 결과: "${topRange}" 구간이 ${formatStat(topCount, total)}의 가장 높은 빈도를 보이고 있습니다.</div>`;
    }

    // 2. 홀짝 비율 리스트
    const oeList = document.getElementById('oe-stat-list');
    if (oeList && dists.odd_even) {
        const sortedOE = Object.entries(dists.odd_even).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topOE = sortedOE[0];
        oeList.innerHTML = `<div class="stat-highlight">실제 통계 결과: 홀짝 "${topOE[0]}" 비율이 ${formatStat(topOE[1], total)}로 가장 많이 출현했습니다.</div>` + 
            `<ul class="top-logic-list">` + 
            sortedOE.map(([label, count]) => `<li><span>홀짝 ${label}</span> ${formatStat(count, total)}</li>`).join('') + 
            `</ul>`;
    }

    // 3. 고저 비율 리스트
    const hlList = document.getElementById('hl-stat-list');
    if (hlList && dists.high_low) {
        const sortedHL = Object.entries(dists.high_low).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topHL = sortedHL[0];
        hlList.innerHTML = `<div class="stat-highlight">실제 통계 결과: 고저 "${topHL[0]}" 비율이 ${formatStat(topHL[1], total)}로 가장 많이 출현했습니다.</div>` + 
            `<ul class="top-logic-list">` + 
            sortedHL.map(([label, count]) => `<li><span>고저 ${label}</span> ${formatStat(count, total)}</li>`).join('') + 
            `</ul>`;
    }

    // 4. 이월수 및 1~3회전 매칭 요약
    const carryBox = document.getElementById('carry-neighbor-stat');
    if (carryBox && dists.period_1 && dists.period_1_3) {
        const p1_0 = dists.period_1["0"] || 0;
        const hasCarryCount = total - p1_0;
        const idealCount = Object.entries(dists.period_1_3)
            .filter(([k, v]) => parseInt(k) >= 3 && parseInt(k) <= 5)
            .reduce((acc, curr) => acc + curr[1], 0);
        
        carryBox.innerHTML = `실제 통계 결과: 직전 회차 번호가 1개 이상 포함될 확률은 ${formatStat(hasCarryCount, total)}입니다.<br>` + 
            `특히 최근 3개 회차 번호 중 3~5개가 포함될 확률은 ${formatStat(idealCount, total)}로 가장 빈번하게 출현합니다.`;
    }

    // 5. 특수 번호 및 패턴 분석
    const specialStat = document.getElementById('combined-special-stat');
    if (specialStat && dists.prime && dists.multiple_3 && dists.square) {
        const p23Count = (dists.prime["2"] || 0) + (dists.prime["3"] || 0);
        const m3Count = dists.multiple_3["2"] || 0;
        const sqCount = (dists.square["1"] || 0) + (dists.square["2"] || 0);

        specialStat.innerHTML = `실제 통계 결과:<br>` +
            `- 소수가 2~3개 포함될 확률: ${formatStat(p23Count, total)}<br>` +
            `- 3배수가 2개 포함될 확률: ${formatStat(m3Count, total)}<br>` +
            `- 제곱수가 1~2개 포함될 확률: ${formatStat(sqCount, total)}`;
    }

    // 6. 연속번호
    const conStat = document.getElementById('consecutive-stat');
    if (conStat && dists.consecutive) {
        const hasCon = total - (dists.consecutive["0"] || 0);
        const topCon = Object.entries(dists.consecutive).sort((a, b) => b[1] - a[1])[0];
        conStat.innerHTML = `<div class="stat-highlight">실제 통계 결과: 최소 한 쌍 이상의 연속번호가 출현할 확률은 ${formatStat(hasCon, total)}입니다. (가장 빈번: ${topCon[0]}쌍)</div>`;
    }

    // 7. 끝수 분석 (동끝수)
    const endStat = document.getElementById('end-digit-stat');
    if (endStat && dists.same_end) {
        const hasSameCount = total - (dists.same_end["1"] || 0);
        const same2Count = dists.same_end["2"] || 0;
        endStat.innerHTML = `실제 통계 결과: 동끝수가 존재할 확률은 ${formatStat(hasSameCount, total)}이며, 특히 2개의 동끝수가 출현할 확률은 ${formatStat(same2Count, total)}입니다.`;
    }

    // 8. 구간 분석 요약
    const bucketStat = document.getElementById('bucket-stat');
    if (bucketStat && dists.bucket_15 && dists.bucket_3) {
        const b15Top = Object.entries(dists.bucket_15).sort((a, b) => b[1] - a[1])[0];
        const b3Top = Object.entries(dists.bucket_3).sort((a, b) => b[1] - a[1])[0];

        bucketStat.innerHTML = `실제 통계 결과:<br>` +
            `- 3분할 기준 ${b15Top[0]}개 구간 점유 확률: ${formatStat(b15Top[1], total)}<br>` +
            `- 15분할 기준 ${b3Top[0]}개 구간 점유 확률: ${formatStat(b3Top[1], total)}`;
    }

    // 9. 용지 패턴 (모서리)
    const patternStat = document.getElementById('pattern-stat');
    if (patternStat && dists.pattern_corner) {
        const pcCount = (dists.pattern_corner["2"] || 0) + (dists.pattern_corner["3"] || 0);
        patternStat.innerHTML = `실제 통계 결과: 용지 모서리 영역에서 2~3개의 번호가 출현할 확률은 ${formatStat(pcCount, total)}입니다.`;
    }
}