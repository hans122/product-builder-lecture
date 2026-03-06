/**
 * LottoCore Hub v12.0
 * - Orchestrates Data, Logic, and UI Components
 * - Standardized Hub for all page engines
 */

var LottoEvents = {
    _listeners: {},
    on: function(evt, fn) { if(!this._listeners[evt]) this._listeners[evt] = []; this._listeners[evt].push(fn); },
    emit: function(evt, data) { if(this._listeners[evt]) this._listeners[evt].forEach(fn => fn(data)); }
};

var LottoUtils = {
    round: function(val, precision) { var factor = Math.pow(10, precision || 0); return Math.round(val * factor) / factor; },
    isPrime: function(n) { return [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43].includes(n); },
    isComposite: function(n) { return n > 1 && !this.isPrime(n); },
    calculateAC: function(nums) {
        var diffs = new Set();
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) { diffs.add(Math.abs(nums[i] - nums[j])); }
        }
        return diffs.size - (nums.length - 1);
    },
    getBallColorClass: function(num) {
        if (num <= 10) return 'yellow'; if (num <= 20) return 'blue';
        if (num <= 30) return 'red'; if (num <= 40) return 'gray'; return 'green';
    },
    getZStatus: function(val, stat) {
        if (!stat || stat.std === 0 || val === undefined || val === null) return 'safe';
        var numVal = parseFloat(val); if (isNaN(numVal)) return 'safe';
        var z = Math.abs(numVal - stat.mean) / stat.std;
        return z <= 1.0 ? 'safe' : (z <= 2.0 ? 'warning' : 'danger');
    },
    padLeft: function(str, length, char) { str = String(str); while (str.length < length) str = char + str; return str; },
    getStrategyGroups: function(recentDraws) {
        var counts = {}; for (var n = 1; n <= 45; n++) counts[n] = 0;
        recentDraws.slice(0, 15).forEach(d => d.nums.forEach(n => counts[n]++));
        var groups = { hot: [], warm: [], cold: [] };
        for (var num = 1; num <= 45; num++) {
            var f = counts[num];
            if (f >= 3) groups.hot.push(num); else if (f >= 1) groups.warm.push(num); else groups.cold.push(num);
        }
        return groups;
    }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    promises: { lotto: null, pension: null },
    SYSTEM_VERSION: '12.0',
    getCacheKey: function(type) { return 'lotto_data_' + type + '_v' + this.SYSTEM_VERSION; },
    getStats: function(cb) { this._load('advanced_stats.json', 'lotto', cb); },
    getPensionStats: function(cb) { this._load('pension_stats.json', 'pension', cb); },
    _load: function(url, type, cb) {
        if (this.cache[type]) { cb(this.cache[type]); return; }
        if (this.promises[type]) { this.promises[type].then(cb); return; }
        var self = this;
        this.promises[type] = new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + '?v=' + self.SYSTEM_VERSION + '_' + Date.now());
            xhr.onload = () => {
                var data = JSON.parse(xhr.responseText);
                self.cache[type] = data; resolve(data);
            };
            xhr.send();
        });
        this.promises[type].then(cb);
    }
};

var LottoSynergy = {
    check: function(nums, data) {
        if (!LottoConfig || !LottoConfig.SYNERGY_RULES) return [];
        var v = {}, stats = data.stats_summary || {};
        LottoConfig.INDICATORS.filter(c => c.calc && c.group.startsWith('GL')).forEach(c => v[c.id] = c.calc(nums, data));
        return LottoConfig.SYNERGY_RULES.filter(r => r.check(v, stats)).map(r => ({ id: r.id, label: r.label, status: r.status, desc: r.desc }));
    }
};

var LottoUI = {
    createBall: function(num, isMini) {
        var ball = document.createElement('div');
        var colorClass = LottoUtils.getBallColorClass(num);
        ball.className = 'ball ' + (isMini ? 'mini ' : '') + colorClass;
        ball.innerText = num;
        return ball;
    },

    createPensionBall: function(num, isSmall) {
        var ball = document.createElement('div');
        var color = num >= 5 ? 'blue' : 'yellow';
        ball.className = 'pension-ball ' + (isSmall ? 'small ' : '') + color;
        ball.innerText = num;
        return ball;
    },

    showSkeletons: function(containerId, count) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (var i = 0; i < count; i++) {
            var skel = document.createElement('div');
            skel.className = 'skeleton-card';
            skel.style.cssText = 'height: 100px; background: #f2f4f6; border-radius: 12px; animation: pulse 1.5s infinite;';
            container.appendChild(skel);
        }
    },

    renderIndicatorGrid: function(containerId, indicatorIds, numbers, statsData) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        indicatorIds.forEach(id => {
            var config = LottoConfig.INDICATORS.find(c => c.id === id);
            if (!config) return;
            var value = config.calc(numbers, statsData);
            var status = 'safe';
            var stat = statsData ? (statsData.stats_summary ? statsData.stats_summary[config.statKey] : null) : null;
            if (stat) status = LottoUtils.getZStatus(value, stat);
            
            var card = document.createElement('div');
            card.className = 'indicator-item';
            card.style.cssText = 'padding: 15px; border-radius: 16px; background: #f8fafc; border: 1px solid #edf2f7; display: flex; flex-direction: column; gap: 4px;';
            card.innerHTML = `<span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">${config.label}</span>
                <div style="display: flex; align-items: baseline; gap: 2px;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: ${status === 'danger' ? '#f04452' : (status === 'warning' ? '#ff9500' : '#191f28')}">${value}</span>
                    <span style="font-size: 0.7rem; color: #8b95a1; font-weight: 600;">${config.unit || ''}</span>
                </div>
                <div class="status-badge ${status}" style="margin-top: 5px; width: fit-content;">${status === 'safe' ? '세이프' : (status === 'warning' ? '주의' : '위험')}</div>`;
            container.appendChild(card);
        });
    },

    createCurveChart: function(containerId, distData, unit, stat, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        var w = container.clientWidth || 300, h = 200, padding = 30;
        var mean = stat ? stat.mean : 0, std = stat ? stat.std : 1;
        var minX = mean - 3.5 * std, maxX = mean + 3.5 * std;
        
        var points = [];
        for (var x = minX; x <= maxX; x += (maxX - minX) / 100) {
            var y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            points.push({ x: x, y: y });
        }
        
        var maxY = Math.max(...points.map(p => p.y));
        var scaleX = (w - padding * 2) / (maxX - minX);
        var scaleY = (h - padding * 2) / maxY;
        
        var getX = (val) => padding + (val - minX) * scaleX;
        var getY = (val) => h - padding - val * scaleY;
        
        var pathD = "M " + points.map(p => getX(p.x) + "," + getY(p.y)).join(" L ");
        
        var labels = [
            { v: mean - 2 * std, l: '세이프 미니', p: 1 },
            { v: mean - std, l: '옵티 미니', p: 2 },
            { v: mean, l: '평균', p: 3 },
            { v: mean + std, l: '옵티 맥스', p: 2 },
            { v: mean + 2 * std, l: '세이프 맥스', p: 1 }
        ].sort((a,b) => b.p - a.p);
        
        var visibleLabels = [];
        labels.forEach(lab => {
            var x = getX(lab.v);
            if (visibleLabels.every(v => Math.abs(getX(v.v) - x) > 45)) visibleLabels.push(lab);
        });
        
        var hatching = `<defs>
            <pattern id="h-green" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#2ecc71" stroke-width="1" stroke-opacity="0.3"/></pattern>
            <pattern id="h-blue" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#3182f6" stroke-width="1" stroke-opacity="0.3"/></pattern>
        </defs>`;
        
        var svg = `<svg width="${w}" height="${h}" style="overflow:visible;">${hatching}
            <rect x="${getX(mean-std)}" y="${padding}" width="${getX(mean+std)-getX(mean-std)}" height="${h-padding*2}" fill="url(#h-green)"/>
            <rect x="${getX(mean-2*std)}" y="${padding}" width="${getX(mean+2*std)-getX(mean-2*std)}" height="${h-padding*2}" fill="url(#h-blue)" fill-opacity="0.5"/>
            <path d="${pathD}" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round"/>
            <line x1="${padding}" y1="${h-padding}" x2="${w-padding}" y2="${h-padding}" stroke="#e5e8eb" stroke-width="1"/>
            ${visibleLabels.map(l => `<g><line x1="${getX(l.v)}" y1="${h-padding}" x2="${getX(l.v)}" y2="${h-padding+5}" stroke="#cbd5e1"/><text x="${getX(l.v)}" y="${h-10}" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">${l.l}</text></g>`).join('')}
        </svg>`;
        container.innerHTML = svg;
    },

    renderMiniTable: function(containerId, recentDraws, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = recentDraws.map(d => {
            var val = config.calc(d.nums);
            var balls = d.nums.map(n => `<div class="ball mini ${LottoUtils.getBallColorClass(n)}">${n}</div>`).join('');
            return `<tr><td>${d.no}회</td><td><div class="ball-container mini">${balls}</div></td><td><strong>${val}</strong></td></tr>`;
        }).join('');
    },

    renderMarkovHeatmap: function(containerId, matrix, options) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var opts = options || {};
        var html = `<div style="display:grid; grid-template-columns: 40px repeat(10, 1fr); gap: 2px;">`;
        html += `<div></div>` + Array.from({length:10}, (_,i)=>`<div style="text-align:center; font-size:0.65rem; font-weight:900; color:#8b95a1;">${i}</div>`).join('');
        matrix.forEach((row, i) => {
            var sum = row.reduce((a,b)=>a+b, 0);
            html += `<div style="font-size:0.65rem; font-weight:900; color:#8b95a1; display:flex; align-items:center; justify-content:center;">${opts.rowLabel||''}${i}</div>`;
            row.forEach(val => {
                var prob = sum > 0 ? (val/sum) : 0;
                var alpha = Math.max(0.05, prob * 2);
                html += `<div style="aspect-ratio:1; background:rgba(${opts.color||'49, 130, 246'}, ${alpha}); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:900; color:${prob > 0.3 ? 'white' : '#191f28'};" title="${Math.round(prob*100)}%">${val > 0 ? val : ''}</div>`;
            });
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    createComboCard: function(res, options) {
        var opts = options || {};
        var card = document.createElement('div');
        card.className = 'combo-card';
        var ballsHtml = res.nums.map(n => {
            var b = this.createBall(n, true);
            if (opts.anchor === n) b.style.boxShadow = '0 0 0 3px var(--primary-blue)';
            return b.outerHTML;
        }).join('');
        card.innerHTML = `<div class="combo-rank">${res.strategy.label}</div><div class="ball-container">${ballsHtml}</div><div class="combo-meta">신뢰도 <b>${res.confidence}%</b> | 합계 ${res.sum}</div><div class="combo-desc">${res.strategy.desc}</div><div class="analyze-badge">정밀 분석 ➔</div>`;
        return card;
    },

    renderSynergyReport: function(results) {
        if (!results || results.length === 0) return '';
        var html = results.map(s => `
            <div class="synergy-item" style="margin-bottom:8px; padding:12px; border-radius:12px; border-left:4px solid ${s.status === 'danger' ? '#f04452' : '#3182f6'}; background:${s.status === 'danger' ? '#fef2f2' : '#f0f7ff'};">
                <div style="font-size:0.8rem; font-weight:900; color:${s.status === 'danger' ? '#f04452' : '#3182f6'}; margin-bottom:4px;">[GL0] ${s.label}</div>
                <div style="font-size:0.75rem; color:#4e5968; line-height:1.5;">${s.desc}</div>
            </div>`).join('');
        return `<div class="ai-deep-report" style="padding:20px; background:white; border-radius:16px;"><div style="font-size:0.9rem; font-weight:800; color:#191f28; margin-bottom:15px;">🔍 AI 심층 진단 리포트</div>${html}</div>`;
    }
};

var PrivacyManager = {
    init: function() {
        if (localStorage.getItem('lotto_consent_given')) return;
        var banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#fff; box-shadow:0 -2px 20px rgba(0,0,0,0.1); z-index:10000; padding:1.5rem; text-align:center;';
        banner.innerHTML = '<p style="font-size:0.9rem; margin-bottom:1rem;">서비스 제공을 위해 쿠키를 사용합니다. <a href="privacy.html">개인정보처리방침</a>에 동의하십니까?</p>' +
                           '<div style="display:flex; gap:1rem; justify-content:center;"><button id="c-acc">동의함</button><button id="c-dec">거부함</button></div>';
        document.body.appendChild(banner);
        document.getElementById('c-acc').onclick = () => { localStorage.setItem('lotto_consent_given', 'true'); banner.remove(); };
        document.getElementById('c-dec').onclick = () => banner.remove();
    }
};

document.addEventListener('DOMContentLoaded', () => PrivacyManager.init());
