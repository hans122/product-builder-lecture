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

    // 1. 총합 요약 업데이트
    const sumBox = document.getElementById('sum-stat-box');
    if (dists.sum) {
        const sortedSum = Object.entries(dists.sum).sort((a, b) => b[1] - a[1]);
        const topRange = sortedSum[0][0];
        const topCount = sortedSum[0][1];
        const percentage = ((topCount / total) * 100).toFixed(1);
        sumBox.innerHTML = `
            <div class="stat-highlight">
                실제 통계 결과: "${topRange}" 구간이 총 ${total}회 중 ${topCount}회 출현하여 
                약 ${percentage}%의 가장 높은 빈도를 보이고 있습니다.
            </div>
        `;
    }

    // 2. 홀짝 비율 리스트
    const oeList = document.getElementById('oe-stat-list');
    if (dists.odd_even) {
        const sortedOE = Object.entries(dists.odd_even).sort((a, b) => b[1] - a[1]);
        oeList.innerHTML = '<strong>주요 출현 비율 순위:</strong>';
        sortedOE.slice(0, 3).forEach(([ratio, count]) => {
            const perc = ((count / total) * 100).toFixed(1);
            const li = document.createElement('li');
            li.innerHTML = `<span>홀수 ${ratio.split(':')[0]} : 짝수 ${ratio.split(':')[1]}</span><span>${perc}% (${count}회)</span>`;
            oeList.appendChild(li);
        });
    }

    // 2-2. 고저 비율 리스트
    const hlList = document.getElementById('hl-stat-list');
    if (dists.high_low) {
        const sortedHL = Object.entries(dists.high_low).sort((a, b) => b[1] - a[1]);
        hlList.innerHTML = '<strong>주요 고:저 비율 순위:</strong>';
        sortedHL.slice(0, 3).forEach(([ratio, count]) => {
            const perc = ((count / total) * 100).toFixed(1);
            const li = document.createElement('li');
            li.innerHTML = `<span>저번호 ${ratio.split(':')[0]} : 고번호 ${ratio.split(':')[1]}</span><span>${perc}% (${count}회)</span>`;
            hlList.appendChild(li);
        });
    }

    // 3. 이월수/이웃수 요약
    const carryBox = document.getElementById('carry-neighbor-stat');
    if (dists.period_1) {
        const p1_0 = dists.period_1["0"] || 0;
        const carryProb = (100 - (p1_0 / total * 100)).toFixed(1);
        carryBox.innerHTML = `데이터 분석 결과, 이월수가 1개 이상 포함될 확률은 <strong>${carryProb}%</strong>에 달합니다. 즉, 10번 중 7~8번은 전회차 번호가 다시 나옵니다.`;
    }

    // 5. 연속번호 요약
    const conBox = document.getElementById('consecutive-stat');
    if (dists.consecutive) {
        const con_0 = dists.consecutive["0"] || 0;
        const hasConProb = (100 - (con_0 / total * 100)).toFixed(1);
        conBox.innerHTML = `<div class="stat-highlight">우리 사이트 분석: 전체 회차의 <strong>${hasConProb}%</strong>에서 최소 한 쌍 이상의 연속번호가 등장했습니다.</div>`;
    }

    // 6. 끝수 분석 요약
    const endDigitStat = document.getElementById('end-digit-stat');
    if (dists.same_end) {
        const same_1 = dists.same_end["1"] || 0;
        const hasSameEndProb = (100 - (same_1 / total * 100)).toFixed(1);
        endDigitStat.innerHTML = `역대 데이터 중 <strong>${hasSameEndProb}%</strong>의 회차에서 최소 한 쌍 이상의 동끝수(같은 일의 자리)가 출현했습니다.`;
    }

    // 7. 특수 패턴 요약
    const specialStat = document.getElementById('special-pattern-stat');
    if (dists.square && dists.multiple_5) {
        const square_0 = dists.square["0"] || 0;
        const m5_0 = dists.multiple_5["0"] || 0;
        const squareProb = (100 - (square_0 / total * 100)).toFixed(1);
        const m5Prob = (100 - (m5_0 / total * 100)).toFixed(1);
        specialStat.innerHTML = `완전제곱수는 전체의 <strong>${squareProb}%</strong>에서, 5의 배수는 <strong>${m5Prob}%</strong>의 확률로 최소 1개 이상 포함되고 있습니다.`;
    }
}