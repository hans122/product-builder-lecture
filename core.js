/**
 * LottoCore v5.0 - 상용급 고도화 엔진
 * UI 컴포넌트화, 에러 로깅, 성능 최적화 포함
 */

const LottoConfig = {
    INDICATORS: [
        { id: 'sum', label: '총합', unit: '', group: 'G1', distKey: 'sum', statKey: 'sum', drawKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
        { id: 'odd-even', label: '홀짝 비율', unit: '', group: 'G1', distKey: 'odd_even', statKey: 'odd_count', drawKey: 'odd_even', calc: (nums) => {
            const odds = nums.filter(n => n % 2 !== 0).length;
            return `${odds}:${6 - odds}`;
        }},
        { id: 'high-low', label: '고저 비율', unit: '', group: 'G1', distKey: 'high_low', statKey: 'low_count', drawKey: 'high_low', calc: (nums) => {
            const lows = nums.filter(n => n <= 22).length;
            return `${lows}:${6 - lows}`;
        }},
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
        { id: 'bucket-15', label: '3분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_15', statKey: 'bucket_15', drawKey: 'b15', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size },
        { id: 'bucket-9', label: '5분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_9', statKey: 'bucket_9', drawKey: 'b9', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size },
        { id: 'bucket-5', label: '9분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_5', statKey: 'bucket_5', drawKey: 'b5', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size },
        { id: 'bucket-3', label: '15분할 점유', unit: '구간', group: 'G4', distKey: 'bucket_3', statKey: 'bucket_3', drawKey: 'b3', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size },
        { id: 'color', label: '포함 색상수', unit: '색상', group: 'G4', distKey: 'color', statKey: 'color', drawKey: 'color', calc: (nums) => new Set(nums.map(LottoUtils.getBallColorClass)).size },
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
        { id: 'span', label: 'Span(간격)', unit: '', group: 'G5', distKey: 'span', statKey: 'span', drawKey: 'span', calc: (nums) => nums[nums.length-1] - nums[0] }
    ]
};

const LottoUtils = {
    isPrime: (n) => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43].includes(n),
    isComposite: (n) => n > 1 && !LottoUtils.isPrime(n),
    calculateAC: (nums) => {
        const diffs = new Set();
        for (let i = 0; i < nums.length; i++) {
            for (let j = i + 1; j < nums.length; j++) { diffs.add(Math.abs(nums[i] - nums[j])); }
        }
        return diffs.size - (nums.length - 1);
    },
    getBallColorClass: (num) => {
        if (num <= 10) return 'yellow'; if (num <= 20) return 'blue';
        if (num <= 30) return 'red'; if (num <= 40) return 'gray'; return 'green';
    },
    getZStatus: (val, stat) => {
        if (!stat || stat.std === 0) return 'safe';
        const numVal = (typeof val === 'string' && val.includes(':')) ? parseFloat(val.split(':')[0]) : parseFloat(val);
        const z = Math.abs(numVal - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    },
    // 상용급 로깅 시스템
    logError: (msg, context = '') => {
        console.error(`[LottoCore Error] ${msg}`, context);
        // 추후 서버 로그 수집 API 연동 가능 지점
    }
};

/**
 * LottoUI - 컴포넌트 기반 UI 렌더링 엔진
 */
const LottoUI = {
    // 로또 공 생성
    createBall: (num, isMini = false) => {
        const ball = document.createElement('div');
        ball.className = `ball ${isMini ? 'mini' : ''} ${LottoUtils.getBallColorClass(num)}`;
        ball.innerText = num;
        return ball;
    },
    // 분석 지표 아이템 생성
    createAnalysisItem: (cfg, value, status, stat) => {
        const item = document.createElement('div');
        item.className = `analysis-item ${status}`;
        
        let tip = '';
        if (stat) {
            const optMin = Math.max(0, Math.round(stat.mean - stat.std));
            const optMax = Math.round(stat.mean + stat.std);
            const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            const safeMax = Math.round(stat.mean + 2 * stat.std);
            tip = `data-tip="[${cfg.label}] 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})"`;
        }

        item.innerHTML = `
            <a href="analysis.html#${cfg.id}-section" class="analysis-item-link" ${tip}>
                <span class="label">${cfg.label}</span>
                <span id="${cfg.id}" class="value">${value}</span>
            </a>
        `;
        return item;
    },
    // 스켈레톤 UI 표시
    showSkeleton: (containerId, type = 'grid') => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `<div class="skeleton-${type}">데이터를 불러오는 중...</div>`;
    }
};

const LottoDataManager = {
    cache: null,
    async getStats() {
        if (this.cache) return this.cache;
        try {
            const res = await fetch('advanced_stats.json?v=' + Date.now());
            if (!res.ok) throw new Error('Network response was not ok');
            this.cache = await res.json();
            return this.cache;
        } catch (err) {
            LottoUtils.logError('Data Fetch Failed', err);
            return null;
        }
    }
};
