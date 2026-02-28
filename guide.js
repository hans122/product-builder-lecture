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

    // 1. 총합 요약
    const sumBox = document.getElementById('sum-stat-box');
    if (sumBox && dists.sum) {
        const sortedSum = Object.entries(dists.sum).sort((a, b) => b[1] - a[1]);
        const topRange = sortedSum[0][0];
        const topCount = sortedSum[0][1];
        const percentage = ((topCount / total) * 100).toFixed(1);
        sumBox.innerHTML = `<div class="stat-highlight">실제 통계 결과: "${topRange}" 구간이 총 ${total}회 중 ${topCount}회 출현하여 약 ${percentage}%의 가장 높은 빈도를 보이고 있습니다.</div>`;
    }

    // 2. 홀짝 비율 리스트
    const oeList = document.getElementById('oe-stat-list');
    if (oeList && dists.odd_even) {
        const sortedOE = Object.entries(dists.odd_even).sort((a, b) => b[1] - a[1]).slice(0, 3);
        oeList.innerHTML = sortedOE.map(([label, count]) => {
            const prob = ((count / total) * 100).toFixed(1);
            return `<li><span>홀짝 ${label}</span> <strong>${prob}%</strong></li>`;
        }).join('');
    }

    // 3. 고저 비율 리스트
    const hlList = document.getElementById('hl-stat-list');
    if (hlList && dists.high_low) {
        const sortedHL = Object.entries(dists.high_low).sort((a, b) => b[1] - a[1]).slice(0, 3);
        hlList.innerHTML = sortedHL.map(([label, count]) => {
            const prob = ((count / total) * 100).toFixed(1);
            return `<li><span>고저 ${label}</span> <strong>${prob}%</strong></li>`;
        }).join('');
    }

    // 4. 이월수 및 1~3회전 매칭 요약
    const carryBox = document.getElementById('carry-neighbor-stat');
    if (carryBox && dists.period_1 && dists.period_1_3) {
        const p1_0 = dists.period_1["0"] || 0;
        const carryProb = (100 - (p1_0 / total * 100)).toFixed(1);
        const idealCount = Object.entries(dists.period_1_3)
            .filter(([k, v]) => parseInt(k) >= 3 && parseInt(k) <= 5)
            .reduce((acc, curr) => acc + curr[1], 0);
        const idealProb = ((idealCount / total) * 100).toFixed(1);
        
        carryBox.innerHTML = `데이터 분석 결과, 직전 회차 번호가 1개 이상 포함될 확률은 <strong>${carryProb}%</strong>입니다.<br>특히 최근 3개 회차 번호 합집합 중 <strong>3~5개</strong>가 포함될 확률은 <strong>${idealProb}%</strong>로 가장 빈번하게 출현합니다.`;
    }

    // 5. 특수 번호 및 패턴 분석
    const specialStat = document.getElementById('combined-special-stat');
    if (specialStat && dists.prime && dists.multiple_3 && dists.square) {
        const p23 = (dists.prime["2"] || 0) + (dists.prime["3"] || 0);
        const p23Prob = ((p23 / total) * 100).toFixed(1);
        const m3_2 = dists.multiple_3["2"] || 0;
        const m3Prob = ((m3_2 / total) * 100).toFixed(1);
        const sq1 = (dists.square["1"] || 0) + (dists.square["2"] || 0);
        const sqProb = ((sq1 / total) * 100).toFixed(1);

        specialStat.innerHTML = `소수가 2~3개 포함될 확률: <strong>${p23Prob}%</strong><br>3배수가 2개 포함될 확률: <strong>${m3Prob}%</strong><br>제곱수가 1~2개 포함될 확률: <strong>${sqProb}%</strong>`;
    }

    // 6. 연속번호
    const conStat = document.getElementById('consecutive-stat');
    if (conStat && dists.consecutive) {
        const hasCon = total - (dists.consecutive["0"] || 0);
        const conProb = ((hasCon / total) * 100).toFixed(1);
        const topCon = Object.entries(dists.consecutive).sort((a, b) => b[1] - a[1])[0];
        conStat.innerHTML = `<div class="stat-highlight">최소 한 쌍 이상의 연속번호가 출현할 확률은 <strong>${conProb}%</strong>에 달합니다. 특히 <strong>${topCon[0]}쌍</strong>이 포함된 경우가 가장 많습니다.</div>`;
    }

    // 7. 끝수 분석 (동끝수)
    const endStat = document.getElementById('end-digit-stat');
    if (endStat && dists.same_end) {
        const same2 = dists.same_end["2"] || 0;
        const same2Prob = ((same2 / total) * 100).toFixed(1);
        const hasSame = total - (dists.same_end["1"] || 0);
        const hasSameProb = ((hasSame / total) * 100).toFixed(1);
        endStat.innerHTML = `당첨 번호 중 동끝수가 존재할 확률은 <strong>${hasSameProb}%</strong>이며, 특히 <strong>2개</strong>의 동끝수가 출현할 확률은 <strong>${same2Prob}%</strong>입니다.`;
    }

    // 8. 구간 분석 요약
    const bucketStat = document.getElementById('bucket-stat');
    if (bucketStat && dists.bucket_15 && dists.bucket_3) {
        const sortedB15 = Object.entries(dists.bucket_15).sort((a, b) => b[1] - a[1]);
        const b15Top = sortedB15[0];
        const b15Prob = ((b15Top[1] / total) * 100).toFixed(1);
        
        const sortedB3 = Object.entries(dists.bucket_3).sort((a, b) => b[1] - a[1]);
        const b3Top = sortedB3[0];
        const b3Prob = ((b3Top[1] / total) * 100).toFixed(1);

        bucketStat.innerHTML = `3분할(15개씩) 기준 <strong>${b15Top[0]}개 구간</strong> 점유 확률: <strong>${b15Prob}%</strong><br>15분할(3개씩) 기준 <strong>${b3Top[0]}개 구간</strong> 점유 확률: <strong>${b3Prob}%</strong>`;
    }

    // 9. 용지 패턴 (모서리)
    const patternStat = document.getElementById('pattern-stat');
    if (patternStat && dists.pattern_corner) {
        const pc23 = (dists.pattern_corner["2"] || 0) + (dists.pattern_corner["3"] || 0);
        const pcProb = ((pc23 / total) * 100).toFixed(1);
        patternStat.innerHTML = `용지 모서리 영역에서 <strong>2~3개</strong>의 번호가 출현할 확률은 약 <strong>${pcProb}%</strong>입니다.`;
    }
}