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

    // 통계 포맷 함수: 30.5% (312/1024)
    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}% (${count}/${total})</strong>`;
    };

    // 하이라이트 박스 생성 함수
    const wrapHighlight = (text) => `<div class="stat-highlight">실제 통계 결과: ${text}</div>`;

    // 1. 총합 요약
    const sumContainer = document.getElementById('sum-stat-container');
    if (sumContainer && dists.sum) {
        const sortedSum = Object.entries(dists.sum).sort((a, b) => b[1] - a[1]);
        const topRange = sortedSum[0][0];
        const topCount = sortedSum[0][1];
        sumContainer.innerHTML = wrapHighlight(`"${topRange}" 구간이 ${formatStat(topCount, total)}의 가장 높은 빈도를 보이고 있습니다.`);
    }

    // 2. 홀짝 비율 (주요 비율 강조 + 리스트)
    const oeContainer = document.getElementById('oe-stat-container');
    if (oeContainer && dists.odd_even) {
        const sortedOE = Object.entries(dists.odd_even).sort((a, b) => b[1] - a[1]);
        const coreRatios = ["4:2", "3:3", "2:4"];
        const coreCount = coreRatios.reduce((acc, r) => acc + (dists.odd_even[r] || 0), 0);
        
        oeContainer.innerHTML = wrapHighlight(`주요 비율(4:2, 3:3, 2:4)의 합계가 전체의 ${formatStat(coreCount, total)}를 차지합니다.`) + 
            `<ul class="top-logic-list">` + 
            sortedOE.slice(0, 3).map(([label, count]) => `<li><span>홀짝 ${label}</span> ${formatStat(count, total)}</li>`).join('') + 
            `</ul>`;
    }

    // 3. 고저 비율 (주요 비율 강조 + 리스트)
    const hlContainer = document.getElementById('hl-stat-container');
    if (hlContainer && dists.high_low) {
        const sortedHL = Object.entries(dists.high_low).sort((a, b) => b[1] - a[1]);
        const coreRatios = ["4:2", "3:3", "2:4"];
        const coreCount = coreRatios.reduce((acc, r) => acc + (dists.high_low[r] || 0), 0);

        hlContainer.innerHTML = wrapHighlight(`주요 비율(4:2, 3:3, 2:4)의 합계가 전체의 ${formatStat(coreCount, total)}를 차지합니다.`) + 
            `<ul class="top-logic-list">` + 
            sortedHL.slice(0, 3).map(([label, count]) => `<li><span>고저 ${label}</span> ${formatStat(count, total)}</li>`).join('') + 
            `</ul>`;
    }

    // 4. 이월수 및 1~3회전 매칭 요약
    const carryContainer = document.getElementById('carry-stat-container');
    if (carryContainer && dists.period_1 && dists.period_1_3) {
        const hasCarryCount = total - (dists.period_1["0"] || 0);
        const idealCount = Object.entries(dists.period_1_3)
            .filter(([k, v]) => parseInt(k) >= 3 && parseInt(k) <= 5)
            .reduce((acc, curr) => acc + curr[1], 0);
        
        carryContainer.innerHTML = wrapHighlight(`직전 회차 번호가 1개 이상 포함될 확률은 ${formatStat(hasCarryCount, total)}이며, 최근 3회차 합집합 중 3~5개가 포함될 확률은 ${formatStat(idealCount, total)}로 매우 높습니다.`);
    }

    // 5. 특수 번호 분석 (소수, 3배수, 제곱수)
    const specialContainer = document.getElementById('special-stat-container');
    if (specialContainer && dists.prime && dists.multiple_3 && dists.square) {
        const p23Count = (dists.prime["2"] || 0) + (dists.prime["3"] || 0);
        const m3Count = dists.multiple_3["2"] || 0;
        const sqCount = (dists.square["1"] || 0) + (dists.square["2"] || 0);

        specialContainer.innerHTML = wrapHighlight(
            `소수 2~3개 포함: ${formatStat(p23Count, total)} | ` +
            `3배수 2개 포함: ${formatStat(m3Count, total)} | ` +
            `제곱수 1~2개 포함: ${formatStat(sqCount, total)}`
        );
    }

    // 6. 연속번호
    const conContainer = document.getElementById('consecutive-stat-container');
    if (conContainer && dists.consecutive) {
        const hasConCount = total - (dists.consecutive["0"] || 0);
        const topCon = Object.entries(dists.consecutive).sort((a, b) => b[1] - a[1])[0];
        conContainer.innerHTML = wrapHighlight(`최소 한 쌍 이상의 연속번호가 출현할 확률은 ${formatStat(hasConCount, total)}에 달합니다. (가장 빈번: ${topCon[0]}쌍)`);
    }

    // 7. 끝수 분석 (동끝수)
    const endDigitContainer = document.getElementById('end-digit-stat-container');
    if (endDigitContainer && dists.same_end) {
        const same2Count = dists.same_end["2"] || 0;
        const hasSameCount = total - (dists.same_end["1"] || 0);
        endDigitContainer.innerHTML = wrapHighlight(`동끝수가 존재할 확률은 ${formatStat(hasSameCount, total)}이며, 특히 2개의 동끝수가 출현할 확률은 ${formatStat(same2Count, total)}입니다.`);
    }

    // 8. 구간 분석 요약
    const bucketContainer = document.getElementById('bucket-stat-container');
    if (bucketContainer && dists.bucket_15 && dists.bucket_3) {
        const b15Top = Object.entries(dists.bucket_15).sort((a, b) => b[1] - a[1])[0];
        const b3Top = Object.entries(dists.bucket_3).sort((a, b) => b[1] - a[1])[0];

        bucketContainer.innerHTML = wrapHighlight(
            `3분할(15개씩) ${b15Top[0]}개 구간 점유 확률: ${formatStat(b15Top[1], total)} | ` +
            `15분할(3개씩) ${b3Top[0]}개 구간 점유 확률: ${formatStat(b3Top[1], total)}`
        );
    }

    // 9. 용지 패턴 (모서리)
    const patternContainer = document.getElementById('pattern-stat-container');
    if (patternContainer && dists.pattern_corner) {
        const pcCount = (dists.pattern_corner["2"] || 0) + (dists.pattern_corner["3"] || 0);
        patternContainer.innerHTML = wrapHighlight(`용지 모서리 영역에서 2~3개의 번호가 출현할 확률은 ${formatStat(pcCount, total)}입니다.`);
    }
}