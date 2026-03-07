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

/** [개인정보 및 쿠키 관리자] */
var PrivacyManager = {
    init: function() {
        var consent = localStorage.getItem(LottoStorage.KEYS.CONSENT);
        if (!consent) {
            this.showConsentBanner();
        }
    },
    showConsentBanner: function() {
        if (document.getElementById('ai-consent-banner')) return;
        var banner = document.createElement('div');
        banner.id = 'ai-consent-banner';
        banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:rgba(25,31,40,0.98); color:white; padding:15px 20px; z-index:10000; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-top:1px solid #34495e;';
        banner.innerHTML = '<div>🍀 본 사이트는 통계 분석을 위해 쿠키와 로컬 스토리지를 사용합니다. <a href="privacy.html" style="color:#3182f6; text-decoration:underline;">개인정보처리방침</a></div>' +
            '<button onclick="PrivacyManager.accept()" style="background:#3182f6; color:white; border:none; padding:6px 15px; border-radius:6px; font-weight:900; cursor:pointer;">동의 및 시작하기</button>';
        document.body.appendChild(banner);
    },
    accept: function() {
        localStorage.setItem(LottoStorage.KEYS.CONSENT, 'true');
        var banner = document.getElementById('ai-consent-banner');
        if (banner) banner.remove();
        LottoUI.Feedback.toast('동의가 완료되었습니다.');
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
    
    // [v32.95] 전역 에러 핸들러 (Script Error 대응)
    window.onerror = function(msg, url, line, col, error) {
        var isScriptError = msg.toLowerCase().indexOf('script error') > -1;
        if (isScriptError) {
            console.warn('[Guardian] Cross-origin script error suppressed by browser security.');
            return false;
        }
        
        var logMsg = '🛑 [System Error] ' + msg + ' (at ' + (url ? url.split('/').pop() : 'unknown') + ':' + line + ')';
        console.error(logMsg, error);
        
        // 치명적 오류인 경우에만 상단 바 표시 (예: LottoAI 또는 LottoDataManager 실패)
        if (msg.indexOf('LottoAI') > -1 || msg.indexOf('LottoDataManager') > -1) {
            LottoGuardian.showSystemError('⚠️ 시스템 엔진 가동 중 오류가 발생했습니다. 새로고침을 권장합니다.');
        }
        return false;
    };
});
