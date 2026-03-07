'use strict';

/**
 * LottoCore Hub v3.0 (Modularized Edition)
 * - Centralized Storage & Data Management
 * - Robust Fetch with Advanced Cache Busting
 * - Standardized Interaction Patterns
 */

var LottoStorage = {
    KEYS: {
        LOTTO_ARCHIVE: 'lotto_ai_archive',
        LOTTO_POOL: 'lotto_system_pool',
        PENSION_ARCHIVE: 'pension_ai_archive',
        PENSION_POOL: 'pension_system_pool',
        CONSENT: 'lotto_consent_given'
    },

    get: function(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch(e) { return []; }
    },

    set: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    /** 중복 제거 저장 로직 (nums 기준 정렬하여 비교) */
    pushUnique: function(key, items, limit, sortBy) {
        var list = this.get(key);
        items.forEach(function(newItem) {
            var isDup = list.some(function(existing) {
                return JSON.stringify(existing.nums.slice().sort()) === JSON.stringify(newItem.nums.slice().sort());
            });
            if (!isDup) {
                if (!newItem.timestamp) newItem.timestamp = Date.now();
                list.unshift(newItem);
            }
        });
        if (sortBy) list.sort(sortBy);
        if (limit) list = list.slice(0, limit);
        this.set(key, list);
        return list;
    },

    remove: function(key, nums) {
        var list = this.get(key);
        var numsStr = JSON.stringify(nums.slice().sort());
        var filtered = list.filter(function(item) {
            return JSON.stringify(item.nums.slice().sort()) !== numsStr;
        });
        this.set(key, filtered);
        return filtered;
    },

    clear: function(key) {
        localStorage.removeItem(key);
    }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    SYSTEM_VERSION: '22.29',

    getStats: function(cb) { this._load('advanced_stats.json', 'lotto', cb); },
    getPensionStats: function(cb) { this._load('pension_stats.json', 'pension', cb); },

    _load: function(url, type, cb) {
        if (this.cache[type]) { cb(this.cache[type]); return; }
        var self = this;
        var finalUrl = url + '?v=' + this.SYSTEM_VERSION + '_' + Math.floor(Date.now()/100000);

        fetch(finalUrl, { cache: 'no-cache' })
            .then(function(res) { if (!res.ok) throw new Error(res.status); return res.json(); })
            .then(function(data) {
                self.cache[type] = data;
                cb(data);
            })
            .catch(function(err) {
                console.error('[LottoCore] Load Failed:', url, err);
                cb(null);
            });
    }
};

var LottoEvents = {
    _listeners: {},
    on: function(evt, fn) { if(!this._listeners[evt]) this._listeners[evt] = []; this._listeners[evt].push(fn); },
    emit: function(evt, data) { if(this._listeners[evt]) this._listeners[evt].forEach(function(fn) { fn(data); }); }
};

/** 개인정보 동의 매니저 */
var PrivacyManager = {
    init: function() {
        if (localStorage.getItem(LottoStorage.KEYS.CONSENT)) return;
        var banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#fff; box-shadow:0 -2px 20px rgba(0,0,0,0.1); z-index:10000; padding:1.5rem; text-align:center; border-top: 1px solid #edf2f7;';
        banner.innerHTML = '<p style="font-size:0.9rem; margin-bottom:1rem; font-weight:700; color:#191f28;">서비스 제공을 위해 쿠키 및 저장소를 사용합니다. <a href="privacy.html" style="color:#3182f6;">개인정보처리방침</a>에 동의하십니까?</p>' +
                           '<div style="display:flex; gap:1rem; justify-content:center;"><button id="c-acc" style="padding:10px 24px; border-radius:10px; background:#3182f6; color:white; border:none; font-weight:800; cursor:pointer;">동의함</button><button id="c-dec" style="padding:10px 24px; border-radius:10px; background:#f2f4f6; color:#4e5968; border:none; font-weight:800; cursor:pointer;">거부함</button></div>';
        document.body.appendChild(banner);
        document.getElementById('c-acc').onclick = function() { localStorage.setItem(LottoStorage.KEYS.CONSENT, 'true'); banner.remove(); };
        document.getElementById('c-dec').onclick = function() { banner.remove(); };
    }
};

document.addEventListener('DOMContentLoaded', function() {
    PrivacyManager.init();
});
