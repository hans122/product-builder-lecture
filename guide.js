document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            updateGuideStats(data);
        })
        .catch(err => console.error('Guide stats load failed:', err));
});

function updateGuideStats(data) {
    if (!data || !data.distributions || !data.stats_summary) return;
    const dists = data.distributions;
    const stats = data.stats_summary;
    const total = data.total_draws;

    // 통계 포맷 함수
    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}% (${count}/${total})</strong>`;
    };

    // 영역 범위 계산 함수
    const getRangeText = (stat) => {
        if (!stat) return null;
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        const optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        const safeMax = Math.round(stat.mean + 2 * stat.std);
        return {
            optimal: `${optMin} ~ ${optMax}`,
            safe: `${safeMin} ~ ${safeMax}`
        };
    };

    // 하이라이트 박스 생성 함수 (영역 정보 포함)
    const wrapHighlight = (text, ranges = null) => {
        let html = `<div class="stat-highlight">📊 실제 통계 결과: ${text}`;
        if (ranges) {
            html += `<div style="margin-top:8px; display:flex; gap:10px; font-size:0.85rem;">
                <span class="text-optimal">● 옵티멀: ${ranges.optimal}</span>
                <span class="text-safe">● 세이프: ${ranges.safe}</span>
            </div>`;
        }
        html += `</div>`;
        return html;
    };

    // 1. 총합 요약
    const sumContainer = document.getElementById('sum-stat-container');
    if (sumContainer && stats.sum) {
        const ranges = getRangeText(stats.sum);
        const sortedSum = Object.entries(dists.sum).sort((a, b) => b[1] - a[1]);
        sumContainer.innerHTML = wrapHighlight(`가장 많이 출현한 구간은 "${sortedSum[0][0]}" 입니다.`, ranges);
    }

    // 2. 홀짝 비율
    const oeContainer = document.getElementById('oe-stat-container');
    if (oeContainer && stats.odd_count) {
        const ranges = getRangeText(stats.odd_count);
        const coreRatios = ["3:3", "2:4", "4:2"];
        const coreCount = coreRatios.reduce((acc, r) => acc + (dists.odd_even[r] || 0), 0);
        oeContainer.innerHTML = wrapHighlight(`안정적인 주요 비율(3:3, 2:4, 4:2)이 전체의 ${formatStat(coreCount, total)}를 차지합니다.`, ranges);
    }

    // 2-2. 고저 비율
    const hlContainer = document.getElementById('hl-stat-container');
    if (hlContainer && stats.low_count) {
        const ranges = getRangeText(stats.low_count);
        const coreRatios = ["3:3", "2:4", "4:2"];
        const coreCount = coreRatios.reduce((acc, r) => acc + (dists.high_low[r] || 0), 0);
        hlContainer.innerHTML = wrapHighlight(`주요 비율 합계가 전체의 ${formatStat(coreCount, total)}를 점유하고 있습니다.`, ranges);
    }

    // 3. 이월수 및 1~3회전
    const carryContainer = document.getElementById('carry-stat-container');
    if (carryContainer && stats.period_1) {
        const ranges = getRangeText(stats.period_1);
        const hasCarryCount = total - (dists.period_1["0"] || 0);
        carryContainer.innerHTML = wrapHighlight(`직전 회차 번호가 1개 이상 포함될 확률은 ${formatStat(hasCarryCount, total)}입니다.`, ranges);
    }

    // 4. 특수 번호
    const specialContainer = document.getElementById('special-stat-container');
    if (specialContainer && stats.prime) {
        const ranges = getRangeText(stats.prime);
        const p23Count = (dists.prime["2"] || 0) + (dists.prime["3"] || 0);
        specialContainer.innerHTML = wrapHighlight(`소수가 2~3개 포함될 확률은 ${formatStat(p23Count, total)}입니다.`, ranges);
    }

    // 5. 연속번호
    const conContainer = document.getElementById('consecutive-stat-container');
    if (conContainer && stats.consecutive) {
        const ranges = getRangeText(stats.consecutive);
        const hasConCount = total - (dists.consecutive["0"] || 0);
        conContainer.innerHTML = wrapHighlight(`최소 한 쌍 이상의 연번이 출현할 확률은 ${formatStat(hasConCount, total)}입니다.`, ranges);
    }

    // 6. 끝수 (동끝수)
    const endDigitContainer = document.getElementById('end-digit-stat-container');
    if (endDigitContainer && stats.same_end) {
        const ranges = getRangeText(stats.same_end);
        const same2Count = dists.same_end["2"] || 0;
        endDigitContainer.innerHTML = wrapHighlight(`2개의 동끝수가 동시에 출현할 확률은 ${formatStat(same2Count, total)}입니다.`, ranges);
    }

    // 7. 구간 분석 (3분할 기준)
    const bucketContainer = document.getElementById('bucket-stat-container');
    if (bucketContainer && stats.bucket_15) {
        const ranges = getRangeText(stats.bucket_15);
        const b15Top = Object.entries(dists.bucket_15).sort((a, b) => b[1] - a[1])[0];
        bucketContainer.innerHTML = wrapHighlight(`3분할 영역 중 ${b15Top[0]}개 구간을 점유할 확률이 가장 높습니다.`, ranges);
    }

    // 8. 용지 패턴 (모서리)
    const patternContainer = document.getElementById('pattern-stat-container');
    if (patternContainer && stats.pattern_corner) {
        const ranges = getRangeText(stats.pattern_corner);
        const pcCount = (dists.pattern_corner["2"] || 0) + (dists.pattern_corner["3"] || 0);
        patternContainer.innerHTML = wrapHighlight(`모서리 영역에서 2~3개가 출현할 확률은 ${formatStat(pcCount, total)}입니다.`, ranges);
    }
}