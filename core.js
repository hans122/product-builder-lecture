/**
 * LottoCore v5.2 - 순수 엔진 모듈
 * indicators.js로부터 설정을 주입받아 실행 및 데이터 관리 담당
 */

const LottoUtils = {
    round: (val, precision = 0) => {
        const factor = Math.pow(10, precision);
        return Math.round(val * factor) / factor;
    },
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
    // 정규분포 기반 3단계 등급 판정 (v5.2 규격)
    getZStatus: (val, stat) => {
        if (!stat || stat.std === 0) return 'safe';
        const numVal = (typeof val === 'string' && val.includes(':')) ? parseFloat(val.split(':')[0]) : parseFloat(val);
        const z = Math.abs(numVal - stat.mean) / stat.std;
        if (z <= 1.0) return 'safe';    // 핵심 안정 구간
        if (z <= 2.0) return 'warning'; // 경계 구간
        return 'danger';                // 희귀 구간
    },
    logError: (msg, context = '') => {
        console.error(`[LottoCore Error] ${msg}`, context);
    }
};

/**
 * LottoSynergy - 지표 간 상관관계 및 정합성 분석 엔진 (G0)
 */
const LottoSynergy = {
    check: (nums, data) => {
        const results = [];
        const s = nums.reduce((a, b) => a + b, 0);
        const lc = nums.filter(n => n <= 22).length;
        const ac = LottoUtils.calculateAC(nums);
        const cons = (() => { let c=0; for(let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) c++; return c; })();
        
        if (lc >= 5 && s > 130) results.push({ id: 'syn-ls', label: '저번호-총합 모순', status: 'warning', desc: '저번호가 많음에도 총합이 높습니다.' });
        if (lc <= 1 && s < 140) results.push({ id: 'syn-ls', label: '고번호-총합 모순', status: 'warning', desc: '고번호가 많음에도 총합이 낮습니다.' });
        if (ac >= 8 && cons >= 2) results.push({ id: 'syn-ac', label: '패턴 밀집도 불균형', status: 'warning', desc: '복잡도는 높으나 연속번호가 많아 패턴이 충돌합니다.' });
        return results;
    }
};

/**
 * LottoUI - 컴포넌트 기반 UI 렌더링 엔진
 */
const LottoUI = {
    createBall: (num, isMini = false) => {
        const ball = document.createElement('div');
        ball.className = `ball ${isMini ? 'mini' : ''} ${LottoUtils.getBallColorClass(num)}`;
        ball.innerText = num;
        return ball;
    },
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
        item.innerHTML = `<a href="analysis.html#${cfg.id}-section" class="analysis-item-link" ${tip}><span class="label">${cfg.label}</span><span id="${cfg.id}" class="value">${value}</span></a>`;
        return item;
    },
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
            this.cache = await res.json();
            return this.cache;
        } catch (err) {
            LottoUtils.logError('Data Fetch Failed', err);
            return null;
        }
    }
};
