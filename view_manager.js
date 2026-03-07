'use strict';

/**
 * AI View Manager v1.1 (Stable Cross-Page Engine)
 * - Fixed Null Reference in showSkeletons
 * - Optimized Pension/Lotto Branching
 * - ES5 Compatibility & Production Stability
 */

var ViewManager = {
    isPension: false,
    statsData: null,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) {
                    self.statsData = data;
                    self.renderPensionDashboard(data);
                }
            });
        } else {
            // 로또 분석 그리드가 있는 페이지에서만 스켈레톤 표시
            if (document.getElementById('main-indicator-grid')) {
                LottoUI.showSkeletons('main-indicator-grid', 6);
            }
            LottoDataManager.getStats(function(data) {
                if (data) {
                    self.statsData = data;
                    self.renderLottoDashboard(data);
                }
            });
        }
    },

    // --- Lotto Dashboard ---
    renderLottoDashboard: function(data) {
        if (!data || !data.recent_draws) return;
        
        var recent = data.recent_draws;
        var lastDraw = recent[0];

        // 1. 기본 정보 렌더링 (LottoAI 통합 분석 엔진 활용)
        var groups = LottoAI.getComplexPools(recent, -1);
        this.renderLottoStrategyGroups(groups);
        this.renderLottoLastDraw(lastDraw);
        this.renderLottoOverAppearance(recent);

        // 2. 분석 대상 선정 및 지표 그리드 출력
        var saved = localStorage.getItem('lastGeneratedNumbers');
        var sourceTitle = document.getElementById('analysis-source-title');
        var targetNumbers = lastDraw.nums;

        if (saved) {
            try {
                var nums = JSON.parse(saved);
                if (Array.isArray(nums) && nums.length === 6) {
                    targetNumbers = nums;
                    if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 사용자 조합";
                }
            } catch(e) {}
        } else {
            if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 최근 당첨 번호";
        }

        this.analyzeLottoNumbers(targetNumbers);
    },

    analyzeLottoNumbers: function(numbers) {
        var targetContainer = document.getElementById('analysis-target-balls');
        if (targetContainer) {
            targetContainer.innerHTML = '';
            var sorted = [].concat(numbers).sort(function(a,b){ return a-b; });
            for (var i = 0; i < sorted.length; i++) {
                targetContainer.appendChild(LottoUI.createBall(sorted[i], true));
            }
        }
        if (document.getElementById('main-indicator-grid')) {
            LottoUI.renderIndicatorGrid('main-indicator-grid', LottoConfig.PAGES.INDEX, numbers, this.statsData);
        }
    },

    renderLottoStrategyGroups: function(groups) {
        var self = this;
        ['hot', 'warm', 'cold'].forEach(function(type) {
            var container = document.getElementById('group-' + type + '-container');
            if (container && groups && groups[type]) {
                container.innerHTML = '';
                var nums = groups[type];
                for (var i = 0; i < nums.length; i++) {
                    container.appendChild(LottoUI.createBall(nums[i], true));
                }
            }
        });
    },

    renderLottoLastDraw: function(draw) {
        var ballContainer = document.getElementById('last-draw-balls');
        if (ballContainer) {
            ballContainer.innerHTML = '';
            for (var i = 0; i < draw.nums.length; i++) {
                ballContainer.appendChild(LottoUI.createBall(draw.nums[i], true));
            }
            if (document.getElementById('last-draw-info')) {
                document.getElementById('last-draw-info').style.display = 'flex';
            }
        }
    },

    renderLottoOverAppearance: function(recent) {
        var alertBox = document.getElementById('over-appearance-alert');
        if (!alertBox) return;
        var danger = [];
        for (var n = 1; n <= 45; n++) {
            var count = 0;
            for (var j = 0; j < 5; j++) {
                if (recent[j].nums.indexOf(n) !== -1) count++;
            }
            if (count >= 4) danger.push(n);
        }
        if (danger.length > 0) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = '⚠️ 과출현 위험: ' + danger.join(',');
        } else {
            alertBox.style.display = 'none';
        }
    },

    // --- Pension Dashboard ---
    renderPensionDashboard: function(data) {
        if (!data || !data.recent_draws) return;
        var lastDraw = data.recent_draws[0];
        this.renderPensionLastDraw(lastDraw);
        this.renderPensionIndicators(lastDraw);
        this.renderPensionBestPicks(data); // 누락된 베스트 픽 렌더링 추가
    },

    renderPensionBestPicks: function(data) {
        var container = document.getElementById('pension-best-digits');
        if (!container || !data.pos_freq) return;
        
        var labels = ['십만', '만', '천', '백', '십', '일'];
        var html = '';
        
        for (var i = 0; i < 6; i++) {
            var freq = data.pos_freq[i];
            // 해당 자리의 빈도순 정렬 (Top 3)
            var sorted = freq.map((f, idx) => ({ num: idx, count: f }))
                             .sort((a, b) => b.count - a.count)
                             .slice(0, 3);
            
            var ballsHtml = sorted.map((item, idx) => {
                var opacity = 1 - (idx * 0.3); // 순위별 투명도 차별화
                return `<div style="display:flex; flex-direction:column; align-items:center; gap:4px; opacity:${opacity};">
                    <div class="pension-ball small ${item.num >= 5 ? 'blue' : 'yellow'}" style="width:26px; height:26px; font-size:0.8rem;">${item.num}</div>
                    <span style="font-size:0.6rem; color:#94a3b8; font-weight:700;">${item.count}회</span>
                </div>`;
            }).join('');

            html += `<div class="best-pick-box" style="background:white; padding:15px; border-radius:12px; border:1px solid #edf2f7; text-align:center;">
                <div style="font-size:0.7rem; font-weight:800; color:#64748b; margin-bottom:10px;">${labels[i]}의 자리</div>
                <div style="display:flex; justify-content:center; gap:8px;">${ballsHtml}</div>
            </div>`;
        }
        container.innerHTML = html;
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        container.style.gap = '12px';
    },

    renderPensionLastDraw: function(draw) {
        var container = document.getElementById('pension-last-draw');
        if (!container) return;
        
        var sum = 0;
        for (var k = 0; k < draw.nums.length; k++) sum += draw.nums[k];
        var insight = (sum >= 20 && sum <= 34) ? "통계적 골든존(안정)" : "수치 편중 발생(특이)";
        
        var ballsHtml = '';
        for (var i = 0; i < draw.nums.length; i++) {
            ballsHtml += '<div style="display:flex; flex-direction:column; align-items:center;">' +
                         '<span style="font-size:0.5rem;color:#cbd5e1;margin-bottom:4px;">' + (i+1) + '위</span>' +
                         '<div class="pension-ball small" style="background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0;">' + draw.nums[i] + '</div></div>';
        }

        container.innerHTML = '<div class="analysis-card" style="padding:20px; text-align:center;">' +
            '<div style="font-size:0.75rem; font-weight:800; color:#ff8c00; margin-bottom:15px;">🎟️ 제 ' + draw.no + '회 당첨 분석</div>' +
            '<div style="display:flex; justify-content:center; gap:10px; background:#fff; padding:15px; border-radius:50px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">' +
                '<div style="padding-right:15px; border-right:2px solid #f1f5f9;"><span style="font-size:0.6rem;color:#94a3b8;">조</span><div class="pension-ball group small">' + draw.group + '</div></div>' +
                '<div style="display:flex; gap:6px;">' + ballsHtml + '</div>' +
            '</div>' +
            '<div style="margin-top:15px; font-size:0.7rem; color:#64748b;">AI 데이터 총평: <span style="color:#3182f6;">' + insight + '</span></div>' +
        '</div>';
    },

    renderPensionIndicators: function(draw) {
        var grid = document.getElementById('pension-indicator-grid');
        if (!grid) return;
        var p = PensionUtils.analyzePatterns(draw.nums);
        var b = PensionUtils.analyzeBalance(draw.nums);
        var items = [
            { label: '합계 점수', val: b.sum, ok: b.sum >= 20 && b.sum <= 34 },
            { label: '홀짝 비율', val: (6 - b.odd) + ':' + b.odd, ok: b.odd >= 2 && b.odd <= 4 },
            { label: '연속 번호', val: p.seq > 0 ? p.seq + '개' : '없음', ok: p.seq < 2 },
            { label: '번호 종류', val: p.unique + '종', ok: p.unique >= 4 }
        ];
        grid.innerHTML = items.map(function(i) {
            return '<div class="best-box" style="padding:10px; display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-size:0.7rem; color:#64748b;">' + i.label + '</span>' +
                '<span style="font-size:0.8rem; font-weight:900; color:' + (i.ok?'#2ecc71':'#ff8c00') + '">' + i.val + '</span>' +
            '</div>';
        }).join('');
    }
};

document.addEventListener('DOMContentLoaded', function() { ViewManager.init(); });
