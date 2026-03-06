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
    }
};
