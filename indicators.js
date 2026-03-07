'use strict';

/**
 * LottoIndicators v20.0 - Full Automation Edition
 * - Single Source of Truth for all UI and Logic
 * - Added Visibility Policies and Recommendation Filters
 */

window.LottoConfig = {
    // 1. [GL] 로또 6/45 개별 지표 설정
    INDICATORS: [
        { id: 'sum', label: '총합', unit: '', group: 'GL1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0), visible: { history: true, analysis: true }, filter: { zLimit: 2.0 } },
        { id: 'odd-even', label: '홀짝', unit: '', group: 'GL1', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'oe', maxLimit: 6, calc: (nums) => nums.filter(n => n % 2 !== 0).length, visible: { history: true, analysis: true }, filter: { min: 2, max: 4 } },
        { id: 'high-low', label: '고저', unit: '', group: 'GL1', distKey: 'high_low', statKey: 'low_count', drawKey: 'hl', maxLimit: 6, calc: (nums) => nums.filter(n => n <= 22).length, visible: { history: true, analysis: true }, filter: { min: 2, max: 4 } },
        { id: 'period_1', label: '이월', unit: '개', group: 'GL2', distKey: 'period_1', statKey: 'period_1', drawKey: 'p1', maxLimit: 6, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : 0, visible: { history: true, analysis: true } },
        { id: 'neighbor', label: '이웃', unit: '개', group: 'GL2', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'nb', maxLimit: 12, calc: (nums, data) => {
            if (!data || !data.last_3_draws || !data.last_3_draws[0]) return 0;
            const neighbors = new Set();
            data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
            return nums.filter(n => neighbors.has(n)).length;
        }, visible: { history: true, analysis: true } },
        { id: 'period_1_2', label: '2회전', unit: '개', group: 'GL2', distKey: 'period_1_2', statKey: 'period_1_2', drawKey: 'p12', maxLimit: 12, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length : 0, visible: { analysis: true } },
        { id: 'consecutive', label: '연속', unit: '쌍', group: 'GL2', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'seq', maxLimit: 5, calc: (nums) => {
            let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++; return cnt;
        }, visible: { history: true, analysis: true } },
        { id: 'prime', label: '소수', unit: '개', group: 'GL3', distKey: 'prime', statKey: 'prime', drawKey: 'pm', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isPrime).length, visible: { history: true, analysis: true } },
        { id: 'composite', label: '합성수', unit: '개', group: 'GL3', distKey: 'composite', statKey: 'composite', drawKey: 'cp', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isComposite).length, visible: { history: true, analysis: true } },
        { id: 'multiple-3', label: '3배수', unit: '개', group: 'GL3', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'm3', maxLimit: 6, calc: (nums) => nums.filter(n => n % 3 === 0).length, visible: { analysis: true } },
        { id: 'bucket-15', label: '3분할', unit: '구간', group: 'GL4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', maxLimit: 3, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size, visible: { history: true, analysis: true } },
        { id: 'color', label: '색상수', unit: '색상', group: 'GL4', distKey: 'color', statKey: 'color', drawKey: 'clr', maxLimit: 5, calc: (nums) => new Set(nums.map(LottoUtils.getBallColorClass)).size, visible: { history: true, analysis: true } },
        { id: 'end-sum', label: '끝수합', unit: '', group: 'GL5', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'es', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0), visible: { history: true, analysis: true } },
        { id: 'ac', label: 'AC', unit: '', group: 'GL5', distKey: 'ac', statKey: 'ac', drawKey: 'ac', maxLimit: 10, calc: (nums) => LottoUtils.calculateAC(nums), visible: { history: true, analysis: true }, filter: { min: 7 } },
        { id: 'mean-gap', label: '간격', unit: '', group: 'GL6', distKey: 'mean_gap', statKey: 'mean_gap', drawKey: 'gap', calc: (nums) => {
            var s = [...nums].sort((a,b)=>a-b); var g = []; for(var i=0; i<5; i++) g.push(s[i+1]-s[i]);
            return LottoUtils.round(g.reduce((a,b)=>a+b,0)/5, 1);
        }, visible: { history: true, analysis: true }, filter: { min: 4, max: 11 } }
    ],

    // 1-2. [GP] 연금복권 720+ 개별 지표 설정
    PENSION_INDICATORS: [
        { id: 'p-sum', label: '합계', unit: '', group: 'GP4', distKey: 'sum', statKey: 'sum', calc: (nums) => PensionUtils.analyzeBalance(nums).sum, visible: { history: true, analysis: true }, filter: { min: 20, max: 35 } },
        { id: 'p-odd', label: '홀수', unit: '개', group: 'GP7', distKey: 'odd', statKey: 'odd', calc: (nums) => PensionUtils.analyzeBalance(nums).odd, visible: { history: true, analysis: true }, filter: { min: 2, max: 4 } },
        { id: 'p-low', label: '저번호', unit: '개', group: 'GP7', distKey: 'low', statKey: 'low', calc: (nums) => PensionUtils.analyzeBalance(nums).low, visible: { history: true, analysis: true } },
        { id: 'p-prime', label: '소수', unit: '개', group: 'GP7', distKey: 'prime', statKey: 'prime', calc: (nums) => PensionUtils.analyzeBalance(nums).prime, visible: { history: true, analysis: true } },
        { id: 'p-seq', label: '연속', unit: '쌍', group: 'GP1', distKey: 'sequence', statKey: 'sequence', calc: (nums) => PensionUtils.analyzePatterns(nums).seq, visible: { history: true, analysis: true } },
        { id: 'p-max-occur', label: '중복', unit: '개', group: 'GP2', distKey: 'occurrence', statKey: 'maxOccur', calc: (nums) => PensionUtils.analyzePatterns(nums).maxOccur, visible: { history: true, analysis: true } },
        { id: 'p-carry', label: '이월', unit: '개', group: 'GP5', distKey: 'carry', statKey: 'carry', calc: (nums, data) => (data && data.last_draw) ? PensionUtils.analyzeDynamics(nums, data.last_draw).carry : 0, visible: { history: true, analysis: true } },
        { id: 'p-neighbor', label: '이웃', unit: '개', group: 'GP5', distKey: 'neighbor', statKey: 'neighbor', calc: (nums, data) => (data && data.last_draw) ? PensionUtils.analyzeDynamics(nums, data.last_draw).neighbor : 0, visible: { history: true, analysis: true } }
    ],

    // 2. [GL] 시너지 규칙 설정 (복합 지표)
    SYNERGY_RULES: [
        {
            id: 'syn-low-sum',
            label: '총합-저번호 불균형',
            status: 'danger',
            check: (v, s) => v['sum'] < 100 && v['high-low'] > 4,
            desc: '총합이 낮으면서 저번호에 극단적으로 쏠린 조합입니다.'
        }
    ],

    PAGES: {
        INDEX: ['sum', 'odd-even', 'high-low', 'period_1', 'neighbor', 'ac'],
        ANALYSIS: ['sum', 'odd-even', 'high-low', 'period_1', 'neighbor', 'consecutive', 'prime', 'composite', 'bucket-15', 'color', 'end-sum', 'ac', 'mean-gap']
    },

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
        'consecutive': '연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"{safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.',
        'prime': '소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"{safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.',
        'composite': '합성수는 조합의 뼈대를 이루는 수들로, <strong>"{safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.',
        'bucket-15': '전체 번호를 3그룹으로 나눴을 때 <strong>"{safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.',
        'color': '5가지 공 색상 중 <strong>"{safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.',
        'end-sum': '일의 자리 숫자들의 합계인 끝수합은 <strong>"{safe}"</strong> 범위 내에서 가장 많이 형성됩니다.',
        'ac': '산술적 복잡도(AC)는 <strong>"{safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.',
        'mean-gap': '번호들 사이의 평균 간격이 <strong>"{safe}"</strong> 범위에 있어야 번호가 너무 뭉치거나 퍼지지 않은 이상적 밸런스를 갖춥니다.',
        'ai-markov': '마르코프 체인은 이전 당첨 번호가 다음 번호에 미치는 영향을 분석하여 유력한 전이 경로를 제시합니다.',
        'ai-monte': '1만 회 이상의 가상 시뮬레이션을 통해 사용자 조합의 통계적 우위를 정밀하게 산출합니다.'
    },

    PENSION_TIPS: {
        'p-pos-freq': '각 자리마다 0~9까지 확률은 동일하지만, 실제 흐름에서는 특정 숫자가 반복되거나 정체되는 현상이 발생합니다.',
        'p-sequence': '번호가 1씩 차이나며 이어지는 흐름(123 등)을 관찰하여 너무 인위적인 나열을 피하세요.',
        'p-repeat': '동일 숫자가 바로 옆에 붙어서 출현하는 패턴입니다. 트리플(777) 등은 매우 희귀합니다.',
        'p-group': '연금복권의 첫 단추인 조를 선택할 때, 확률 회귀 원칙에 따라 미출현 조를 공략해 보세요.',
        'p-sum': '조를 제외한 6자리 합계가 20~34 사이인 골든 존이 당첨 확률이 가장 높습니다.',
        'p-carry': '전회차 숫자가 같은 자리에 그대로 나오는 이월 확률을 반영하여 흐름을 잡으세요.',
        'p-balance': '홀짝 및 고저 비율이 3:3으로 균형 잡힌 조합이 통계적으로 가장 우세합니다.',
        'p-flow': '최근 15회차의 번호 이동을 타임라인으로 확인하여 공백 구역을 선별하세요.',
        'p-markov': '역방향 전이 확률을 분석하여 하위 등급 당첨의 핵심인 일/십의 자리 유력 숫자를 예측합니다.',
        'p-monte': '시뮬레이션을 통해 연금복권 특유의 자리수별 매칭 확률을 기댓값으로 환산합니다.'
    }
};
