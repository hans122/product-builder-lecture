'use strict';

/**
 * LottoIndicators v1.2 - GL/GP 명칭 체계 통합 적용 (v10.0+)
 */

const LottoConfig = {
    // 1. [GL] 로또 6/45 개별 지표 설정
    INDICATORS: [
        { id: 'sum', label: '총합', unit: '', group: 'GL1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
        { id: 'odd-even', label: '홀짝 비율', unit: '', group: 'GL1', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'odd_even', maxLimit: 6, calc: (nums) => nums.filter(n => n % 2 !== 0).length },
        { id: 'high-low', label: '고저 비율', unit: '', group: 'GL1', distKey: 'high_low', statKey: 'low_count', drawKey: 'high_low', maxLimit: 6, calc: (nums) => nums.filter(n => n <= 22).length },
        { id: 'period_1', label: '직전 1회차 매칭', unit: '개', group: 'GL2', distKey: 'period_1', statKey: 'period_1', drawKey: 'period_1', maxLimit: 6, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : 0 },
        { id: 'neighbor', label: '이웃수', unit: '개', group: 'GL2', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'neighbor', maxLimit: 12, calc: (nums, data) => {
            if (!data || !data.last_3_draws || !data.last_3_draws[0]) return 0;
            const neighbors = new Set();
            data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
            return nums.filter(n => neighbors.has(n)).length;
        }},
        { id: 'period_1_2', label: '1~2회전 윈도우', unit: '개', group: 'GL2', distKey: 'period_1_2', statKey: 'period_1_2', drawKey: 'period_1_2', maxLimit: 12, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length : 0 },
        { id: 'period_1_3', label: '1~3회전 윈도우', unit: '개', group: 'GL2', distKey: 'period_1_3', statKey: 'period_1_3', drawKey: 'period_1_3', maxLimit: 18, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[]), ...(data.last_3_draws[2]||[])]).has(n)).length : 0 },
        { id: 'consecutive', label: '연속번호 쌍', unit: '쌍', group: 'GL2', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'consecutive', maxLimit: 5, calc: (nums) => {
            let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++; return cnt;
        }},
        { id: 'prime', label: '소수 포함', unit: '개', group: 'GL3', distKey: 'prime', statKey: 'prime', drawKey: 'prime', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isPrime).length },
        { id: 'composite', label: '합성수 포함', unit: '개', group: 'GL3', distKey: 'composite', statKey: 'composite', drawKey: 'composite', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isComposite).length },
        { id: 'multiple-3', label: '3배수 포함', unit: '개', group: 'GL3', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'multiple_3', maxLimit: 6, calc: (nums) => nums.filter(n => n % 3 === 0).length },
        { id: 'multiple-5', label: '5배수 포함', unit: '개', group: 'GL3', distKey: 'multiple_5', statKey: 'multiple_5', drawKey: 'm5', maxLimit: 6, calc: (nums) => nums.filter(n => n % 5 === 0).length },
        { id: 'square', label: '제곱수 포함', unit: '개', group: 'GL3', distKey: 'square', statKey: 'square', drawKey: 'square', maxLimit: 6, calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length },
        { id: 'double', label: '쌍수 포함', unit: '개', group: 'GL3', distKey: 'double_num', statKey: 'double_num', drawKey: 'double', maxLimit: 4, calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length },
        { id: 'bucket-15', label: '3분할 점유', unit: '구간', group: 'GL4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', maxLimit: 3, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size },
        { id: 'bucket-9', label: '5분할 점유', unit: '구간', group: 'GL4', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9', maxLimit: 5, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size },
        { id: 'bucket-5', label: '9분할 점유', unit: '구간', group: 'GL4', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5', maxLimit: 6, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size },
        { id: 'bucket-3', label: '15분할 점유', unit: '구간', group: 'GL4', distKey: 'bucket_3', statKey: 'bucket_3', drawKey: 'b3', maxLimit: 6, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size },
        { id: 'color', label: '포함 색상수', unit: '색상', group: 'GL4', distKey: 'color', statKey: 'color', drawKey: 'color', maxLimit: 5, calc: (nums) => new Set(nums.map(LottoUtils.getBallColorClass)).size },
        { id: 'pattern-corner', label: '모서리 패턴', unit: '개', group: 'GL4', distKey: 'pattern_corner', statKey: 'pattern_corner', drawKey: 'p_corner', maxLimit: 6, calc: (nums) => {
            const corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42];
            return nums.filter(n => corners.includes(n)).length;
        }},
        { id: 'pattern-triangle', label: '삼각형 패턴', unit: '개', group: 'GL4', distKey: 'pattern_triangle', statKey: 'pattern_triangle', drawKey: 'p_tri', maxLimit: 6, calc: (nums) => {
            const triangle = [4,10,11,12,16,17,18,19,20,24,25,26,32];
            return nums.filter(n => triangle.includes(n)).length;
        }},
        { id: 'end-sum', label: '끝수합', unit: '', group: 'GL5', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'end_sum', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0) },
        { id: 'same-end', label: '동끝수', unit: '개', group: 'GL5', distKey: 'same_end', statKey: 'same_end', drawKey: 'same_end', maxLimit: 6, calc: (nums) => {
            const ends = nums.map(n => n % 10);
            const counts = ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {});
            return Math.max(...Object.values(counts));
        }},
        { id: 'ac', label: 'AC값', unit: '', group: 'GL5', distKey: 'ac', statKey: 'ac', drawKey: 'ac', maxLimit: 10, calc: (nums) => LottoUtils.calculateAC(nums) },
        { id: 'span', label: 'Span(간격)', unit: '', group: 'GL5', distKey: 'span', statKey: 'span', drawKey: 'span', maxLimit: 44, calc: (nums) => nums[nums.length-1] - nums[0] },
        { id: 'first-num', label: '첫 수 범위', unit: '', group: 'GL6', distKey: 'first_num', statKey: 'first_num', drawKey: 'first_num', maxLimit: 40, calc: (nums) => nums[0] },
        { id: 'last-num', label: '끝 수 범위', unit: '', group: 'GL6', distKey: 'last_num', statKey: 'last_num', drawKey: 'last_num', maxLimit: 45, calc: (nums) => nums[nums.length-1] },
        { id: 'mean-gap', label: '평균 간격', unit: '', group: 'GL6', distKey: 'mean_gap', statKey: 'mean_gap', drawKey: 'mean_gap', maxLimit: 8.8, calc: (nums) => LottoUtils.round((nums[nums.length-1] - nums[0]) / 5, 1) },

        // 1.1. [GP] 연금 720+ 개별 지표 설정
        { id: 'p-pos-freq', label: '자리수별 빈도', group: 'GP1', calc: () => {} },
        { id: 'p-sequence', label: '연속 번호 패턴', group: 'GP2', calc: () => {} },
        { id: 'p-repeat', label: '연속 반복 패턴', group: 'GP2', calc: () => {} },
        { id: 'p-group', label: '조별 당첨 분포', group: 'GP3', calc: () => {} },
        { id: 'p-sum', label: '6자리 합계 점수', group: 'GP4', calc: () => {} },
        { id: 'p-carry', label: '자리 이월 및 이웃수', group: 'GP5', calc: () => {} },
        { id: 'p-balance', label: '세부 균형(홀짝/고저/소수)', group: 'GP6', calc: () => {} },
        { id: 'p-flow', label: '당첨 번호 흐름', group: 'GP13', calc: () => {} }
    ],

    // 2. [GL0] 로또 시너지 검증 규칙
    SYNERGY_RULES: [
        {
            id: 'syn-ls-high',
            label: '[GL0] 저번호-총합 부조화',
            status: 'danger',
            check: (v, s) => {
                const isHighLowDanger = v['high-low'] >= (s.low_count ? Math.round(s.low_count.mean + s.low_count.std) : 5);
                const isSumDanger = v['sum'] > (s.sum ? s.sum.mean + s.sum.std : 130);
                return isHighLowDanger && isSumDanger;
            },
            desc: '저번호 비중이 높음에도 총합이 과도하게 높은 데이터 부조화입니다. 실전 당첨 확률이 희박한 패턴입니다.'
        },
        {
            id: 'syn-ls-low',
            label: '[GL0] 고번호-총합 부조화',
            status: 'danger',
            check: (v, s) => {
                const isHighLowDanger = v['high-low'] <= (s.low_count ? Math.round(s.low_count.mean - s.low_count.std) : 1);
                const isSumDanger = v['sum'] < (s.sum ? s.sum.mean - s.sum.std : 140);
                return isHighLowDanger && isSumDanger;
            },
            desc: '고번호 비중이 높음에도 총합이 과도하게 낮은 부조화 조합입니다.'
        },
        {
            id: 'syn-ac-consec',
            label: '[GL0] 복잡도 임계점 위반',
            status: 'danger',
            check: (v, s) => {
                const isHighAC = v['ac'] >= 10;
                const isHighConsec = v['consecutive'] >= 2;
                return isHighAC && isHighConsec;
            },
            desc: 'AC값과 연속번호가 동시에 최대치에 도달한 극히 인위적인 조합입니다.'
        },
        {
            id: 'syn-span-gap',
            label: '[GL0] 분산도 정합성 오류',
            status: 'safe',
            check: (v, s) => {
                const isWideSpan = v['span'] > (s.span ? s.span.mean + s.span.std : 40);
                const isNarrowGap = v['mean-gap'] < (s.mean_gap ? s.mean_gap.mean - s.mean_gap.std : 7);
                return isWideSpan && isNarrowGap;
            },
            desc: '전체 범위 대비 번호 간 간격이 너무 좁아 특정 구역 뭉침이 의심되는 패턴입니다.'
        }
    ],

    // 3. [GP0] 연금복권 시너지 검증 규칙
    PENSION_SYNERGY_RULES: [
        {
            id: 'p-syn-sum-repeat',
            label: '[GP0] 수치-반복 부조화',
            status: 'warning',
            check: (digits) => {
                const sum = digits.reduce((a, b) => a + b, 0);
                const counts = {};
                digits.forEach(n => counts[n] = (counts[n] || 0) + 1);
                const maxOccur = Math.max(...Object.values(counts));
                return maxOccur >= 3 && (sum < 15 || sum > 40);
            },
            desc: '특정 숫자 반복과 전체 합계가 통계적 범위를 벗어난 인위적 패턴입니다.'
        },
        {
            id: 'p-syn-parity-skew',
            label: '[GP0] 자리수 홀짝 편중',
            status: 'warning',
            check: (digits) => {
                const firstHalf = digits.slice(0, 3).filter(n => n % 2 === 0).length;
                const secondHalf = digits.slice(3, 6).filter(n => n % 2 === 0).length;
                return (firstHalf === 3 && secondHalf === 0) || (firstHalf === 0 && secondHalf === 3);
            },
            desc: '앞/뒤 자리의 홀짝 밸런스가 극단적으로 갈리는 배치 패턴입니다.'
        }
    ],

    PAGES: {
        INDEX: ['sum', 'odd-even', 'high-low', 'period_1', 'neighbor', 'ac'],
        ANALYSIS: ['sum', 'odd-even', 'high-low', 'period_1', 'neighbor', 'period_1_2', 'period_1_3', 'consecutive', 'prime', 'composite', 'multiple-3', 'multiple-5', 'square', 'double', 'bucket-15', 'bucket-9', 'bucket-5', 'bucket-3', 'color', 'pattern-corner', 'pattern-triangle', 'end-sum', 'same-end', 'ac', 'span', 'first-num', 'last-num', 'mean-gap']
    },

    /** 5. 가이드 팁 및 그룹 명칭 (SSOT) */
    GROUP_NAMES: {
        'GL1': '기본 균형 및 합계', 'GL2': '회차 상관관계 (이월/연속)', 'GL3': '특수 번호군 분석',
        'GL4': '구간 및 패턴 분석', 'GL5': '끝수 및 전문지표', 'GL6': '고급 필터링 지표',
        'GP1': '자리수별 독립 빈도', 'GP2': '배열 패턴 및 구성 분석', 'GP3': '조별 당첨 분포',
        'GP4': '수치 균형', 'GP5': '회차 간 상관관계', 'GP6': '세부 균형 분석', 'GP13': '당첨 번호 흐름'
    },

    LOTTO_TIPS: {
        'sum': '합계 수치는 가장 출현 빈도가 높은 세이프 존 <strong>"{safe}"</strong> 범위를 유지하는 것이 전략적으로 유리합니다.',
        'odd-even': '홀수 개수는 밸런스가 좋은 <strong>"{safe}"</strong> 범위를 권장하며, 특히 3:3 배합이 가장 강력한 정규분포 중심점입니다.',
        'high-low': '고번호와 저번호의 배합은 <strong>"{safe}"</strong> 범위 내에서 선택하여 번호가 한쪽으로 쏠리지 않도록 조절하세요.',
        'period_1': '이월수(직전 1회차 재출현)는 매 회차 <strong>"{safe}"</strong>개 정도 포함되는 것이 통계적으로 가장 흔한 패턴입니다.',
        'neighbor': '직전 회차 번호의 주변수(±1)인 이웃수는 <strong>"{safe}"</strong>개 포함될 때 당첨 조합의 완성도가 높아집니다.',
        'period_1_2': '최근 2개 회차의 당첨번호 합집합 중 <strong>"{safe}"</strong>개를 활용하여 최근의 흐름을 반영해 보세요.',
        'period_1_3': '최근 3개 회차 번호 중 <strong>"{safe}"</strong>개를 선별하여 조합하면 장기적인 출현 흐름을 잡을 수 있습니다.',
        'consecutive': '연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"{safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.',
        'prime': '소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"{safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.',
        'composite': '합성수는 조합의 뼈대를 이루는 수들로, <strong>"{safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.',
        'multiple-3': '3의 배수는 매 회차 평균 2개 내외로 출현하며, <strong>"{safe}"</strong>개 범위를 지키는 것이 안정적입니다.',
        'multiple-5': '5의 배수는 출현 빈도가 낮으므로 <strong>"{safe}"</strong>개 정도로 가볍게 포함시키는 전략을 권장합니다.',
        'square': '제곱수는 특이값이지만 <strong>"{safe}"</strong>개 범위 내에서 변별력을 주는 요소로 활용할 수 있습니다.',
        'double': '11, 22와 같은 쌍수는 <strong>"{safe}"</strong>개 범위 내에서 조합의 유니크함을 더해주는 지표입니다.',
        'bucket-15': '전체 번호를 3그룹으로 나눴을 때 <strong>"{safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.',
        'bucket-9': '5개 구간 분할 시 <strong>"{safe}"</strong>개 구간에서 번호가 고르게 출현하는 조합이 확률이 높습니다.',
        'bucket-5': '9개 구간 분할 시 <strong>"{safe}"</strong>개 구간을 점유하여 세밀한 분산도를 확보하는 것이 좋습니다.',
        'bucket-3': '15개 구간 분할 시 <strong>"{safe}"</strong>개 구간에 번호가 퍼져 있어야 당첨 가능 구역을 모두 커버합니다.',
        'color': '5가지 공 색상 중 <strong>"{safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.',
        'pattern-corner': '용지의 4개 모서리 영역에서 <strong>"{safe}"</strong>개 정도의 번호가 출현하는 패턴이 매우 빈번합니다.',
        'pattern-triangle': '용지 중앙의 삼각형 영역에 <strong>"{safe}"</strong>개의 번호를 배치하여 중심부의 밸런스를 잡으세요.',
        'end-sum': '일의 자리 숫자들의 합계인 끝수합은 <strong>"{safe}"</strong> 범위 내에서 가장 많이 형성됩니다.',
        'same-end': '동끝수(일의 자리가 같은 번호)는 <strong>"{safe}"</strong>개 포함될 때 당첨 확률이 비약적으로 상승합니다.',
        'ac': '산술적 복잡도(AC)는 <strong>"{safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.',
        'span': '가장 큰 수와 작은 수의 차이(Span)는 <strong>"{safe}"</strong> 범위일 때 가장 강력한 당첨 에너지를 가집니다.',
        'first-num': '조합의 시작인 첫 번째 숫자는 <strong>"{safe}"</strong> 구간 내에서 선택하는 것이 통계적으로 매우 안정적입니다.',
        'last-num': '조합의 마무리인 마지막 숫자는 <strong>"{safe}"</strong> 구간에 위치할 때 당첨권 진입 확률이 높아집니다.',
        'mean-gap': '번호들 사이의 평균 간격이 <strong>"{safe}"</strong> 범위에 있어야 번호가 너무 뭉치거나 퍼지지 않은 이상적 밸런스를 갖춥니다.'
    },

    PENSION_TIPS: {
        'p-pos-freq': '각 자리마다 0~9까지 확률은 동일하지만, 실제 흐름에서는 특정 숫자가 반복되거나 정체되는 현상이 발생합니다.',
        'p-sequence': '번호가 1씩 차이나며 이어지는 흐름(123 등)을 관찰하여 너무 인위적인 나열을 피하세요.',
        'p-repeat': '동일 숫자가 바로 옆에 붙어서 출현하는 패턴입니다. 트리플(777) 등은 매우 희귀합니다.',
        'p-group': '연금복권의 첫 단추인 조를 선택할 때, 확률 회귀 원칙에 따라 미출현 조를 공략해 보세요.',
        'p-sum': '조를 제외한 6자리 합계가 20~34 사이인 골든 존이 당첨 확률이 가장 높습니다.',
        'p-carry': '전회차 숫자가 같은 자리에 그대로 나오는 이월 확률을 반영하여 흐름을 잡으세요.',
        'p-balance': '홀짝 및 고저 비율이 3:3으로 균형 잡힌 조합이 통계적으로 가장 우세합니다.',
        'p-flow': '최근 15회차의 번호 이동을 타임라인으로 확인하여 공백 구역을 선별하세요.'
    }
};
