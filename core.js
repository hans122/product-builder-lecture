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
        const stats = (data && data.stats_summary) ? data.stats_summary : {};
        LottoConfig.SYNERGY_RULES.forEach(rule => {
            if (rule.check(indicatorValues, stats)) {
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
            let optMin = Math.max(0, Math.round(stat.mean - stat.std));
            let optMax = Math.round(stat.mean + stat.std);
            let safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            let safeMax = Math.round(stat.mean + 2 * stat.std);

            // [보정] 물리적 최대값(maxLimit) 엄격 적용
            if (cfg.maxLimit) {
                optMax = Math.min(cfg.maxLimit, optMax);
                safeMax = Math.min(cfg.maxLimit, safeMax);
                optMin = Math.min(optMin, optMax);
                safeMin = Math.min(safeMin, safeMax);
            }

            tip = `data-tip="[${cfg.label}] 세이프: ${safeMin}~${safeMax}${cfg.unit} (옵티멀: ${optMin}~${optMax}${cfg.unit})"`;
        }

        item.innerHTML = `
            <a href="analysis.html#${cfg.id}-section" class="analysis-item-link" ${tip}>
                <span class="label">${cfg.label}</span>
                <span id="${cfg.id}" class="value">${value}</span>
            </a>
        `;
        return item;
    },
    // [추가] 핀테크 스타일 SVG 곡선 차트 생성기
    createCurveChart: (containerId, distData, unit = '', statSummary = null, config = null, highlightValue = null) => {
        const container = document.getElementById(containerId);
        if (!container || !statSummary) return;
        container.innerHTML = '';

        const entries = Array.isArray(distData) ? distData : Object.entries(distData);
        if (entries.length < 2) return;

        if (!Array.isArray(distData)) {
            entries.sort((a, b) => {
                const valA = parseFloat(a[0].split(/[ :\-]/)[0]);
                const valB = parseFloat(b[0].split(/[ :\-]/)[0]);
                return isNaN(valA) ? 0 : valA - valB;
            });
        }

        const mu = statSummary.mean; const sd = statSummary.std;
        const valKeys = entries.map(e => parseFloat(e[0].split(/[ :\-]/)[0])).filter(v => !isNaN(v));
        if (valKeys.length === 0) return;

        // 데이터 기반 한계치 추출
        const dataMax = Math.max(...valKeys);
        const dataMin = Math.min(...valKeys);
        const limit = (config && config.maxLimit) ? Math.min(config.maxLimit, dataMax) : dataMax;

        const rawPoints = [
            { label: '최소', val: dataMin, cls: 'min-max' },
            { label: '미니 세이프', val: Math.max(dataMin, Math.round(mu - 2 * sd)), cls: 'safe-zone' },
            { label: '미니 옵티멀', val: Math.max(dataMin, Math.round(mu - sd)), cls: 'optimal-zone' },
            { label: '맥스 옵티멀', val: Math.min(limit, Math.round(mu + sd)), cls: 'optimal-zone' },
            { label: '맥스 세이프', val: Math.min(limit, Math.round(mu + 2 * sd)), cls: 'safe-zone' },
            { label: '최대', val: limit, cls: 'min-max' }
        ];

        const priority = { 'optimal-zone': 3, 'safe-zone': 2, 'min-max': 1 };
        const unifiedMap = new Map();
        rawPoints.forEach(p => {
            const existing = unifiedMap.get(p.val);
            if (!existing || priority[p.cls] > priority[existing.cls]) { unifiedMap.set(p.val, p); }
        });
        const finalPoints = Array.from(unifiedMap.values()).sort((a, b) => a.val - b.val);

        const width = container.clientWidth || 600;
        const height = 200; const padding = 50;
        const chartWidth = width - padding * 2;
        const chartHeight = height - 70;
        const baselineY = height - 40;

        const maxFreq = Math.max(...entries.map(e => e[1]), 1);
        const points = entries.map((e, i) => {
            const x = padding + (i / (entries.length - 1)) * chartWidth;
            const y = baselineY - (e[1] / maxFreq) * chartHeight;
            return { x, y, label: e[0], value: e[1], index: i };
        });

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", `shadow-${containerId}`);
        filter.innerHTML = `<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(49, 130, 246, 0.2)"/>`;
        defs.appendChild(filter);

        const hatchIdOptimal = `hatch-opt-${containerId}`;
        const hatchIdSafe = `hatch-safe-${containerId}`;

        const patternOpt = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        patternOpt.setAttribute("id", hatchIdOptimal); patternOpt.setAttribute("patternUnits", "userSpaceOnUse");
        patternOpt.setAttribute("width", "6"); patternOpt.setAttribute("height", "6"); patternOpt.setAttribute("patternTransform", "rotate(45)");
        patternOpt.innerHTML = `<line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.5" opacity="0.4"/>`;
        defs.appendChild(patternOpt);

        const patternSafe = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        patternSafe.setAttribute("id", hatchIdSafe); patternSafe.setAttribute("patternUnits", "userSpaceOnUse");
        patternSafe.setAttribute("width", "6"); patternSafe.setAttribute("height", "6"); patternSafe.setAttribute("patternTransform", "rotate(-45)");
        patternSafe.innerHTML = `<line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1" opacity="0.2"/>`;
        defs.appendChild(patternSafe);
        svg.appendChild(defs);

        const drawZone = (z, color) => {
            const minBound = Math.round(mu - z * sd);
            const maxBound = Math.min(limit, Math.round(mu + z * sd));
            const zPoints = points.filter(p => {
                const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
                return !isNaN(pVal) && pVal >= minBound && pVal <= maxBound;
            });
            if (zPoints.length > 0) {
                const firstP = zPoints[0]; const lastP = zPoints[zPoints.length - 1];
                let d = zPoints.length === 1 ? 
                    `M ${firstP.x-25},${baselineY} L ${firstP.x-25},${firstP.y} L ${firstP.x+25},${firstP.y} L ${firstP.x+25},${baselineY} Z` :
                    `M ${firstP.x},${baselineY} ` + zPoints.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${lastP.x},${baselineY} Z`;
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
            }
        };

        drawZone(2, `url(#${hatchIdSafe})`); 
        drawZone(1, `url(#${hatchIdOptimal})`); 

        const curvePathData = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
        const curvePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        curvePath.setAttribute("d", curvePathData); curvePath.setAttribute("fill", "none");
        curvePath.setAttribute("stroke", "#3182f6"); curvePath.setAttribute("stroke-width", "3"); 
        curvePath.setAttribute("filter", `url(#shadow-${containerId})`);
        svg.appendChild(curvePath);

        finalPoints.forEach(fp => {
            let bestIdx = -1; let minD = Infinity;
            points.forEach((p, idx) => {
                const pVal = parseFloat(p.label.split(/[ :\-]/)[0]);
                const diff = Math.abs(pVal - fp.val);
                if (diff < minD) { minD = diff; bestIdx = idx; }
            });
            if (bestIdx !== -1) {
                const p = points[bestIdx];
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y); circle.setAttribute("r", 4);
                circle.setAttribute("fill", "#3182f6"); circle.setAttribute("stroke", "white"); circle.setAttribute("stroke-width", "2");
                svg.appendChild(circle);

                const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("x", p.x); txt.setAttribute("y", height); txt.setAttribute("text-anchor", "middle");
                let textColor = fp.cls === 'safe-zone' ? "#3182f6" : (fp.cls === 'optimal-zone' ? "#2ecc71" : "#8b95a1");
                txt.setAttribute("fill", textColor); txt.style.fontSize = "0.8rem"; txt.style.fontWeight = "700";
                txt.textContent = p.label + unit; svg.appendChild(txt);
            }
        });

        if (highlightValue !== null) {
            let closestP = points[0]; let minD = Infinity;
            points.forEach(p => {
                const v = parseFloat(p.label.split(/[ :\-]/)[0]); const d = Math.abs(v - highlightValue);
                if (d < minD) { minD = d; closestP = p; }
            });
            const mc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            mc.setAttribute("cx", closestP.x); mc.setAttribute("cy", closestP.y); mc.setAttribute("r", 7);
            mc.setAttribute("fill", "#f04452"); mc.setAttribute("stroke", "white"); mc.setAttribute("stroke-width", "2");
            svg.appendChild(mc);
        }
        container.appendChild(svg);
    },
    // [추가] 공통 미니 표 렌더러
    renderMiniTable: (containerId, draws, indicatorConfig) => {
        const tbody = document.getElementById(containerId);
        if (!tbody) return;
        tbody.innerHTML = '';
        draws.forEach(draw => {
            const tr = document.createElement('tr');
            const ballsHtml = (draw.nums || []).map(n => LottoUI.createBall(n, true).outerHTML).join('');
            const val = draw[indicatorConfig.drawKey] !== undefined ? draw[indicatorConfig.drawKey] : (draw[indicatorConfig.statKey] !== undefined ? draw[indicatorConfig.statKey] : '-');
            tr.innerHTML = `<td>${draw.no}회</td><td><div class="table-nums">${ballsHtml}</div></td><td><strong>${val}</strong></td>`;
            tbody.appendChild(tr);
        });
    },
    // 지표 그리드 자동 빌드 (Mount Point에 설정된 지표들 주입)
    renderIndicatorGrid: (containerId, indicatorIds, numbers, statsData) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        const summary = statsData.stats_summary || {};
        LottoConfig.INDICATORS.filter(cfg => indicatorIds.includes(cfg.id)).forEach(cfg => {
            const val = cfg.calc(numbers, statsData);
            const status = LottoUtils.getZStatus(val, summary[cfg.statKey]);
            const item = LottoUI.createAnalysisItem(cfg, val, status, summary[cfg.statKey]);
            container.appendChild(item);
        });
    }
};

// [추가] 글로벌 에러 모니터링
window.addEventListener('error', (e) => {
    LottoUtils.logError('Runtime Error', { message: e.message, filename: e.filename, lineno: e.lineno });
});

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
