/**
 * LottoCore Hub v21.4 (High-Stability Edition)
 * - Uses Fetch API for robust data streaming
 * - Advanced Cache Busting & Error Management
 */

var LottoEvents = {
    _listeners: {},
    on: function(evt, fn) { if(!this._listeners[evt]) this._listeners[evt] = []; this._listeners[evt].push(fn); },
    emit: function(evt, data) { if(this._listeners[evt]) this._listeners[evt].forEach(fn => fn(data)); }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    promises: { lotto: null, pension: null },
    SYSTEM_VERSION: '22.22',
    getStats: function(cb) { this._load('advanced_stats.json', 'lotto', cb); },
    getPensionStats: function(cb) { this._load('pension_stats.json', 'pension', cb); },
    _load: function(url, type, cb) {
        if (this.cache[type]) { cb(this.cache[type]); return; }
        if (this.promises[type]) { this.promises[type].then(cb); return; }
        
        var self = this;
        var cacheBuster = self.SYSTEM_VERSION + '_' + Date.now() + '_' + Math.floor(Math.random()*1000);
        var finalUrl = url + '?v=' + cacheBuster;

        this.promises[type] = fetch(finalUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json(); // Robust streaming parse
        })
        .then(data => {
            self.cache[type] = data;
            return data;
        })
        .catch(err => {
            console.error('[LottoCore] Data Fetch Failed:', err, 'URL:', url);
            return null;
        });

        this.promises[type].then(cb);
    }
};

var LottoSynergy = {
    check: function(nums, data) {
        if (!LottoConfig || !LottoConfig.SYNERGY_RULES || !data) return [];
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
