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

    const formatStat = (count, total) => {
        const prob = ((count / total) * 100).toFixed(1);
        return `<strong>${prob}%(${count}/${total})</strong>`;
    };

    const getZoneInfo = (key, stat, dist) => {
        if (!stat || !dist) return null;
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        const optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        const safeMax = Math.round(stat.mean + 2 * stat.std);
        let optHits = 0; let safeHits = 0;
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
        return { optimal: `${optMin}~${optMax}`, safe: `${safeMin}~${safeMax}`, optHits, safeHits };
    };

    const updateSection = (idPrefix, statKey, distKey, subLabel = '') => {
        const container = document.getElementById(`${idPrefix}-stat-container`);
        const tipElem = document.getElementById(`${idPrefix}-tip`);
        const info = getZoneInfo(statKey, stats[statKey], dists[distKey]);

        if (info) {
            if (container) {
                container.innerHTML = `<div class="stat-highlight">
                    통계적 <span class="text-optimal">옵티멀 존은 "${info.optimal}" ${formatStat(info.optHits, total)}</span>, 
                    <span class="text-safe">세이프 존은 "${info.safe}" ${formatStat(info.safeHits, total)}</span>
                </div>`;
            }

            if (tipElem) {
                const tips = {
                    'sum': `합계 수치는 가장 출현 빈도가 높은 세이프 존 <strong>"${info.safe}"</strong> 범위를 유지하는 것이 전략적으로 매우 유리합니다.`,
                    'oe': `홀수 개수는 밸런스가 좋은 <strong>"${info.safe}"</strong> 범위를 권장하며, 특히 3:3 배합이 가장 강력한 정규분포 중심점입니다.`,
                    'hl': `고번호와 저번호의 배합은 <strong>"${info.safe}"</strong> 범위 내에서 선택하여 번호가 한쪽으로 쏠리지 않도록 조절하세요.`,
                    'carry': `이월수(직전 1회차 재출현)는 매 회차 <strong>"${info.safe}"</strong>개 정도 포함되는 것이 통계적으로 가장 흔한 패턴입니다.`,
                    'carry-neighbor': `직전 회차 번호의 주변수(±1)인 이웃수는 <strong>"${info.safe}"</strong>개 포함될 때 당첨 조합의 완성도가 높아집니다.`,
                    'carry-2': `최근 2개 회차의 당첨번호 합집합 중 <strong>"${info.safe}"</strong>개를 활용하여 최근의 흐름을 반영해 보세요.`,
                    'carry-3': `최근 3개 회차 번호 중 <strong>"${info.safe}"</strong>개를 선별하여 조합하면 장기적인 출현 흐름을 잡을 수 있습니다.`,
                    'consecutive': `연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"${info.safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.`,
                    'special': `소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"${info.safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.`,
                    'special-composite': `합성수는 조합의 뼈대를 이루는 수들로, <strong>"${info.safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.`,
                    'special-3': `3의 배수는 매 회차 평균 2개 내외로 출현하며, <strong>"${info.safe}"</strong>개 범위를 지키는 것이 안정적입니다.`,
                    'special-5': `5의 배수는 출현 빈도가 낮으므로 <strong>"${info.safe}"</strong>개 정도로 가볍게 포함시키는 전략을 권장합니다.`,
                    'special-square': `제곱수는 특이값이지만 <strong>"${info.safe}"</strong>개 범위 내에서 변별력을 주는 요소로 활용할 수 있습니다.`,
                    'special-double': `11, 22와 같은 쌍수는 <strong>"${info.safe}"</strong>개 범위 내에서 조합의 유니크함을 더해주는 지표입니다.`,
                    'bucket-15': `전체 번호를 3그룹으로 나눴을 때 <strong>"${info.safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.`,
                    'bucket-9': `5개 구간 분할 시 <strong>"${info.safe}"</strong>개 구간에서 번호가 고르게 출현하는 조합이 확률이 높습니다.`,
                    'bucket-5': `9개 구간 분할 시 <strong>"${info.safe}"</strong>개 구간을 점유하여 세밀한 분산도를 확보하는 것이 좋습니다.`,
                    'bucket-3': `15개 구간 분할 시 <strong>"${info.safe}"</strong>개 구간에 번호가 퍼져 있어야 당첨 가능 구역을 모두 커버합니다.`,
                    'pattern-color': `5가지 공 색상 중 <strong>"${info.safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.`,
                    'pattern': `용지의 4개 모서리 영역에서 <strong>"${info.safe}"</strong>개 정도의 번호가 출현하는 패턴이 매우 빈번합니다.`,
                    'pattern-triangle': `용지 중앙의 삼각형 영역에 <strong>"${info.safe}"</strong>개의 번호를 배치하여 중심부의 밸런스를 잡으세요.`,
                    'pattern-endsum': `일의 자리 숫자들의 합계인 끝수합은 <strong>"${info.safe}"</strong> 범위 내에서 가장 많이 형성됩니다.`,
                    'end-digit': `동끝수(일의 자리가 같은 번호)는 <strong>"${info.safe}"</strong>개 포함될 때 당첨 확률이 비약적으로 상승합니다.`,
                    'pattern-ac': `산술적 복잡도(AC)는 <strong>"${info.safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.`,
                    'pattern-span': `가장 큰 수와 작은 수의 차이(Span)는 <strong>"${info.safe}"</strong> 범위일 때 가장 강력한 당첨 에너지를 가집니다.`
                };
                tipElem.innerHTML = `<strong>공략 팁:</strong> ${tips[idPrefix] || '해당 지표의 권장 범위를 유지하세요.'}`;
            }
        }
    };

    updateSection('sum', 'sum', 'sum');
    updateSection('oe', 'odd_count', 'odd_even');
    updateSection('hl', 'low_count', 'high_low');
    updateSection('carry', 'period_1', 'period_1');
    updateSection('carry-neighbor', 'neighbor', 'neighbor');
    updateSection('carry-2', 'period_1_2', 'period_1_2');
    updateSection('carry-3', 'period_1_3', 'period_1_3');
    updateSection('consecutive', 'consecutive', 'consecutive');
    updateSection('special', 'prime', 'prime');
    updateSection('special-composite', 'composite', 'composite');
    updateSection('special-3', 'multiple_3', 'multiple_3');
    updateSection('special-5', 'multiple_5', 'multiple_5');
    updateSection('special-square', 'square', 'square');
    updateSection('special-double', 'double_num', 'double_num');
    updateSection('bucket-15', 'bucket_15', 'bucket_15');
    updateSection('bucket-9', 'bucket_9', 'bucket_9');
    updateSection('bucket-5', 'bucket_5', 'bucket_5');
    updateSection('bucket-3', 'bucket_3', 'bucket_3');
    updateSection('pattern-color', 'color', 'color');
    updateSection('pattern', 'pattern_corner', 'pattern_corner');
    updateSection('pattern-triangle', 'pattern_triangle', 'pattern_triangle');
    updateSection('pattern-endsum', 'end_sum', 'end_sum');
    updateSection('end-digit', 'same_end', 'same_end');
    updateSection('pattern-ac', 'ac', 'ac');
    updateSection('pattern-span', 'span', 'span');
}