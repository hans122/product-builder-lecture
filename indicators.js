/**
 * LottoIndicators v1.1 - 지표 및 시너지 규칙 마스터 설정
 */

const LottoConfig = {
    // 1. 개별 지표 마스터 설정
    INDICATORS: [
        { id: 'sum', label: '총합', unit: '', group: 'G1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
        { id: 'odd-even', label: '홀짝 비율', unit: '', group: 'G1', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'odd_even', calc: (nums) => nums.filter(n => n % 2 !== 0).length },
        { id: 'high-low', label: '고저 비율', unit: '', group: 'G1', distKey: 'high_low', statKey: 'low_count', drawKey: 'high_low', calc: (nums) => nums.filter(n => n <= 22).length },
        { id: 'period_1', label: '직전 1회차 매칭', unit: '개', group: 'G2', distKey: 'period_1', statKey: 'period_1', drawKey: 'period_1', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length : 0 },
        { id: 'neighbor', label: '이웃수', unit: '개', group: 'G2', distKey: 'neighbor', statKey: 'neighbor', drawKey: 'neighbor', calc: (nums, data) => {
            if (!data || !data.last_3_draws) return 0;
            const neighbors = new Set();
            data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
            return nums.filter(n => neighbors.has(n)).length;
        }},
        { id: 'period_1_2', label: '1~2회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_2', statKey: 'period_1_2', drawKey: 'period_1_2', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length : 0 },
        { id: 'period_1_3', label: '1~3회전 윈도우', unit: '개', group: 'G2', distKey: 'period_1_3', statKey: 'period_1_3', drawKey: 'period_1_3', calc: (nums, data) => (data && data.last_3_draws) ? nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[]), ...(data.last_3_draws[2]||[])]).has(n)).length : 0 },
        { id: 'consecutive', label: '연속번호 쌍', unit: '쌍', group: 'G2', distKey: 'consecutive', statKey: 'consecutive', drawKey: 'consecutive', calc: (nums) => {
            let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++; return cnt;
        }},
        { id: 'prime', label: '소수 포함', unit: '개', group: 'G3', distKey: 'prime', statKey: 'prime', drawKey: 'prime', calc: (nums) => nums.filter(LottoUtils.isPrime).length },
        { id: 'composite', label: '합성수 포함', unit: '개', group: 'G3', distKey: 'composite', statKey: 'composite', drawKey: 'composite', calc: (nums) => nums.filter(LottoUtils.isComposite).length },
        { id: 'multiple-3', label: '3배수 포함', unit: '개', group: 'G3', distKey: 'multiple_3', statKey: 'multiple_3', drawKey: 'multiple_3', calc: (nums) => nums.filter(n => n % 3 === 0).length },
        { id: 'multiple-5', label: '5배수 포함', unit: '개', group: 'G3', distKey: 'multiple_5', statKey: 'multiple_5', drawKey: 'm5', calc: (nums) => nums.filter(n => n % 5 === 0).length },
        { id: 'square', label: '제곱수 포함', unit: '개', group: 'G3', distKey: 'square', statKey: 'square', drawKey: 'square', calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length },
        { id: 'double', label: '쌍수 포함', unit: '개', group: 'G3', distKey: 'double_num', statKey: 'double_num', drawKey: 'double', calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length },
        { id: 'bucket-15', label: '3분할(15개씩) 점유', unit: '구간', group: 'G4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', maxLimit: 3, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size },
        { id: 'bucket-9', label: '5분할(9개씩) 점유', unit: '구간', group: 'G4', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9', maxLimit: 5, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size },
        { id: 'bucket-5', label: '9분할(5개씩) 점유', unit: '구간', group: 'G4', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5', maxLimit: 6, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size },
        { id: 'bucket-3', label: '15분할(3개씩) 점유', unit: '구간', group: 'G4', distKey: 'bucket_3', statKey: 'bucket_3', drawKey: 'b3', maxLimit: 6, calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size },
        { id: 'color', label: '포함 색상수', unit: '색상', group: 'G4', distKey: 'color', statKey: 'color', drawKey: 'color', maxLimit: 5, calc: (nums) => new Set(nums.map(LottoUtils.getBallColorClass)).size },

        { id: 'pattern-corner', label: '모서리 패턴', unit: '개', group: 'G4', distKey: 'pattern_corner', statKey: 'pattern_corner', drawKey: 'p_corner', calc: (nums) => {
            const corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42];
            return nums.filter(n => corners.includes(n)).length;
        }},
        { id: 'pattern-triangle', label: '삼각형 패턴', unit: '개', group: 'G4', distKey: 'pattern_triangle', statKey: 'pattern_triangle', drawKey: 'p_tri', calc: (nums) => {
            const triangle = [4,10,11,12,16,17,18,19,20,24,25,26,32];
            return nums.filter(n => triangle.includes(n)).length;
        }},
        { id: 'end-sum', label: '끝수합', unit: '', group: 'G5', distKey: 'end_sum', statKey: 'end_sum', drawKey: 'end_sum', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0) },
        { id: 'same-end', label: '동끝수', unit: '개', group: 'G5', distKey: 'same_end', statKey: 'same_end', drawKey: 'same_end', calc: (nums) => {
            const ends = nums.map(n => n % 10);
            const counts = ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {});
            return Math.max(...Object.values(counts));
        }},
        { id: 'ac', label: 'AC값', unit: '', group: 'G5', distKey: 'ac', statKey: 'ac', drawKey: 'ac', calc: (nums) => LottoUtils.calculateAC(nums) },
        { id: 'span', label: 'Span(간격)', unit: '', group: 'G5', distKey: 'span', statKey: 'span', drawKey: 'span', calc: (nums) => nums[nums.length-1] - nums[0] },
        { id: 'first-num', label: '첫 수 범위', unit: '', group: 'G6', distKey: 'first_num', statKey: 'first_num', drawKey: 'first_num', calc: (nums) => nums[0] },
        { id: 'last-num', label: '끝 수 범위', unit: '', group: 'G6', distKey: 'last_num', statKey: 'last_num', drawKey: 'last_num', calc: (nums) => nums[nums.length-1] },
        { id: 'mean-gap', label: '평균 간격', unit: '', group: 'G6', distKey: 'mean_gap', statKey: 'mean_gap', drawKey: 'mean_gap', calc: (nums) => LottoUtils.round((nums[nums.length-1] - nums[0]) / 5, 1) }
    ],

    // 2. [G0] 조합 정합성(Synergy) 규칙 설정
    // 새로운 상관관계 분석이 필요하면 여기에만 추가하면 자동 연동됨
    SYNERGY_RULES: [
        {
            id: 'syn-ls-high',
            label: '저번호-총합 상충',
            status: 'warning',
            check: (v) => v['high-low'] >= 5 && v['sum'] > 130, // 낮은수가 많은데 합계가 높음
            desc: '저번호가 5개 이상임에도 총합이 높습니다. 번호가 각 구간의 끝자락에 몰려있어 당첨 확률이 낮아집니다.'
        },
        {
            id: 'syn-ls-low',
            label: '고번호-총합 상충',
            status: 'warning',
            check: (v) => v['high-low'] <= 1 && v['sum'] < 140, // 높은수가 많은데 합계가 낮음
            desc: '고번호가 5개 이상임에도 총합이 낮습니다. 번호가 각 구간의 시작점에 몰려있어 밸런스가 어색합니다.'
        },
        {
            id: 'syn-ac-consec',
            label: '밀집도-복잡도 상충',
            status: 'warning',
            check: (v) => v['ac'] >= 8 && v['consecutive'] >= 2,
            desc: '산술적 복잡도(AC)는 높지만 연속번호가 많습니다. 인위적인 번호 선택 패턴으로 판정될 수 있습니다.'
        },
        {
            id: 'syn-span-gap',
            label: '분산도 정합성 오류',
            status: 'safe',
            check: (v) => v['span'] > 40 && v['mean-gap'] < 7,
            desc: '전체 범위(Span)에 비해 번호 간 간격이 너무 좁아 특정 구역에 뭉침 현상이 의심됩니다.'
        }
    ]
};
