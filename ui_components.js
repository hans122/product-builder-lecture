'use strict';

/**
 * AI UI Component Library v1.1 (Integrated & Restored)
 * - Reusable UI elements for Lotto & Pension
 * - SVG Curve Charts with Statistical Labels
 * - Skeleton Loading & Markov Heatmaps
 */

var LottoUI = {
    /** 1. 로또 구슬 컴포넌트 */
    createBall: function(num, isMini) {
        var ball = document.createElement('div');
        var colorClass = LottoUtils.getBallColorClass(num);
        ball.className = 'ball ' + (isMini ? 'mini ' : '') + colorClass;
        ball.innerText = num;
        return ball;
    },

    /** 2. 연금 구슬 컴포넌트 */
    createPensionBall: function(num, isSmall) {
        var ball = document.createElement('div');
        var color = num >= 5 ? 'blue' : 'yellow';
        ball.className = 'pension-ball ' + (isSmall ? 'small ' : '') + color;
        ball.innerText = num;
        return ball;
    },

    /** 3. 스켈레톤 로딩 (Pulse 효과) */
    showSkeletons: function(containerId, count) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (var i = 0; i < count; i++) {
            var skel = document.createElement('div');
            skel.className = 'skeleton-card';
            container.appendChild(skel);
        }
    },

    /** 4. 지표 그리드 렌더링 (메인 대시보드용) */
    renderIndicatorGrid: function(containerId, indicatorIds, numbers, statsData) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        var allConfigs = (LottoConfig.INDICATORS || []).concat(LottoConfig.PENSION_INDICATORS || []);
        
        indicatorIds.forEach(function(id, idx) {
            var config = allConfigs.find(function(c) { return c.id === id; });
            if (!config) return;
            var value = config.calc(numbers, statsData);
            var status = 'safe';
            var stat = statsData ? (statsData.stats_summary ? statsData.stats_summary[config.statKey] : null) : null;
            if (stat) status = LottoUtils.getZStatus(value, stat);
            
            var isPension = config.id.startsWith('p-');
            var displayLabel = `${isPension ? 'P' : ''}${LottoUtils.padLeft(idx + 1, 2, '0')}) ${config.label}`;
            var card = document.createElement('div');
            card.className = 'indicator-item';
            card.style.cssText = 'padding: 15px; border-radius: 16px; background: #f8fafc; border: 1px solid #edf2f7; display: flex; flex-direction: column; gap: 4px;';
            
            var label = document.createElement('span');
            label.style.cssText = 'font-size: 0.75rem; color: #64748b; font-weight: 700;';
            label.innerText = displayLabel;
            
            var valBox = document.createElement('div');
            valBox.style.cssText = 'display: flex; align-items: baseline; gap: 2px;';
            var valSpan = document.createElement('span');
            valSpan.style.cssText = 'font-size: 1.2rem; font-weight: 900; color: ' + (status === 'danger' ? '#f04452' : (status === 'warning' ? '#ff9500' : '#191f28'));
            valSpan.innerText = value;
            var unitSpan = document.createElement('span');
            unitSpan.style.cssText = 'font-size: 0.7rem; color: #8b95a1; font-weight: 600;';
            unitSpan.innerText = config.unit || '';
            valBox.appendChild(valSpan); valBox.appendChild(unitSpan);
            
            var statusBadge = document.createElement('div');
            statusBadge.className = 'status-badge ' + status;
            statusBadge.style.cssText = 'margin-top: 5px; width: fit-content;';
            statusBadge.innerText = status === 'safe' ? '세이프' : (status === 'warning' ? '주의' : '위험');
            
            card.appendChild(label); card.appendChild(valBox); card.appendChild(statusBadge);
            container.appendChild(card);
        });
    },

    /** 5. SVG 통계 곡선 차트 */
    createCurveChart: function(containerId, distData, unit, stat, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var self = this;
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    self._renderCurveChart(container, distData, unit, stat, config);
                    observer.disconnect();
                }
            }, { threshold: 0.1 });
            observer.observe(container);
        } else {
            this._renderCurveChart(container, distData, unit, stat, config);
        }
    },

    _renderCurveChart: function(container, distData, unit, stat, config) {
        container.innerHTML = '';
        var w = 300, h = 210, padding = 30, sidePadding = 15, bottomSpace = 55;
        var mean = stat ? stat.mean : 0, std = stat ? stat.std : 1;
        var minX = mean - 3.5 * std, maxX = mean + 3.5 * std;
        var dataKeys = Object.keys(distData).map(Number);
        var dataMin = dataKeys.length > 0 ? Math.min.apply(null, dataKeys) : 0;
        var points = [];
        for (var x = minX; x <= maxX; x += (maxX - minX) / 100) {
            var y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            points.push({ x: x, y: y });
        }
        var maxY = Math.max.apply(null, points.map(function(p) { return p.y; }));
        var scaleX = (w - sidePadding * 2) / (maxX - minX);
        var scaleY = (h - padding - bottomSpace) / (maxY || 1);
        var getX = function(val) { return sidePadding + (val - minX) * scaleX; };
        var getY = function(val) { return (h - bottomSpace) - val * scaleY; };
        var baselineY = h - bottomSpace;
        var pathD = "M " + points.map(function(p) { return getX(p.x).toFixed(1) + "," + getY(p.y).toFixed(1); }).join(" L ");
        var hatching = `<defs><pattern id="h-green" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.2" stroke-opacity="0.4"/><line x1="3" y1="0" x2="3" y2="6" stroke="#2ecc71" stroke-width="1.2" stroke-opacity="0.4"/></pattern><pattern id="h-blue" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1.2" stroke-opacity="0.4"/><line x1="3" y1="0" x2="3" y2="6" stroke="#3182f6" stroke-width="1.2" stroke-opacity="0.4"/></pattern></defs>`;
        var labels = [{ v: mean - 2 * std, l: '2.5%' }, { v: mean, l: (config.label || '') }, { v: mean + 2 * std, l: '97.5%' }];
        var svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; overflow:visible;">${hatching}<rect x="${getX(mean-std)}" y="${padding}" width="${getX(mean+std)-getX(mean-std)}" height="${baselineY-padding}" fill="url(#h-green)" fill-opacity="0.6"/><rect x="${getX(mean-2*std)}" y="${padding}" width="${getX(mean+2*std)-getX(mean-2*std)}" height="${baselineY-padding}" fill="url(#h-blue)" fill-opacity="0.3"/><path d="${pathD}" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="${sidePadding}" y1="${baselineY}" x2="${w-sidePadding}" y2="${baselineY}" stroke="#e5e8eb" stroke-width="1"/>${labels.map(l => { var correctedVal = Math.max(l.v, dataMin); var displayVal = LottoUtils.round(correctedVal, unit==='개'?0:1); return `<g><line x1="${getX(l.v)}" y1="${baselineY}" x2="${getX(l.v)}" y2="${baselineY+8}" stroke="#cbd5e1"/><text x="${getX(l.v)}" y="${baselineY+22}" text-anchor="middle" font-size="10" font-weight="900" fill="#1e293b">${displayVal}${unit}</text><text x="${getX(l.v)}" y="${baselineY+35}" text-anchor="middle" font-size="9" font-weight="700" fill="#8b95a1">${l.l}</text></g>`; }).join('')}</svg>`;
        container.innerHTML = svg;
    },

    /** 6. 미니 히스토리 테이블 */
    renderMiniTable: function(containerId, recentDraws, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = recentDraws.map(function(d) {
            var val = config.calc(d.nums);
            var balls = d.nums.map(function(n) { return '<div class="ball mini ' + LottoUtils.getBallColorClass(n) + '">' + n + '</div>'; }).join('');
            return '<tr><td>' + d.no + '회</td><td><div class="ball-container mini">' + balls + '</div></td><td><strong>' + val + '</strong></td></tr>';
        }).join('');
    },

    /** 7. 마르코프 전이 확률 히트맵 */
    renderMarkovHeatmap: function(containerId, matrix, options) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var opts = options || {};
        var html = '<div style="display:grid; grid-template-columns: 40px repeat(10, 1fr); gap: 2px;"><div></div>' + Array.from({length:10}, function(_,i){ return '<div style="text-align:center; font-size:0.65rem; font-weight:900; color:#8b95a1;">' + i + '</div>'; }).join('');
        matrix.forEach(function(row, i) {
            var sum = row.reduce(function(a,b){ return a+b; }, 0);
            html += '<div style="font-size:0.65rem; font-weight:900; color:#8b95a1; display:flex; align-items:center; justify-content:center;">' + (opts.rowLabel||'') + i + '</div>';
            row.forEach(function(val) {
                var prob = sum > 0 ? (val/sum) : 0;
                var alpha = Math.max(0.05, prob * 2);
                html += '<div style="aspect-ratio:1; background:rgba(' + (opts.color||'49, 130, 246') + ', ' + alpha + '); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:900; color:' + (prob > 0.3 ? 'white' : '#191f28') + ';" title="' + Math.round(prob*100) + '%">' + (val > 0 ? val : '') + '</div>';
            });
        });
        html += '</div>'; container.innerHTML = html;
    },

    /** 8. AI 추천 조합 카드 (v32.60 보관 기능 추가) */
    createComboCard: function(res, options) {
        var opts = options || {};
        var card = document.createElement('div');
        card.className = 'combo-card';
        card.style.cssText = 'position:relative; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; overflow:visible; background:white; border-radius:16px; border:1px solid #f1f5f9; padding:20px;';
        
        var self = this;
        var ballsHtml = res.nums.map(function(n) {
            var b = self.createBall(n, true);
            if (opts.anchor === n) b.style.boxShadow = '0 0 0 3px var(--primary-blue)';
            return b.outerHTML;
        }).join('');
        
        var probHtml = '';
        if (res.prob) {
            var color = res.prob.grade === 'TOP' ? '#f04452' : (res.prob.grade === 'HIGH' ? '#3182f6' : '#64748b');
            probHtml = `<div style="text-align:right;"><div style="font-size:0.9rem; font-weight:900; color:${color}; line-height:1.1;">${res.prob.multiplier}배</div><div style="font-size:0.55rem; color:#94a3b8; font-weight:700;">기댓값</div></div>`;
        }

        var isArchived = res.timestamp ? true : false;
        var saveBtnId = 'save-btn-' + Math.random().toString(36).substr(2, 9);
        var saveBtnHtml = isArchived 
            ? `<div id="${saveBtnId}" class="save-status-badge" style="background:#3182f6; color:white; font-size:0.6rem; font-weight:900; padding:2px 8px; border-radius:20px; display:flex; align-items:center; gap:3px;">⭐ SAVED</div>`
            : `<div id="${saveBtnId}" class="save-action-btn" style="background:white; color:#3182f6; border:1px solid #3182f6; font-size:0.6rem; font-weight:900; padding:2px 8px; border-radius:20px; transition:all 0.2s;">⭐ 보관하기</div>`;

        var ensembleHtml = '';
        if (res.ensembleCount > 1) {
            var isSuper = res.ensembleCount >= 4;
            var style = isSuper ? 'background:linear-gradient(135deg, #ffd700, #ffae00); color:#1a202c; border:1px solid #ffd700; box-shadow:0 2px 6px rgba(255,215,0,0.4);' : 'background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;';
            ensembleHtml = `<div style="position:absolute; top:-10px; left:15px; font-size:0.65rem; padding:2px 10px; border-radius:20px; ${style} font-weight:900; z-index:10; white-space:nowrap;">${isSuper ? '👑 ' : ''}앙상블 +${res.ensembleCount}</div>`;
        }

        var strategyLabel = (res.strategy && res.strategy.label) ? res.strategy.label : (opts.strategy || 'AI 추천');
        var strategyColor = (res.strategy && res.strategy.color) ? res.strategy.color : '#3182f6';

        card.innerHTML = ensembleHtml + `<div class="card-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;"><div style="display:flex; flex-direction:column; gap:4px;"><div style="display:flex; align-items:center; gap:6px;"><span style="font-size:0.65rem; font-weight:800; color:${strategyColor}; background:${strategyColor}15; padding:2px 8px; border-radius:6px; width:fit-content;">${strategyLabel}</span>${saveBtnHtml}</div><span style="font-size:0.7rem; font-weight:700; color:#191f28;">AI 시너지 ${res.synergyScore || res.score || 0}pt</span></div>${probHtml}</div><div class="ball-container" style="display:flex; gap:6px; justify-content:center; margin-bottom:12px;">${ballsHtml}</div><div style="font-size:0.75rem; color:#4e5968; text-align:center; padding:0 10px; min-height:34px; line-height:1.4;">${res.strategy.desc || ''}</div><div class="analyze-badge" style="margin-top:15px; text-align:center; font-size:0.7rem; font-weight:800; color:var(--primary-blue); opacity:0.8;">정밀 분석 리포트 ➔</div>`;

        setTimeout(() => {
            var saveBtn = card.querySelector('#' + saveBtnId);
            if (saveBtn && !isArchived) {
                saveBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (typeof PredictionEngine !== 'undefined' && PredictionEngine.saveToArchive) {
                        PredictionEngine.saveToArchive([res]);
                        saveBtn.style.background = '#3182f6'; saveBtn.style.color = 'white';
                        saveBtn.innerText = '⭐ SAVED'; saveBtn.classList.remove('save-action-btn'); saveBtn.classList.add('save-status-badge');
                        self.showToast('AI 보관소에 저장되었습니다.');
                    }
                });
            }
        }, 50);
        return card;
    },

    /** 9. 토스트 알림 메시지 */
    showToast: function(message) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:rgba(25,31,40,0.9); color:white; padding:12px 24px; border-radius:12px; font-size:0.85rem; font-weight:700; z-index:10000; animation: fadeInUp 0.3s ease-out;';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'fadeOutDown 0.3s ease-in'; setTimeout(() => { if(toast.parentNode) document.body.removeChild(toast); }, 300); }, 2000);
    },

    /** 10. 지능형 통합 툴팁 시스템 */
    attachTooltip: function(targetEl, text) {
        if (!targetEl || !text) return;
        targetEl.style.cursor = 'help';
        var tooltip = document.createElement('div');
        tooltip.className = 'ai-global-tooltip';
        tooltip.style.cssText = 'position:fixed; background:#1e293b; color:white; padding:8px 12px; border-radius:8px; font-size:0.7rem; line-height:1.4; z-index:10000; pointer-events:none; opacity:0; transition:opacity 0.2s; max-width:200px; box-shadow:0 4px 12px rgba(0,0,0,0.15); border:1px solid rgba(255,255,255,0.1);';
        tooltip.innerHTML = text;
        document.body.appendChild(tooltip);
        var show = function(e) {
            var rect = targetEl.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.opacity = '1';
        };
        var hide = function() { tooltip.style.opacity = '0'; };
        targetEl.addEventListener('mouseenter', show);
        targetEl.addEventListener('mouseleave', hide);
        targetEl.addEventListener('click', function(e) { show(e); setTimeout(hide, 3000); });
    }
};
