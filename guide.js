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
    const updateSection = (idPrefix, statKey, distKey, extraText = "") => {
        const container = document.getElementById(`${idPrefix}-stat-container`);
        const tipElem = document.getElementById(`${idPrefix}-tip`);
        const info = getZoneInfo(statKey, stats[statKey], dists[distKey]);

        if (info) {
            // 1. 통계 하이라이트 업데이트 (세이프 존 확률 추가)
            if (container) {
                container.innerHTML = `<div class="stat-highlight">
                    📊 실제 통계 결과: ${extraText}
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
                const originalTip = tipElem.innerHTML.split('(')[0].trim();
                tipElem.innerHTML = `${originalTip} <br><small class="text-safe" style="font-weight:bold;">(권장 세이프 범위: ${info.safe})</small>`;
            }
        }
    };

    // 각 섹션별 데이터 업데이트 실행
    const topSumRange = Object.entries(dists.sum).sort((a, b) => b[1] - a[1])[0][0];
    updateSection('sum', 'sum', 'sum', `역대 가장 많이 출현한 합계 구간은 <strong>"${topSumRange}"</strong> 입니다.`);
    
    updateSection('oe', 'odd_count', 'odd_even', `홀짝 균형은 3:3을 중심으로 강한 중앙 집중 경향을 보입니다.`);
    updateSection('hl', 'low_count', 'high_low', `고저 배합은 저번호와 고번호의 고른 분포가 핵심입니다.`);
    updateSection('carry', 'period_1', 'period_1', `최근 당첨 번호가 다시 출현하는 '이월' 현상은 매우 빈번합니다.`);
    updateSection('special', 'prime', 'prime', `소수, 3배수 등 특수 번호군은 조합의 다양성을 높여줍니다.`);
    updateSection('consecutive', 'consecutive', 'consecutive', `연속된 번호(연번)는 당첨 조합의 약 절반 이상에서 발견됩니다.`);
    updateSection('end-digit', 'same_end', 'same_end', `끝자리가 같은 '동끝수'는 번호 선택의 중요한 패턴입니다.`);
    updateSection('bucket', 'bucket_15', 'bucket_15', `번호가 특정 구간에 쏠리지 않고 적절히 분산되는 것이 유리합니다.`);
    updateSection('pattern', 'pattern_corner', 'pattern_corner', `용지상의 시각적 패턴인 모서리 영역도 유효한 지표입니다.`);
}