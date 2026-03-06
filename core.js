/**
 * LottoCore Hub v12.0
 * - Orchestrates Data, Logic, and Core Utilities
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
    isComposite: function(n) { return n > 1 && !LottoUtils.isPrime(n); },
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

var PensionUtils = {
    /** 1. 패턴 분석 (연속, 중복 등) */
    analyzePatterns: function(nums) {
        var seq = 0, counts = {};
        for(var i=0; i<nums.length; i++) {
            var n = Number(nums[i]); counts[n] = (counts[n] || 0) + 1;
            if(i > 0 && Math.abs(n - Number(nums[i-1])) === 1) seq++;
        }
        var maxOccur = Math.max(...Object.values(counts));
        var adjRep = 0; Object.values(counts).forEach(v => { if(v > 1) adjRep += (v - 1); });
        var unique = Object.keys(counts).length;
        return { seq: seq, adjRep: adjRep, maxOccur: maxOccur, unique: unique };
    },
    /** 2. 밸런스 분석 (합계, 홀짝 등) */
    analyzeBalance: function(nums) {
        var sum = 0, odd = 0, low = 0, prime = 0;
        nums.forEach(n => {
            var val = Number(n); sum += val;
            if(val % 2 !== 0) odd++;
            if(val <= 4) low++;
            if([2,3,5,7].includes(val)) prime++;
        });
        return { sum: sum, odd: odd, low: low, prime: prime };
    },
    /** 3. 동적 흐름 분석 (이월, 이웃) */
    analyzeDynamics: function(nums, prevNums) {
        var carry = 0, carryGlobal = 0, neighbor = 0;
        if(!prevNums) return { carry: 0, carryGlobal: 0, neighbor: 0 };
        for(var i=0; i<6; i++) {
            var n = Number(nums[i]);
            if(n === Number(prevNums[i])) carry++;
            if(prevNums.map(Number).includes(n)) carryGlobal++;
            if(prevNums.map(Number).some(p => Math.abs(p - n) === 1)) neighbor++;
        }
        return { carry: carry, carryGlobal: carryGlobal, neighbor: neighbor };
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
