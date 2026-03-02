/**
 * Indicator Guide Page - LottoCore v4.3 기반 리팩토링
 */

const TIPS = {
    'sum': `합계 수치는 가장 출현 빈도가 높은 세이프 존 <strong>"{safe}"</strong> 범위를 유지하는 것이 전략적으로 매우 유리합니다.`,
    'odd-even': `홀수 개수는 밸런스가 좋은 <strong>"{safe}"</strong> 범위를 권장하며, 특히 3:3 배합이 가장 강력한 정규분포 중심점입니다.`,
    'high-low': `고번호와 저번호의 배합은 <strong>"{safe}"</strong> 범위 내에서 선택하여 번호가 한쪽으로 쏠리지 않도록 조절하세요.`,
    'period_1': `이월수(직전 1회차 재출현)는 매 회차 <strong>"{safe}"</strong>개 정도 포함되는 것이 통계적으로 가장 흔한 패턴입니다.`,
    'neighbor': `직전 회차 번호의 주변수(±1)인 이웃수는 <strong>"{safe}"</strong>개 포함될 때 당첨 조합의 완성도가 높아집니다.`,
    'period_1_2': `최근 2개 회차의 당첨번호 합집합 중 <strong>"{safe}"</strong>개를 활용하여 최근의 흐름을 반영해 보세요.`,
    'period_1_3': `최근 3개 회차 번호 중 <strong>"{safe}"</strong>개를 선별하여 조합하면 장기적인 출현 흐름을 잡을 수 있습니다.`,
    'consecutive': `연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"{safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.`,
    'prime': `소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"{safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.`,
    'composite': `합성수는 조합의 뼈대를 이루는 수들로, <strong>"{safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.`,
    'multiple-3': `3의 배수는 매 회차 평균 2개 내외로 출현하며, <strong>"{safe}"</strong>개 범위를 지키는 것이 안정적입니다.`,
    'multiple-5': `5의 배수는 출현 빈도가 낮으므로 <strong>"{safe}"</strong>개 정도로 가볍게 포함시키는 전략을 권장합니다.`,
    'square': `제곱수는 특이값이지만 <strong>"{safe}"</strong>개 범위 내에서 변별력을 주는 요소로 활용할 수 있습니다.`,
    'double': `11, 22와 같은 쌍수는 <strong>"{safe}"</strong>개 범위 내에서 조합의 유니크함을 더해주는 지표입니다.`,
    'bucket-15': `전체 번호를 3그룹으로 나눴을 때 <strong>"{safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.`,
    'bucket-9': `5개 구간 분할 시 <strong>"{safe}"</strong>개 구간에서 번호가 고르게 출현하는 조합이 확률이 높습니다.`,
    'bucket-5': `9개 구간 분할 시 <strong>"{safe}"</strong>개 구간을 점유하여 세밀한 분산도를 확보하는 것이 좋습니다.`,
    'bucket-3': `15개 구간 분할 시 <strong>"{safe}"</strong>개 구간에 번호가 퍼져 있어야 당첨 가능 구역을 모두 커버합니다.`,
    'color': `5가지 공 색상 중 <strong>"{safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.`,
    'pattern-corner': `용지의 4개 모서리 영역에서 <strong>"{safe}"</strong>개 정도의 번호가 출현하는 패턴이 매우 빈번합니다.`,
    'pattern-triangle': `용지 중앙의 삼각형 영역에 <strong>"{safe}"</strong>개의 번호를 배치하여 중심부의 밸런스를 잡으세요.`,
    'end-sum': `일의 자리 숫자들의 합계인 끝수합은 <strong>"{safe}"</strong> 범위 내에서 가장 많이 형성됩니다.`,
    'same-end': `동끝수(일의 자리가 같은 번호)는 <strong>"{safe}"</strong>개 포함될 때 당첨 확률이 비약적으로 상승합니다.`,
    'ac': `산술적 복잡도(AC)는 <strong>"{safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.`,
    'span': `가장 큰 수와 작은 수의 차이(Span)는 <strong>"{safe}"</strong> 범위일 때 가장 강력한 당첨 에너지를 가집니다.`,
    'first-num': `조합의 시작인 첫 번째 숫자는 <strong>"{safe}"</strong> 구간 내에서 선택하는 것이 통계적으로 매우 안정적입니다.`,
    'last-num': `조합의 마무리인 마지막 숫자는 <strong>"{safe}"</strong> 구간에 위치할 때 당첨권 진입 확률이 높아집니다.`,
    'mean-gap': `번호들 사이의 평균 간격이 <strong>"{safe}"</strong> 범위에 있어야 번호가 너무 뭉치거나 퍼지지 않은 이상적 밸런스를 갖춥니다.`
};

document.addEventListener('DOMContentLoaded', async function() {
    const data = await LottoDataManager.getStats();
    if (data) updateGuideStats(data);
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

    const getZoneInfo = (stat, dist, cfg) => {
        if (!stat || !dist) return null;
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        let optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        let safeMax = Math.round(stat.mean + 2 * stat.std);

        // [추가] 물리적 최대값(maxLimit) 보정
        if (cfg && cfg.maxLimit) {
            optMax = Math.min(cfg.maxLimit, optMax);
            safeMax = Math.min(cfg.maxLimit, safeMax);
        }

        let optHits = 0; let safeHits = 0;
        Object.entries(dist).forEach(([label, count]) => {
            let val = parseInt(label.split(/[ :\-]/)[0]);
            if (!isNaN(val)) {
                if (val >= optMin && val <= optMax) optHits += count;
                if (val >= safeMin && val <= safeMax) safeHits += count;
            }
        });
        return { optimal: `${optMin}~${optMax}`, safe: `${safeMin}~${safeMax}`, optHits, safeHits };
    };

    // [LottoCore 통합 연동]
    LottoConfig.INDICATORS.forEach(cfg => {
        const container = document.getElementById(`${cfg.id}-stat-container`);
        const tipElem = document.getElementById(`${cfg.id}-tip`);
        const info = getZoneInfo(stats[cfg.statKey], dists[cfg.distKey], cfg);

        if (info) {
            if (container) {
                container.innerHTML = `<div class="stat-highlight">
                    통계적 <span class="text-optimal">옵티멀 존은 "${info.optimal}" ${formatStat(info.optHits, total)}</span>, 
                    <span class="text-safe">세이프 존은 "${info.safe}" ${formatStat(info.safeHits, total)}</span>
                </div>`;
            }
            if (tipElem && TIPS[cfg.id]) {
                const tipText = TIPS[cfg.id].replace(/{safe}/g, info.safe);
                tipElem.innerHTML = `<strong>공략 팁:</strong> ${tipText}`;
            }
        }
    });
}
