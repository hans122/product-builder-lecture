/**
 * LottoCore v5.3 - 고도화된 지능형 엔진
 * 설정 기반 시너지 분석(G0) 및 공통 유틸리티
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
    getZStatus: (val, stat) => {
        if (!stat || stat.std === 0) return 'safe';
        const numVal = (typeof val === 'string' && val.includes(':')) ? parseFloat(val.split(':')[0]) : parseFloat(val);
        const z = Math.abs(numVal - stat.mean) / stat.std;
        if (z <= 1.0) return 'safe';
        if (z <= 2.0) return 'warning';
        return 'danger';
    },
    logError: (msg, context = '') => {
        console.error(`[LottoCore Error] ${msg}`, context);
    }
};

/**
 * LottoSynergy - 설정 기반 상관관계 분석 엔진 (G0)
 * indicators.js의 SYNERGY_RULES 설정을 동적으로 실행함
 */
const LottoSynergy = {
    check: (nums, data) => {
        const results = [];
        
        // 1. 규칙 실행에 필요한 모든 지표 값 사전 계산
        const indicatorValues = {};
        LottoConfig.INDICATORS.forEach(cfg => {
            indicatorValues[cfg.id] = cfg.calc(nums, data);
        });

        // 2. 설정된 시너지 규칙들을 순회하며 검사 (자동화 핵심)
        LottoConfig.SYNERGY_RULES.forEach(rule => {
            if (rule.check(indicatorValues)) {
                results.push({
                    id: rule.id,
                    label: rule.label,
                    status: rule.status,
                    desc: rule.desc
                });
            }
        });

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
            if (!res.ok) throw new Error('Network response was not ok');
            this.cache = await res.json();
            return this.cache;
        } catch (err) {
            LottoUtils.logError('Data Fetch Failed', err);
            return null;
        }
    }
};
