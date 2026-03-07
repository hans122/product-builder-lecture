'use strict';

/**
 * AI UI Component Library v2.1 (Stability & Full Compatibility)
 * - Organized by functional categories
 * - Fixed internal binding issues
 * - Restored missing Table components
 */

var LottoUI = {
    /** [지표 및 대시보드 컴포넌트] */
    Indicator: {
        renderGrid: function(containerId, indicatorIds, numbers, statsData) {
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
                var displayLabel = (isPension ? 'P' : '') + LottoUtils.padLeft(idx + 1, 2, '0') + ') ' + config.label;
                var card = document.createElement('div');
                card.className = 'indicator-item';
                card.style.cssText = 'padding: 15px; border-radius: 16px; background: #f8fafc; border: 1px solid #edf2f7; display: flex; flex-direction: column; gap: 4px;';
                
                card.innerHTML = `
                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">${displayLabel}</span>
                    <div style="display: flex; align-items: baseline; gap: 2px;">
                        <span style="font-size: 1.2rem; font-weight: 900; color: ${status === 'danger' ? '#f04452' : (status === 'warning' ? '#ff9500' : '#191f28')}">${value}</span>
                        <span style="font-size: 0.7rem; color: #8b95a1; font-weight: 600;">${config.unit || ''}</span>
                    </div>
                    <div class="status-badge ${status}" style="margin-top: 5px; width: fit-content;">${status === 'safe' ? '세이프' : (status === 'warning' ? '주의' : '위험')}</div>
                `;
                container.appendChild(card);
            });
        }
    },

    /** [구슬 컴포넌트] */
    Ball: {
        create: function(num, options) {
            var opts = options || {};
            var ball = document.createElement('div');
            var colorClass = LottoUtils.getBallColorClass(num);
            ball.className = 'ball ' + (opts.mini ? 'mini ' : '') + colorClass;
            ball.innerText = num;
            if (opts.style) ball.style.cssText += opts.style;
            return ball;
        },
        createPension: function(num, options) {
            var opts = options || {};
            var ball = document.createElement('div');
            var color = num >= 5 ? 'blue' : 'yellow';
            ball.className = 'pension-ball ' + (opts.small ? 'small ' : '') + color;
            ball.innerText = num;
            return ball;
        }
    },

    /** [차트 및 시각화] */
    Chart: {
        curve: function(containerId, distData, unit, stat, config) {
            var container = document.getElementById(containerId);
            if (!container) return;
            var self = LottoUI.Chart;
            
            // [v32.94] IntersectionObserver 감지 로직 개선
            if ('IntersectionObserver' in window) {
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        // 1%만 보여도 즉시 렌더링 시작
                        if (entry.isIntersecting || entry.intersectionRatio > 0) {
                            self._renderCurve(container, distData, unit, stat, config);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.01, rootMargin: '50px' });
                observer.observe(container);
                
                // 지연 실행 안전장치: 2초 후에도 안 그려졌으면 강제 실행
                setTimeout(function() {
                    if (container.innerHTML === '') self._renderCurve(container, distData, unit, stat, config);
                }, 2000);
            } else {
                self._renderCurve(container, distData, unit, stat, config);
            }
        },
        _renderCurve: function(container, distData, unit, stat, config) {
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
            var scaleX = (w - sidePadding * 2) / (maxX - minX);
            var scaleY = (h - padding - bottomSpace) / (Math.max.apply(null, points.map(function(p){return p.y;})) || 1);
            
            var getX = function(v) { return sidePadding + (v - minX) * scaleX; };
            var getY = function(v) { return (h - bottomSpace) - v * scaleY; };
            var pathD = "M " + points.map(function(p) { return getX(p.x).toFixed(1) + "," + getY(p.y).toFixed(1); }).join(" L ");
            
            var svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; overflow:visible;">
                <defs><pattern id="h-green" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.2" stroke-opacity="0.4"/></pattern></defs>
                <rect x="${getX(mean-std)}" y="${padding}" width="${getX(mean+std)-getX(mean-std)}" height="${h-bottomSpace-padding}" fill="url(#h-green)" fill-opacity="0.6"/>
                <path d="${pathD}" fill="none" stroke="#3182f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="${sidePadding}" y1="${h-bottomSpace}" x2="${w-sidePadding}" y2="${h-bottomSpace}" stroke="#e5e8eb" stroke-width="1"/>
                ${[{v:mean-2*std, l:'2.5%'}, {v:mean, l:config.label}, {v:mean+2*std, l:'97.5%'}].map(function(l) {
                    var val = LottoUtils.round(Math.max(l.v, dataMin), unit==='개'?0:1);
                    return `<g>
                        <text x="${getX(l.v)}" y="${h-bottomSpace+18}" text-anchor="middle" font-size="8.5" font-weight="900" fill="#1e293b">${val}${unit}</text>
                        <text x="${getX(l.v)}" y="${h-bottomSpace+30}" text-anchor="middle" font-size="7.5" font-weight="700" fill="#94a3b8">${l.l}</text>
                    </g>`;
                }).join('')}
            </svg>`;
            container.innerHTML = svg;
        },
        markov: function(containerId, matrix, options) {
            var container = document.getElementById(containerId);
            if (!container) return;
            var opts = options || {};
            var html = '<div style="display:grid; grid-template-columns: 40px repeat(10, 1fr); gap: 2px;"><div></div>' + Array.from({length:10}, function(_,i) { return `<div style="text-align:center; font-size:0.65rem; font-weight:900; color:#8b95a1;">${i}</div>`; }).join('');
            matrix.forEach(function(row, i) {
                var sum = row.reduce(function(a,b) { return a+b; }, 0);
                html += `<div style="font-size:0.65rem; font-weight:900; color:#8b95a1; display:flex; align-items:center; justify-content:center;">${(opts.rowLabel||'')}${i}</div>`;
                row.forEach(function(val) {
                    var prob = sum > 0 ? (val/sum) : 0;
                    html += `<div style="aspect-ratio:1; background:rgba(${opts.color||'49, 130, 246'}, ${Math.max(0.05, prob * 2)}); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:900;">${val || ''}</div>`;
                });
            });
            container.innerHTML = html + '</div>';
        }
    },

    /** [테이블 컴포넌트] */
    Table: {
        renderMini: function(containerId, recentDraws, config) {
            var container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = recentDraws.map(function(d) {
                var val = config.calc(d.nums);
                var balls = d.nums.map(function(n) { return '<div class="ball mini ' + LottoUtils.getBallColorClass(n) + '">' + n + '</div>'; }).join('');
                return '<tr><td>' + d.no + '회</td><td><div class="ball-container mini">' + balls + '</div></td><td><strong>' + val + '</strong></td></tr>';
            }).join('');
        }
    },

    /** [카드 및 리스트 컴포넌트] */
    Card: {
        combo: function(res, options) {
            var opts = options || {};
            var card = document.createElement('div');
            card.className = 'combo-card';
            card.style.cssText = 'position:relative; cursor:pointer; transition:all 0.2s; background:white; border-radius:16px; border:1px solid #f1f5f9; padding:20px;';
            
            var ballsHtml = res.nums.map(function(n) { return LottoUI.Ball.create(n, { mini: true }).outerHTML; }).join('');
            var score = res.score || res.synergyScore || 0;
            var isArchived = !!res.timestamp;
            var saveBtnId = 'sbtn-' + Math.random().toString(36).substr(2, 5);

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:0.65rem; font-weight:800; color:#3182f6; background:#3182f615; padding:2px 8px; border-radius:6px;">${res.strategy?.label || 'AI 추천'}</span>
                            <div id="${saveBtnId}" style="font-size:0.6rem; font-weight:900; padding:2px 8px; border-radius:20px; border:1px solid #3182f6; color:${isArchived?'white':'#3182f6'}; background:${isArchived?'#3182f6':'white'};">${isArchived?'⭐ SAVED':'⭐ 보관하기'}</div>
                        </div>
                        <span style="font-size:0.7rem; font-weight:700;">AI 시너지 ${score}pt</span>
                    </div>
                </div>
                <div class="ball-container" style="display:flex; gap:6px; justify-content:center; margin-bottom:12px;">${ballsHtml}</div>
                <div style="font-size:0.75rem; color:#4e5968; text-align:center; min-height:34px;">${res.strategy?.desc || ''}</div>
            `;

            setTimeout(function() {
                var btn = card.querySelector('#' + saveBtnId);
                if (btn && !isArchived) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        if (window.PredictionEngine) PredictionEngine.saveToArchive([res]);
                        btn.style.background = '#3182f6'; btn.style.color = 'white'; btn.innerText = '⭐ SAVED';
                        LottoUI.Feedback.toast('AI 보관소에 저장되었습니다.');
                    };
                }
            }, 50);
            return card;
        }
    },

    /** [사용자 피드백 및 알림] */
    Feedback: {
        toast: function(message, actionLabel, actionCallback) {
            var existing = document.querySelector('.ai-toast-container');
            if (existing) existing.remove();

            var container = document.createElement('div');
            container.className = 'ai-toast-container';
            container.style.cssText = 'position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:rgba(25,31,40,0.95); color:white; padding:14px 24px; border-radius:16px; font-size:0.9rem; font-weight:700; z-index:10000; display:flex; align-items:center; gap:20px; box-shadow:0 8px 24px rgba(0,0,0,0.2); animation: fadeInUp 0.3s;';
            container.innerHTML = `<span>${message}</span>`;

            if (actionLabel && actionCallback) {
                var btn = document.createElement('button');
                btn.innerText = actionLabel;
                btn.style.cssText = 'background:none; border:none; color:#3182f6; font-weight:900; cursor:pointer;';
                btn.onclick = function() { actionCallback(); container.remove(); };
                container.appendChild(btn);
            }

            document.body.appendChild(container);
            setTimeout(function() { if(container.parentNode) { container.style.animation = 'fadeOutDown 0.3s forwards'; setTimeout(function() { if(container.parentNode) container.remove(); }, 300); } }, 4000);
        },
        tooltip: function(target, text) {
            if (!target) return;
            target.addEventListener('mouseenter', function() {
                var tip = document.createElement('div');
                tip.className = 'ai-tip';
                tip.style.cssText = 'position:fixed; background:#1e293b; color:white; padding:8px 12px; border-radius:8px; font-size:0.7rem; z-index:10000; pointer-events:none;';
                tip.innerHTML = text;
                document.body.appendChild(tip);
                var rect = target.getBoundingClientRect();
                tip.style.left = (rect.left + rect.width/2 - tip.offsetWidth/2) + 'px';
                tip.style.top = (rect.top - tip.offsetHeight - 10) + 'px';
                target._tip = tip;
            });
            target.addEventListener('mouseleave', function() { if(target._tip) { target._tip.remove(); target._tip = null; } });
        }
    }
};

// [v2.1 Full Compatibility Aliases]
LottoUI.createBall = LottoUI.Ball.create;
LottoUI.createComboCard = LottoUI.Card.combo;
LottoUI.showToast = LottoUI.Feedback.toast;
LottoUI.attachTooltip = LottoUI.Feedback.tooltip;
LottoUI.createCurveChart = LottoUI.Chart.curve;
LottoUI.renderMarkovHeatmap = LottoUI.Chart.markov;
LottoUI.renderMiniTable = LottoUI.Table.renderMini;
LottoUI.renderIndicatorGrid = LottoUI.Indicator.renderGrid;
LottoUI.showSkeletons = function(containerId, count) {
    var container = document.getElementById(containerId);
    if (container) container.innerHTML = '<div class="skeleton-pulse" style="height:100px; background:#f2f4f6; border-radius:12px;"></div>';
};
