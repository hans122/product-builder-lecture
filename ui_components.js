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
            // style.css의 .skeleton-card 클래스 사용
            container.appendChild(skel);
        }
    },

    /** 4. 지표 그리드 렌더링 (메인 대시보드용) */
    renderIndicatorGrid: function(containerId, indicatorIds, numbers, statsData) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        indicatorIds.forEach(function(id) {
            var config = LottoConfig.INDICATORS.find(function(c) { return c.id === id; });
            if (!config) return;
            
            var value = config.calc(numbers, statsData);
            var status = 'safe';
            var stat = statsData ? (statsData.stats_summary ? statsData.stats_summary[config.statKey] : null) : null;
            if (stat) {
                status = LottoUtils.getZStatus(value, stat);
            }
            
            var card = document.createElement('div');
            card.className = 'indicator-item';
            card.style.cssText = 'padding: 15px; border-radius: 16px; background: #f8fafc; border: 1px solid #edf2f7; display: flex; flex-direction: column; gap: 4px;';
            
            var label = document.createElement('span');
            label.style.cssText = 'font-size: 0.75rem; color: #64748b; font-weight: 700;';
            label.innerText = config.label;
            
            var valBox = document.createElement('div');
            valBox.style.cssText = 'display: flex; align-items: baseline; gap: 2px;';
            
            var valSpan = document.createElement('span');
            valSpan.style.cssText = 'font-size: 1.2rem; font-weight: 900; color: ' + (status === 'danger' ? '#f04452' : (status === 'warning' ? '#ff9500' : '#191f28'));
            valSpan.innerText = value;
            
            var unitSpan = document.createElement('span');
            unitSpan.style.cssText = 'font-size: 0.7rem; color: #8b95a1; font-weight: 600;';
            unitSpan.innerText = config.unit || '';
            
            valBox.appendChild(valSpan);
            valBox.appendChild(unitSpan);
            
            var statusBadge = document.createElement('div');
            statusBadge.className = 'status-badge ' + status;
            statusBadge.style.cssText = 'margin-top: 5px; width: fit-content;';
            statusBadge.innerText = status === 'safe' ? '세이프' : (status === 'warning' ? '주의' : '위험');
            
            card.appendChild(label);
            card.appendChild(valBox);
            card.appendChild(statusBadge);
            
            container.appendChild(card);
        });
    },

    /** 5. SVG 통계 곡선 차트 (Curve Chart) */
    createCurveChart: function(containerId, distData, unit, stat, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        
        var w = container.clientWidth || 300, h = 200, padding = 30;
        var mean = stat ? stat.mean : 0, std = stat ? stat.std : 1;
        var minX = mean - 3.5 * std, maxX = mean + 3.5 * std;
        
        // 정규 분포 곡선 포인트 생성
        var points = [];
        for (var x = minX; x <= maxX; x += (maxX - minX) / 100) {
            var y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            points.push({ x: x, y: y });
        }
        
        var maxY = Math.max.apply(null, points.map(function(p) { return p.y; }));
        var scaleX = (w - padding * 2) / (maxX - minX);
        var scaleY = (h - padding * 2) / maxY;
        
        var getX = function(val) { return padding + (val - minX) * scaleX; };
        var getY = function(val) { return h - padding - val * scaleY; };
        
        var pathD = "M " + points.map(function(p) { return getX(p.x) + "," + getY(p.y); }).join(" L ");
        
        // 통계적 앵커 라벨 (2.5%, 16%, 50%, 84%, 97.5%)
        var labels = [
            { v: mean - 2 * std, l: '2.5%', p: 1 },
            { v: mean - std, l: '16%', p: 2 },
            { v: mean, l: '50%', p: 3 },
            { v: mean + std, l: '84%', p: 2 },
            { v: mean + 2 * std, l: '97.5%', p: 1 }
        ].sort(function(a,b) { return b.p - a.p; });
        
        var visibleLabels = [];
        labels.forEach(function(lab) {
            var x = getX(lab.v);
            if (visibleLabels.every(function(v) { return Math.abs(getX(v.v) - x) > 45; })) {
                visibleLabels.push(lab);
            }
        });
        
        var hatching = '<defs>' +
            '<pattern id="h-green" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#2ecc71" stroke-width="1" stroke-opacity="0.3"/></pattern>' +
            '<pattern id="h-blue" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#3182f6" stroke-width="1" stroke-opacity="0.3"/></pattern>' +
            '</defs>';
        
        var svg = '<svg width="' + w + '" height="' + h + '" style="overflow:visible;">' + hatching +
            '<rect x="' + getX(mean-std) + '" y="' + padding + '" width="' + (getX(mean+std)-getX(mean-std)) + '" height="' + (h-padding*2) + '" fill="url(#h-green)"/>' +
            '<rect x="' + getX(mean-2*std) + '" y="' + padding + '" width="' + (getX(mean+2*std)-getX(mean-2*std)) + '" height="' + (h-padding*2) + '" fill="url(#h-blue)" fill-opacity="0.5"/>' +
            '<path d="' + pathD + '" fill="none" stroke="var(--primary-blue)" stroke-width="3" stroke-linecap="round"/>' +
            '<line x1="' + padding + '" y1="' + (h-padding) + '" x2="' + (w-padding) + '" y2="' + (h-padding) + '" stroke="#e5e8eb" stroke-width="1"/>' +
            visibleLabels.map(function(l) {
                var displayVal = LottoUtils.round(l.v, 1);
                return '<g><line x1="' + getX(l.v) + '" y1="' + (h-padding) + '" x2="' + getX(l.v) + '" y2="' + (h-padding+5) + '" stroke="#cbd5e1"/>' +
                       '<text x="' + getX(l.v) + '" y="' + (h-10) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#64748b">' + displayVal + ' (' + l.l + ')</text></g>';
            }).join('') +
            '</svg>';
        container.innerHTML = svg;
    },

    /** 6. 미니 히스토리 테이블 (최근 6회차) */
    renderMiniTable: function(containerId, recentDraws, config) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = recentDraws.map(function(d) {
            var val = config.calc(d.nums);
            var balls = d.nums.map(function(n) {
                return '<div class="ball mini ' + LottoUtils.getBallColorClass(n) + '">' + n + '</div>';
            }).join('');
            return '<tr><td>' + d.no + '회</td><td><div class="ball-container mini">' + balls + '</div></td><td><strong>' + val + '</strong></td></tr>';
        }).join('');
    },

    /** 7. 마르코프 전이 확률 히트맵 */
    renderMarkovHeatmap: function(containerId, matrix, options) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var opts = options || {};
        var html = '<div style="display:grid; grid-template-columns: 40px repeat(10, 1fr); gap: 2px;">';
        html += '<div></div>' + Array.from({length:10}, function(_,i){ return '<div style="text-align:center; font-size:0.65rem; font-weight:900; color:#8b95a1;">' + i + '</div>'; }).join('');
        
        matrix.forEach(function(row, i) {
            var sum = row.reduce(function(a,b){ return a+b; }, 0);
            html += '<div style="font-size:0.65rem; font-weight:900; color:#8b95a1; display:flex; align-items:center; justify-content:center;">' + (opts.rowLabel||'') + i + '</div>';
            row.forEach(function(val) {
                var prob = sum > 0 ? (val/sum) : 0;
                var alpha = Math.max(0.05, prob * 2);
                html += '<div style="aspect-ratio:1; background:rgba(' + (opts.color||'49, 130, 246') + ', ' + alpha + '); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:900; color:' + (prob > 0.3 ? 'white' : '#191f28') + ';" title="' + Math.round(prob*100) + '%">' + (val > 0 ? val : '') + '</div>';
            });
        });
        html += '</div>';
        container.innerHTML = html;
    },

    /** 8. AI 추천 조합 카드 */
    createComboCard: function(res, options) {
        var opts = options || {};
        var card = document.createElement('div');
        card.className = 'combo-card';
        var self = this;
        var ballsHtml = res.nums.map(function(n) {
            var b = self.createBall(n, true);
            if (opts.anchor === n) b.style.boxShadow = '0 0 0 3px var(--primary-blue)';
            return b.outerHTML;
        }).join('');
        
        card.innerHTML = '<div class="combo-rank">' + res.strategy.label + '</div>' +
            '<div class="ball-container">' + ballsHtml + '</div>' +
            '<div class="combo-meta">신뢰도 <b>' + res.confidence + '%</b> | 합계 ' + res.sum + '</div>' +
            '<div class="combo-desc">' + res.strategy.desc + '</div>' +
            '<div class="analyze-badge">정밀 분석 ➔</div>';
        return card;
    },

    /** 9. AI 심층 진단 리포트 (GL0) */
    renderSynergyReport: function(results) {
        if (!results || results.length === 0) return '';
        var html = results.map(function(s) {
            var color = s.status === 'danger' ? '#f04452' : '#3182f6';
            var bg = s.status === 'danger' ? '#fef2f2' : '#f0f7ff';
            return '<div class="synergy-item" style="margin-bottom:8px; padding:12px; border-radius:12px; border-left:4px solid ' + color + '; background:' + bg + ';">' +
                '<div style="font-size:0.8rem; font-weight:900; color:' + color + '; margin-bottom:4px;">[GL0] ' + s.label + '</div>' +
                '<div style="font-size:0.75rem; color:#4e5968; line-height:1.5;">' + s.desc + '</div>' +
            '</div>';
        }).join('');
        
        return '<div class="ai-deep-report" style="padding:20px; background:white; border-radius:16px;">' +
            '<div style="font-size:0.9rem; font-weight:800; color:#191f28; margin-bottom:15px;">🔍 AI 심층 진단 리포트</div>' +
            html +
        '</div>';
    }
};
