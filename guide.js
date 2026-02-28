document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            updateGuideStats(data);
        });
});

function updateGuideStats(data) {
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

    // 2. 이월수 요약 (윈도우 기반)
    const carryBox = document.getElementById('carry-neighbor-stat');
    if (carryBox && dists.period_1 && dists.period_1_3) {
        const p1_0 = dists.period_1["0"] || 0;
        const carryProb = (100 - (p1_0 / total * 100)).toFixed(1);
        // 1~3회전 매칭이 3~5개인 경우의 합계 계산
        const idealCount = Object.entries(dists.period_1_3)
            .filter(([k, v]) => parseInt(k) >= 3 && parseInt(k) <= 5)
            .reduce((acc, curr) => acc + curr[1], 0);
        const idealProb = ((idealCount / total) * 100).toFixed(1);
        
        carryBox.innerHTML = `데이터 분석 결과, 직전 회차 번호가 1개 이상 포함될 확률은 <strong>${carryProb}%</strong>입니다.<br>특히 최근 3개 회차 번호 중 <strong>3~5개</strong>가 포함될 확률은 <strong>${idealProb}%</strong>로 가장 안정적인 선택입니다.`;
    }

    // 3. 구간 분석 요약
    const bucketStat = document.getElementById('bucket-stat');
    if (bucketStat && dists.bucket_15) {
        const sortedB15 = Object.entries(dists.bucket_15).sort((a, b) => b[1] - a[1]);
        bucketStat.innerHTML = `3분할 분석 결과, 당첨번호가 <strong>${sortedB15[0][0]}개 구간</strong>에 걸쳐 출현할 확률이 ${((sortedB15[0][1]/total)*100).toFixed(1)}%로 가장 높습니다.`;
    }
}