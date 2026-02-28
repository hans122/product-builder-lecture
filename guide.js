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

    // 통계 포맷 함수: 30.5%(312/1024)
    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}%(${count}/${total})</strong>`;
    };

    // 영역 범위 및 해당 범위 내 실제 히트수 계산 함수
    const getZoneInfo = (key, stat, dist) => {
        if (!stat || !dist) return null;
        
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        const optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        const safeMax = Math.round(stat.mean + 2 * stat.std);

        let optHits = 0;
        let safeHits = 0;

        Object.entries(dist).forEach(([label, count]) => {
            let val;
            if (label.includes('-')) val = parseInt(label.split('-')[0]);
            else if (label.includes(':')) val = parseInt(label.split(':')[0]);
            else val = parseInt(label);

            if (!isNaN(val)) {
                if (val >= optMin && val <= optMax) optHits += count;
                if (val >= safeMin && val <= safeMax) safeHits += count;
            }
        });

        return {
            optimal: `${optMin} ~ ${optMax}`,
            safe: `${safeMin} ~ ${safeMax}`,
            optHits: optHits,
            safeHits: safeHits
        };
    };

    // 하이라이트 박스 및 팁 업데이트 함수
    const updateSection = (idPrefix, statKey, distKey) => {
        const container = document.getElementById(`${idPrefix}-stat-container`);
        const tipElem = document.getElementById(`${idPrefix}-tip`);
        const info = getZoneInfo(statKey, stats[statKey], dists[distKey]);

        if (info) {
            // 1. 통계 하이라이트 업데이트 (요청하신 한 줄 형식)
            if (container) {
                container.innerHTML = `<div class="stat-highlight" style="line-height:1.8;">
                    📊 실제 통계 결과: 통계적 <span class="text-optimal">옵티멀 존은 "${info.optimal}" ${formatStat(info.optHits, total)}</span>, 
                    <span class="text-safe">세이프 존은 "${info.safe}" ${formatStat(info.safeHits, total)}</span>
                </div>`;
            }

            // 2. 공략 팁 업데이트 (요청하신 압축 형식)
            if (tipElem) {
                const subjects = {
                    'sum': '합계 수치는',
                    'oe': '홀수 개수는',
                    'hl': '저번호 개수는',
                    'carry': '이월수(1~3회전) 중복 개수는',
                    'special': '소수 포함 개수는',
                    'consecutive': '연번 쌍의 개수는',
                    'end-digit': '동끝수 출현 개수는',
                    'bucket': '구간 점유 개수는',
                    'pattern': '모서리 영역 포함 개수는'
                };
                const subject = subjects[idPrefix] || '해당 지표는';
                tipElem.innerHTML = `<strong>공략 팁:</strong> ${subject} 권장 세이프 <strong>"${info.safe}"</strong> 이 좋습니다.`;
            }
        }
    };

    // 각 섹션별 데이터 업데이트 실행
    updateSection('sum', 'sum', 'sum');
    updateSection('oe', 'odd_count', 'odd_even');
    updateSection('hl', 'low_count', 'high_low');
    updateSection('carry', 'period_1', 'period_1');
    updateSection('special', 'prime', 'prime');
    updateSection('consecutive', 'consecutive', 'consecutive');
    updateSection('end-digit', 'same_end', 'same_end');
    updateSection('bucket', 'bucket_15', 'bucket_15');
    updateSection('pattern', 'pattern_corner', 'pattern_corner');
}