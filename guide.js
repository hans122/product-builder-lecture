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

    // 통계 포맷 함수: 30.5% (312/1024)
    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}% (${count}/${total})</strong>`;
    };

    // 영역 범위 및 해당 범위 내 실제 히트수 계산 함수
    const getZoneInfo = (key, stat, dist) => {
        if (!stat || !dist) return null;
        
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        const optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        const safeMax = Math.round(stat.mean + 2 * stat.std);

        // 해당 범위(Safe) 내의 실제 누적 당첨 횟수 계산
        let safeHits = 0;
        Object.entries(dist).forEach(([label, count]) => {
            // "120-139" 같은 범주형 키 처리
            let val;
            if (label.includes('-')) val = parseInt(label.split('-')[0]);
            else if (label.includes(':')) val = parseInt(label.split(':')[0]);
            else val = parseInt(label);

            if (!isNaN(val) && val >= safeMin && val <= safeMax) {
                safeHits += count;
            }
        });

        return {
            optimal: `${optMin} ~ ${optMax}`,
            safe: `${safeMin} ~ ${safeMax}`,
            safeHits: safeHits
        };
    };

    // 하이라이트 박스 및 팁 업데이트 함수
    const updateSection = (idPrefix, statKey, distKey, titleText = "") => {
        const container = document.getElementById(`${idPrefix}-stat-container`);
        const tipElem = document.getElementById(`${idPrefix}-tip`);
        const info = getZoneInfo(statKey, stats[statKey], dists[distKey]);

        if (info) {
            // 1. 통계 하이라이트 업데이트 (옵티멀 존 수치 직접 노출)
            if (container) {
                container.innerHTML = `<div class="stat-highlight">
                    📊 실제 통계 결과: ${titleText} <strong>옵티멀 존은 "${info.optimal}"</strong> 입니다.
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.05);">
                        <span class="text-safe" style="font-size:0.9rem;">✔ 세이프 존 적중률: ${formatStat(info.safeHits, total)}</span>
                        <div style="margin-top:5px; display:flex; gap:15px; font-size:0.8rem; opacity:0.8;">
                            <span>● 옵티멀 범위: ${info.optimal}</span>
                            <span>● 세이프 범위: ${info.safe}</span>
                        </div>
                    </div>
                </div>`;
            }

            // 2. 공략 팁 업데이트 (세이프 범위 명시)
            if (tipElem) {
                const originalTip = tipElem.innerHTML.split('<br>')[0].split('(')[0].trim();
                tipElem.innerHTML = `${originalTip} <br><span class="text-safe" style="font-weight:bold; font-size:0.85rem;">(권장 세이프 범위: ${info.safe})</span>`;
            }
        }
    };

    // 각 섹션별 데이터 업데이트 실행
    updateSection('sum', 'sum', 'sum', `역대 당첨 확률이 가장 높은 합계`);
    updateSection('oe', 'odd_count', 'odd_even', `홀수 개수의 통계적`);
    updateSection('hl', 'low_count', 'high_low', `저번호(1~22) 개수의`);
    updateSection('carry', 'period_1', 'period_1', `직전 회차 이월수의`);
    updateSection('special', 'prime', 'prime', `소수(Prime) 포함 개수의`);
    updateSection('consecutive', 'consecutive', 'consecutive', `연속 번호(쌍)의`);
    updateSection('end-digit', 'same_end', 'same_end', `동일 끝수 출현 개수의`);
    updateSection('bucket', 'bucket_15', 'bucket_15', `3분할(15개씩) 구간 점유수의`);
    updateSection('pattern', 'pattern_corner', 'pattern_corner', `용지 모서리 영역 포함수의`);
}