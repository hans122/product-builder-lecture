'use strict';

/**
 * AI Consent Manager Bridge
 * - Connects View to Core Privacy Logic
 */

(function() {
    function checkConsent() {
        if (typeof PrivacyManager !== 'undefined') {
            PrivacyManager.init();
        } else {
            // Core가 늦게 로드될 경우를 대비해 재시도
            setTimeout(checkConsent, 500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkConsent);
    } else {
        checkConsent();
    }
})();
