'use strict';

/**
 * LottoCore Hub v3.1 (Guardian Integrated)
 * - LottoGuardian: Dependency & Legacy Call Protection
 * - LottoStorage: Unified Data Access
 * - LottoDataManager: Reliable Data Loading
 */

/** [가디언] 시스템 무결성 보호기 */
var LottoGuardian = {
    REQUIRED_MODULES: ['LottoUtils', 'LottoConfig', 'LottoStorage', 'LottoUI'],
    
    /** 모듈 의존성 검사 */
    checkDependencies: function() {
        var missing = [];
        this.REQUIRED_MODULES.forEach(function(m) {
            if (typeof window[m] === 'undefined') missing.push(m);
        });
        if (missing.length > 0) {
            var msg = "⚠️ 필수 시스템 모듈 누락: " + missing.join(', ') + "\n새로고침이 필요합니다.";
            console.error(msg);
            // 페이지 상단에 경고 바 표시
            this.showSystemError(msg);
            return false;
        }
        return true;
    },

    /** 구버전 호출 자동 대응 (Proxy) */
    initLegacyProxy: function() {
        if (typeof window.Proxy === 'undefined' || !window.LottoUI) return;

        // LottoUI에 대한 프록시 설정
        var legacyMap = {
            'renderMiniTable': 'Table.renderMini',
            'createCurveChart': 'Chart.curve',
            'renderMarkovHeatmap': 'Chart.markov',
            'createComboCard': 'Card.combo',
            'createBall': 'Ball.create',
            'showToast': 'Feedback.toast',
            'attachTooltip': 'Feedback.tooltip'
        };

        var self = this;
        window.LottoUI = new Proxy(window.LottoUI, {
            get: function(target, prop) {
                if (prop in target) return target[prop];
                
                // 구버전 함수 호출 시 신규 경로로 연결 및 경고
                if (legacyMap[prop]) {
                    var newPath = legacyMap[prop].split('.');
                    var fn = target[newPath[0]][newPath[1]];
                    console.warn(`[Guardian] Deprecated: LottoUI.${prop} -> LottoUI.${legacyMap[prop]} (자동 전환됨)`);
                    return fn;
                }
                return undefined;
            }
        });
    },

    showSystemError: function(msg) {
        var errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed; top:0; left:0; right:0; background:#f04452; color:white; padding:10px; text-align:center; z-index:99999; font-weight:bold; font-size:0.85rem;';
        errDiv.innerHTML = msg + ' <button onclick="location.reload()" style="background:white; color:#f04452; border:none; padding:2px 10px; border-radius:4px; margin-left:10px; cursor:pointer;">새로고침</button>';
        document.body.appendChild(errDiv);
    }
};

var LottoStorage = {
    KEYS: {
        LOTTO_ARCHIVE: 'lotto_ai_archive',
        LOTTO_POOL: 'lotto_system_pool',
        PENSION_ARCHIVE: 'pension_ai_archive',
        PENSION_POOL: 'pension_system_pool',
        CONSENT: 'lotto_consent_given'
    },
    get: function(key) { try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch(e) { return []; } },
    set: function(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
    pushUnique: function(key, items, limit, sortBy) {
        var list = this.get(key);
        items.forEach(function(newItem) {
            var isDup = list.some(function(existing) { return JSON.stringify(existing.nums.slice().sort()) === JSON.stringify(newItem.nums.slice().sort()); });
            if (!isDup) { if (!newItem.timestamp) newItem.timestamp = Date.now(); list.unshift(newItem); }
        });
        if (sortBy) list.sort(sortBy);
        if (limit) list = list.slice(0, limit);
        this.set(key, list);
        return list;
    },
    remove: function(key, nums) {
        var list = this.get(key);
        var numsStr = JSON.stringify(nums.slice().sort());
        var filtered = list.filter(function(item) { return JSON.stringify(item.nums.slice().sort()) !== numsStr; });
        this.set(key, filtered);
        return filtered;
    },
    clear: function(key) { localStorage.removeItem(key); }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    SYSTEM_VERSION: '22.30',
    getStats: function(cb) { this._load('advanced_stats.json', 'lotto', cb); },
    getPensionStats: function(cb) { this._load('pension_stats.json', 'pension', cb); },
    _load: function(url, type, cb) {
        if (this.cache[type]) { cb(this.cache[type]); return; }
        var self = this;
        fetch(url + '?v=' + this.SYSTEM_VERSION + '_' + Math.floor(Date.now()/100000), { cache: 'no-cache' })
            .then(function(res) { if (!res.ok) throw new Error(res.status); return res.json(); })
            .then(function(data) { self.cache[type] = data; cb(data); })
            .catch(function(err) { 
                console.error('[LottoCore] Load Failed:', url, err); 
                LottoGuardian.showSystemError("⚠️ 데이터 로드 실패. 서버 상태를 확인하세요.");
                cb(null); 
            });
    }
};

var LottoEvents = {
    _listeners: {},
    on: function(evt, fn) { if(!this._listeners[evt]) this._listeners[evt] = []; this._listeners[evt].push(fn); },
    emit: function(evt, data) { if(this._listeners[evt]) this._listeners[evt].forEach(function(fn) { fn(data); }); }
};

document.addEventListener('DOMContentLoaded', function() {
    // 가디언 작동 시작
    LottoGuardian.initLegacyProxy();
    LottoGuardian.checkDependencies();
});
