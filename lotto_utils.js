'use strict';

/**
 * AI Lotto Utility Library v1.0
 * - Pure Mathematical & Statistical Functions
 * - No dependencies, Loaded first
 */

window.LottoUtils = {
    round: function(val, precision) { var factor = Math.pow(10, precision || 0); return Math.round(val * factor) / factor; },
    isPrime: function(n) { return [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43].includes(Number(n)); },
    isComposite: function(n) { return Number(n) > 1 && !this.isPrime(n); },
    calculateAC: function(nums) {
        var diffs = new Set();
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) { diffs.add(Math.abs(nums[i] - nums[j])); }
        }
        return diffs.size - (nums.length - 1);
    },
    getBallColorClass: function(num) {
        num = Number(num);
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
    calculateZoneInfo: function(stat, dist, cfg) {
        if (!stat || !dist) return null;
        var vals = Object.keys(dist).map(function(k) { return parseInt(k.split(/[ :\-]/)[0]); }).filter(function(v) { return !isNaN(v); });
        if (vals.length === 0) return null;
        var dMax = Math.max.apply(null, vals), dMin = Math.min.apply(null, vals);
        var limit = (cfg && cfg.maxLimit) ? Math.min(cfg.maxLimit, dMax) : dMax;
        var optMin = Math.max(dMin, Math.round(stat.mean - stat.std)), optMax = Math.min(limit, Math.round(stat.mean + stat.std));
        var safeMin = Math.max(dMin, Math.round(stat.mean - 2 * stat.std)), safeMax = Math.min(limit, Math.round(stat.mean + 2 * stat.std));
        var optHits = 0, safeHits = 0;
        for (var k in dist) { 
            var v = parseInt(k.split(/[ :\-]/)[0]); 
            if (!isNaN(v)) { 
                if (v >= optMin && v <= optMax) optHits += dist[k]; 
                if (v >= safeMin && v <= safeMax) safeHits += dist[k]; 
            } 
        }
        return { optimal: optMin + '~' + optMax, safe: safeMin + '~' + safeMax, optHits: optHits, safeHits: safeHits };
    }
};
