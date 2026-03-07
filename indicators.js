'use strict';

/**
 * LottoIndicators v22.0 - AI Regression Timing Edition
 * - Integrated AI Regression Timing & Energy Signals
 * - Full Number Frequency Visualization Support
 */

window.LottoConfig = {
    INDICATORS: [
        // [GL1] 기본 밸런스
        { id: 'sum', label: '총합', unit: '', group: 'GL1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0), visible: { history: true, analysis: true, combination: true }, filter: { zLimit: 2.0 } },
        { id: 'odd-even', label: '홀짝', unit: '', group: 'GL1', distKey: 'odd_count', statKey: 'odd_count', drawKey: 'oe', maxLimit: 6, calc: (nums) => nums.filter(n => n % 2 !== 0).length, visible: { history: true, analysis: true, combination: true }, filter: { min: 2, max: 4 } },
        { id: 'high-low', label: '고저', unit: '', group: 'GL1', distKey: 'low_count', statKey: 'low_count', drawKey: 'hl', maxLimit: 6, calc: (nums) => nums.filter(n => n <= 22).length, visible: { history: true, analysis: true, combination: true }, filter: { min: 2, max: 4 } },

        // [GL2] 관계 및 주기
        { id: 'period_1', label: '1회기(이월)', unit: '개', group: 'GL2', distKey: 'period_1', statKey: 'period_1', drawKey: 'p1', maxLimit: 6, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[0]) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : 0, visible: { history: true, analysis: true, combination: true } },
        { id: 'period_2', label: '2회기 매칭', unit: '개', group: 'GL2', distKey: 'period_2', statKey: 'period_2', drawKey: 'p2', maxLimit: 6, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[1]) ? nums.filter(n => new Set(data.last_3_draws[1]).has(n)).length : 0, visible: { history: true, analysis: true } },
        { id: 'period_3', label: '3회기 매칭', unit: '개', group: 'GL2', distKey: 'period_3', statKey: 'period_3', drawKey: 'p3', maxLimit: 6, calc: (nums, data) => (data && data.last_3_draws && data.last_3_draws[2]) ? nums.filter(n => new Set(data.last_3_draws[2]).has(n)).length : 0, visible: { history: true, analysis: true } },
        { id: 'neighbor', label: '이웃수', unit: '개', group: 'GL2', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'nb', maxLimit: 12, calc: (nums, data) => {
            if (!data || !data.last_3_draws || !data.last_3_draws[0]) return 0;
            const neighbors = new Set();
            data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
            return nums.filter(n => neighbors.has(n)).length;
        }, visible: { history: true, analysis: true, combination: true } },
        { id: 'consecutive', label: '연속쌍', unit: '쌍', group: 'GL2', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'seq', maxLimit: 5, calc: (nums) => {
            let cnt = 0; let s = [...nums].sort((a,b)=>a-b); for (let i=0; i<5; i++) if(s[i]+1 === s[i+1]) cnt++; return cnt;
        }, visible: { history: true, analysis: true, combination: true } },

        // [GL3] 수적 속성
        { id: 'prime', label: '소수', unit: '개', group: 'GL3', distKey: 'prime', statKey: 'prime', drawKey: 'pm', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isPrime).length, visible: { history: true, analysis: true, combination: true } },
        { id: 'composite', label: '합성수', unit: '개', group: 'GL3', distKey: 'composite', statKey: 'composite', drawKey: 'cp', maxLimit: 6, calc: (nums) => nums.filter(LottoUtils.isComposite).length, visible: { history: true, analysis: true, combination: true } },
        { id: 'multiple-3', label: '3배수', unit: '개', group: 'GL3', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'm3', maxLimit: 6, calc: (nums) => nums.filter(n => n % 3 === 0).length, visible: { history: true, analysis: true } },
        { id: 'multiple-4', label: '4배수', unit: '개', group: 'GL3', distKey: 'multiple_4', statKey: 'multiple_4', drawKey: 'm4', maxLimit: 6, calc: (nums) => nums.filter(n => n % 4 === 0).length, visible: { history: true, analysis: true } },
        { id: 'square', label: '제곱수', unit: '개', group: 'GL3', distKey: 'square', statKey: 'square', drawKey: 'sq', maxLimit: 6, calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length, visible: { history: true, analysis: true } },
        { id: 'double', label: '쌍수', unit: '개', group: 'GL3', distKey: 'double_num', statKey: 'double_num', drawKey: 'db', maxLimit: 4, calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length, visible: { history: true, analysis: true } },
        { id: 'mirror', label: '동형수', unit: '개', group: 'GL3', distKey: 'mirror', statKey: 'mirror', drawKey: 'mr', maxLimit: 6, calc: (nums) => {
            const mirrors = [12,21,13,31,14,41,23,32,24,42,34,43];
            return nums.filter(n => mirrors.includes(n)).length;
        }, visible: { history: true, analysis: true } },

        // [GL4] 분할 및 구간
        { id: 'bucket-15', label: '3분할', unit: '구간', group: 'GL4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', maxLimit: 3, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size, visible: { history: true, analysis: true, combination: true } },
        { id: 'bucket-9', label: '5분할', unit: '구간', group: 'GL4', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9', maxLimit: 5, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size, visible: { history: true, analysis: true, combination: true } },
        { id: 'bucket-7', label: '7분법', unit: '구간', group: 'GL4', distKey: 'bucket_7', statKey: 'bucket_7', drawKey: 'b7', maxLimit: 7, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/7))).size, visible: { history: true, analysis: true } },
        { id: 'bucket-5', label: '9분할', unit: '구간', group: 'GL4', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5', maxLimit: 6, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size, visible: { history: true, analysis: true, combination: true } },
        { id: 'p궁도', label: '9궁도', unit: '구역', group: 'GL4', distKey: 'p9', statKey: 'p9', drawKey: 'p9', maxLimit: 9, calc: (nums) => new Set(nums.map(n => (n-1)%9)).size, visible: { history: true, analysis: true } },
        { id: 'empty-zone', label: '멸구간', unit: '개', group: 'GL4', distKey: 'empty_zone', statKey: 'empty_zone', drawKey: 'ez', maxLimit: 5, calc: (nums) => {
            const zones = [0,0,0,0,0]; nums.forEach(n => zones[Math.floor((n-1)/10)]++);
            return zones.filter(z => z === 0).length;
        }, visible: { history: true, analysis: true } },
        { id: 'color', label: '색상수', unit: '색상', group: 'GL4', distKey: 'color', statKey: 'color', drawKey: 'clr', maxLimit: 5, calc: (nums) => new Set(nums.map(LottoUtils.getBallColorClass)).size, visible: { history: true, analysis: true, combination: true } },

        // [GL4-P] 시각적 패턴
        { id: 'pattern-corner', label: '모서리', unit: '개', group: 'GL4', distKey: 'pattern_corner', statKey: 'pattern_corner', drawKey: 'pc', maxLimit: 6, calc: (nums) => {
            const corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42];
            return nums.filter(n => corners.includes(n)).length;
        }, visible: { history: true, analysis: true } },
        { id: 'pattern-center', label: '중앙패턴', unit: '개', group: 'GL4', distKey: 'pattern_center', statKey: 'pattern_center', drawKey: 'pcn', maxLimit: 6, calc: (nums) => {
            const centers = [17,18,19,24,25,26,31,32,33];
            return nums.filter(n => centers.includes(n)).length;
        }, visible: { history: true, analysis: true } },

        // [GL5] 정밀 및 산술
        { id: 'end-sum', label: '끝수합', unit: '', group: 'GL5', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'es', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0), visible: { history: true, analysis: true, combination: true } },
        { id: 'same-end', label: '동끝수', unit: '개', group: 'GL5', distKey: 'same_end', statKey: 'same_end', drawKey: 'se', maxLimit: 6, calc: (nums) => {
            const ends = nums.map(n => n % 10);
            const counts = ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {});
            return Math.max(...Object.values(counts));
        }, visible: { history: true, analysis: true } },
        { id: 'ac', label: 'AC', unit: '', group: 'GL5', distKey: 'ac', statKey: 'ac', drawKey: 'ac', maxLimit: 10, calc: (nums) => LottoUtils.calculateAC(nums), visible: { history: true, analysis: true, combination: true }, filter: { min: 7 } },
        { id: 'span', label: 'Span', unit: '', group: 'GL5', distKey: 'span', statKey: 'span', drawKey: 'spn', calc: (nums) => Math.max(...nums) - Math.min(...nums), visible: { history: true, analysis: true } },

        // [GL6] 심층 지표
        { id: 'mean-gap', label: '간격', unit: '', group: 'GL6', distKey: 'mean_gap', statKey: 'mean_gap', drawKey: 'gap', calc: (nums) => {
            var s = [...nums].sort((a,b)=>a-b); var g = []; for(var i=0; i<5; i++) g.push(s[i+1]-s[i]);
            return LottoUtils.round(g.reduce((a,b)=>a+b,0)/5, 1);
        }, visible: { history: true, analysis: true, combination: true }, filter: { min: 4, max: 11 } }
    ],

    // 1-2. [GP] 연금복권 720+ 개별 지표 설정
    PENSION_INDICATORS: [
        { id: 'p-sum', label: '합계', unit: '', group: 'GP4', distKey: 'sum', statKey: 'sum', calc: (nums) => PensionUtils.analyzeBalance(nums).sum, visible: { history: true, analysis: true, combination: true }, filter: { min: 20, max: 35 } },
        { id: 'p-odd', label: '홀수', unit: '개', group: 'GP7', distKey: 'odd', statKey: 'odd', calc: (nums) => PensionUtils.analyzeBalance(nums).odd, visible: { history: true, analysis: true, combination: true }, filter: { min: 2, max: 4 } },
        { id: 'p-low', label: '저번호', unit: '개', group: 'GP7', distKey: 'low', statKey: 'low', calc: (nums) => PensionUtils.analyzeBalance(nums).low, visible: { history: true, analysis: true, combination: true } },
        { id: 'p-prime', label: '소수', unit: '개', group: 'GP7', distKey: 'prime', statKey: 'prime', calc: (nums) => PensionUtils.analyzeBalance(nums).prime, visible: { history: true, analysis: true, combination: true } },
        { id: 'p-seq', label: '연속', unit: '쌍', group: 'GP1', distKey: 'sequence', statKey: 'sequence', calc: (nums) => PensionUtils.analyzePatterns(nums).seq, visible: { history: true, analysis: true, combination: true } },
        { id: 'p-max-occur', label: '중복', unit: '개', group: 'GP2', distKey: 'occurrence', statKey: 'maxOccur', calc: (nums) => PensionUtils.analyzePatterns(nums).maxOccur, visible: { history: true, analysis: true, combination: true } },
        { id: 'p-carry', label: '이월', unit: '개', group: 'GP5', distKey: 'carry', statKey: 'carry', calc: (nums, data) => (data && data.last_draw) ? PensionUtils.analyzeDynamics(nums, data.last_draw).carry : 0, visible: { history: true, analysis: true, combination: true } },
        { id: 'p-neighbor', label: '이웃', unit: '개', group: 'GP5', distKey: 'neighbor', statKey: 'neighbor', calc: (nums, data) => (data && data.last_draw) ? PensionUtils.analyzeDynamics(nums, data.last_draw).neighbor : 0, visible: { history: true, analysis: true, combination: true } }
    ],

    GROUP_NAMES: {
        'GL1': '기본 균형 및 합계', 'GL2': '관계 및 주기 분석', 'GL3': '수적 성질 및 속성',
        'GL4': '분할 및 구간 분석', 'GL5': '정밀 산술 지표', 'GL6': 'AI 고급 지표',
        'GP1': '자리수별 독립 빈도', 'GP2': '배열 패턴 및 구성 분석', 'GP3': '조별 당첨 분포',
        'GP4': '수치 균형', 'GP5': '회차 간 상관관계', 'GP7': '번호 속성 밸런스'
    },

    LOTTO_TIPS: {
        'sum': '합계 수치는 가장 출현 빈도가 높은 세이프 존 <strong>"{safe}"</strong> 범위를 유지하는 것이 전략적으로 유리합니다.',
        'odd-even': '홀수 개수는 밸런스가 좋은 <strong>"{safe}"</strong> 범위를 권장하며, 특히 3:3 배합이 가장 강력한 정규분포 중심점입니다.',
        'high-low': '고번호와 저번호의 배합은 <strong>"{safe}"</strong> 범위 내에서 선택하여 번호가 한쪽으로 쏠리지 않도록 조절하세요.',
        'period_1': '이월수(직전 1회차 재출현)는 매 회차 <strong>"{safe}"</strong>개 정도 포함되는 것이 통계적으로 가장 흔한 패턴입니다.',
        'period_2': '2주 전 당첨 번호가 다시 출현하는 2회기 패턴은 매 회차 <strong>"{safe}"</strong>개 정도 나타납니다.',
        'period_3': '3주 전 번호에서 추출하는 3회기 전략은 장기 흐름을 잡는 데 유용하며 보통 <strong>"{safe}"</strong>개가 출현합니다.',
        'neighbor': '직전 회차 번호의 주변수(±1)인 이웃수는 <strong>"{safe}"</strong>개 포함될 때 당첨 조합의 완성도가 높아집니다.',
        'consecutive': '연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"{safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.',
        'prime': '소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"{safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.',
        'composite': '합성수는 조합의 뼈대를 이루는 수들로, <strong>"{safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.',
        'multiple-3': '3의 배수는 매 회차 평균 2개 내외로 출현하며, <strong>"{safe}"</strong>개 범위를 지키는 것이 안정적입니다.',
        'multiple-4': '4의 배수는 출현 빈도가 낮으므로 <strong>"{safe}"</strong>개 정도로 가볍게 포함시키는 전략을 권장합니다.',
        'square': '제곱수는 특이값이지만 <strong>"{safe}"</strong>개 범위 내에서 변별력을 주는 요소로 활용할 수 있습니다.',
        'double': '11, 22와 같은 쌍수는 <strong>"{safe}"</strong>개 범위 내에서 조합의 유니크함을 더해주는 지표입니다.',
        'mirror': '12-21 같은 동형수는 조합의 대칭미를 더해주며 보통 <strong>"{safe}"</strong>개 정도 포함됩니다.',
        'bucket-15': '전체 번호를 3그룹으로 나눴을 때 <strong>"{safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.',
        'bucket-9': '5개 구간 분할 시 <strong>"{safe}"</strong>개 구간에서 번호가 고르게 출현하는 조합이 확률이 높습니다.',
        'bucket-7': '7분법 분석은 번호대를 더 세밀하게 쪼개어 <strong>"{safe}"</strong>개 구역 점유를 목표로 합니다.',
        'bucket-5': '9개 구간 분할 시 <strong>"{safe}"</strong>개 구간을 점유하여 세밀한 분산도를 확보하는 것이 좋습니다.',
        'p궁도': '9궁도 배치 상에서 <strong>"{safe}"</strong>개 이상의 구역이 점유되어야 공간적 밸런스가 맞습니다.',
        'empty-zone': '10단위 번호대 중 <strong>"{safe}"</strong>개 구간이 완전히 비어있는(멸) 현상은 매우 일반적인 통계입니다.',
        'color': '5가지 공 색상 중 <strong>"{safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.',
        'pattern-corner': '용지의 4개 모서리 영역에서 <strong>"{safe}"</strong>개 정도의 번호가 출현하는 패턴이 매우 빈번합니다.',
        'pattern-center': '용지 정중앙 구역에 <strong>"{safe}"</strong>개의 번호를 배치하여 중심부의 밸런스를 잡으세요.',
        'end-sum': '일의 자리 숫자들의 합계인 끝수합은 <strong>"{safe}"</strong> 범위 내에서 가장 많이 형성됩니다.',
        'same-end': '동끝수(일의 자리가 같은 번호)는 <strong>"{safe}"</strong>개 포함될 때 당첨 확률이 비약적으로 상승합니다.',
        'ac': '산술적 복잡도(AC)는 <strong>"{safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.',
        'span': '가장 큰 수와 작은 수의 차이(Span)는 <strong>"{safe}"</strong> 범위일 때 가장 강력한 당첨 에너지를 가집니다.',
        'mean-gap': '번호들 사이의 평균 간격이 <strong>"{safe}"</strong> 범위에 있어야 번호가 너무 뭉치거나 퍼지지 않은 이상적 밸런스를 갖춥니다.',
        'ai-markov': '마르코프 체인은 이전 당첨 번호가 다음 번호에 미치는 영향을 분석하여 유력한 전이 경로를 제시합니다.',
        'ai-monte': '1만 회 이상의 가상 시뮬레이션을 통해 사용자 조합의 통계적 우위를 정밀하게 산출합니다.'
    },

    PENSION_TIPS: {
        'p-sum': '조를 제외한 6자리 합계가 20~34 사이인 골든 존이 당첨 확률이 가장 높습니다.',
        'p-odd': '홀짝 비율이 3:3으로 균형 잡힌 조합이 통계적으로 가장 우세합니다.',
        'p-low': '0~4 사이의 낮은 숫자가 적절히 섞여야 안정적인 배합이 됩니다.',
        'p-prime': '소수는 예측하기 어렵지만 꾸준히 한두 개씩 포함되는 필수 지표입니다.',
        'p-seq': '번호가 이어지는 흐름을 관찰하여 너무 인위적인 나열을 피하세요.',
        'p-max-occur': '동일 숫자가 반복되는 횟수를 체크하여 구성의 다양성을 확보하세요.',
        'p-carry': '전회차 숫자가 같은 자리에 그대로 나오는 이월 확률을 반영하여 흐름을 잡으세요.',
        'p-neighbor': '전회차 숫자 주변의 이웃 숫자들이 이동하며 출현하는 상관관계를 분석하세요.',
        'p-markov': '역방향 전이 확률을 분석하여 하위 등급 당첨의 핵심인 일/십의 자리 유력 숫자를 예측합니다.',
        'p-monte': '시뮬레이션을 통해 연금복권 특유의 자리수별 매칭 확률을 기댓값으로 환산합니다.'
    }
};
