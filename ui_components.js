'use strict';

/**
 * AI UI Component Library v1.0
 * - Reusable UI elements for Lotto & Pension
 * - Modern FinTech Design standard
 */

var LottoUI = {
    /** 1. 구슬 컴포넌트 */
    createBall: function(num, options) {
        var opts = options || {};
        var ball = document.createElement('div');
        var colorClass = LottoUtils.getBallColorClass(num);
        ball.className = 'ball ' + (opts.isMini ? 'mini ' : '') + colorClass;
        if (opts.className) ball.className += ' ' + opts.className;
        ball.innerText = num;
        if (opts.style) ball.style.cssText += opts.style;
        return ball;
    },

    /** 2. 연금 구슬 컴포넌트 */
    createPensionBall: function(num, options) {
        var opts = options || {};
        var ball = document.createElement('div');
        var color = num >= 5 ? 'blue' : 'yellow';
        ball.className = 'pension-ball ' + (opts.isMini ? 'small ' : '') + color;
        ball.innerText = num;
        return ball;
    },

    /** 3. 조합 분석 카드 컴포넌트 */
    createComboCard: function(res, options) {
        var opts = options || {};
        var card = document.createElement('div');
        card.className = 'combo-card';
        
        var ballsHtml = res.nums.map(n => {
            var b = this.createBall(n, { isMini: true });
            if (opts.anchor === n) b.style.boxShadow = '0 0 0 3px var(--primary-blue)';
            return b.outerHTML;
        }).join('');

        card.innerHTML = `
            <div class="combo-rank">${res.strategy.label}</div>
            <div class="ball-container">${ballsHtml}</div>
            <div class="combo-meta">신뢰도 <b>${res.confidence}%</b> | 합계 ${res.sum}</div>
            <div class="combo-desc">${res.strategy.desc}</div>
            <div class="analyze-badge">정밀 분석 ➔</div>
        `;
        return card;
    },

    /** 4. AI 심층 진단 리포트 (GL0) */
    renderSynergyReport: function(results) {
        if (!results || results.length === 0) return '';
        var html = results.map(s => `
            <div class="synergy-item" style="margin-bottom:8px; padding:12px; border-radius:12px; border-left:4px solid ${s.status === 'danger' ? '#f04452' : '#3182f6'}; background:${s.status === 'danger' ? '#fef2f2' : '#f0f7ff'};">
                <div style="font-size:0.8rem; font-weight:900; color:${s.status === 'danger' ? '#f04452' : '#3182f6'}; margin-bottom:4px;">[GL0] ${s.label}</div>
                <div style="font-size:0.75rem; color:#4e5968; line-height:1.5;">${s.desc}</div>
            </div>
        `).join('');
        
        return `
            <div class="ai-deep-report" style="padding:20px; background:white; border-radius:16px;">
                <div style="font-size:0.9rem; font-weight:800; color:#191f28; margin-bottom:15px;">🔍 AI 심층 진단 리포트</div>
                ${html}
            </div>
        `;
    }
};
