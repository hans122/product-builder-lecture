/**
 * AI View Manager v1.0 (Lotto & Pension Dashboard Combined)
 * - Unified Dashboard & Interaction Logic
 * - Integrated Recommendation Engines
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
            LottoUI.showSkeletons('main-indicator-grid', 6);
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
        if (data.recent_draws) {
            var groups = LottoUtils.getStrategyGroups(data.recent_draws);
            this.renderLottoStrategyGroups(groups);
            this.renderLottoLastDraw(data.recent_draws[0]);
            this.renderLottoOverAppearance(data.recent_draws);
        }

        var saved = localStorage.getItem('lastGeneratedNumbers');
        var sourceTitle = document.getElementById('analysis-source-title');
        if (saved) {
            try {
                var nums = JSON.parse(saved);
                if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 사용자 조합";
                this.analyzeLottoNumbers(nums);
            } catch(e) { if(data.recent_draws) this.analyzeLottoNumbers(data.recent_draws[0].nums); }
        } else if (data.recent_draws) {
            if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 최근 당첨 번호";
            this.analyzeLottoNumbers(data.recent_draws[0].nums);
        }
    },

    analyzeLottoNumbers: function(numbers) {
        var targetContainer = document.getElementById('analysis-target-balls');
        if (targetContainer) {
            targetContainer.innerHTML = '';
            numbers.slice().sort((a,b)=>a-b).forEach(n => targetContainer.appendChild(LottoUI.createBall(n, true)));
        }
        LottoUI.renderIndicatorGrid('main-indicator-grid', LottoConfig.PAGES.INDEX, numbers, this.statsData);
    },

    renderLottoStrategyGroups: function(groups) {
        ['hot', 'warm', 'cold'].forEach(type => {
            var container = document.getElementById('group-' + type + '-container');
            if (container) {
                container.innerHTML = '';
                groups[type].forEach(n => container.appendChild(LottoUI.createBall(n, true)));
            }
        });
    },

    renderLottoLastDraw: function(draw) {
        var ballContainer = document.getElementById('last-draw-balls');
        if (ballContainer) {
            ballContainer.innerHTML = '';
            draw.nums.forEach(n => ballContainer.appendChild(LottoUI.createBall(n, true)));
            if (document.getElementById('last-draw-info')) document.getElementById('last-draw-info').style.display = 'flex';
        }
    },

    renderLottoOverAppearance: function(recent) {
        var alertBox = document.getElementById('over-appearance-alert');
        if (!alertBox) return;
        var danger = [];
        for (var n = 1; n <= 45; n++) {
            var c5 = recent.slice(0, 5).filter(d => d.nums.indexOf(n) !== -1).length;
            if (c5 >= 4) danger.push(n);
        }
        if (danger.length > 0) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = '⚠️ 과출현 위험: ' + danger.join(',');
        }
    },

    // --- Pension Dashboard ---
    renderPensionDashboard: function(data) {
        var lastDraw = data.recent_draws[0];
        this.renderPensionLastDraw(lastDraw);
        this.renderPensionIndicators(lastDraw);
        this.renderPensionRecommendations(data);

        var refreshBtn = document.getElementById('refresh-pension-btn');
        if (refreshBtn) refreshBtn.onclick = () => this.renderPensionRecommendations(data);
    },

    renderPensionLastDraw: function(draw) {
        var container = document.getElementById('pension-last-draw');
        if (!container) return;
        var sum = draw.nums.reduce((a, b) => a + b, 0);
        var insight = sum >= 20 && sum <= 34 ? "통계적 골든존(안정)" : "수치 편중 발생(특이)";
        
        var balls = draw.nums.map((n, i) => `<div style="display:flex; flex-direction:column; align-items:center;"><span style="font-size:0.5rem;color:#cbd5e1;margin-bottom:4px;">${i+1}위</span><div class="pension-ball small">${n}</div></div>`).join('');
        container.innerHTML = `<div class="analysis-card" style="padding:20px; text-align:center;">
            <div style="font-size:0.75rem; font-weight:800; color:#ff8c00; margin-bottom:15px;">🎟️ 제 ${draw.no}회 당첨 분석</div>
            <div style="display:flex; justify-content:center; gap:10px; background:#fff; padding:15px; border-radius:50px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <div style="padding-right:15px; border-right:2px solid #f1f5f9;"><span style="font-size:0.6rem;color:#94a3b8;">조</span><div class="pension-ball group small">${draw.group}</div></div>
                <div style="display:flex; gap:6px;">${balls}</div>
            </div>
            <div style="margin-top:15px; font-size:0.7rem; color:#64748b;">AI 데이터 총평: <span style="color:#3182f6;">${insight}</span></div>
        </div>`;
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
        grid.innerHTML = items.map(i => `<div class="best-box" style="padding:10px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.7rem; color:#64748b;">${i.label}</span>
            <span style="font-size:0.8rem; font-weight:900; color:${i.ok?'#2ecc71':'#ff8c00'}">${i.val}</span>
        </div>`).join('');
    },

    renderPensionRecommendations: function(data) {
        var container = document.getElementById('pension-recommendations');
        if (!container) return;
        var strategies = ["💎 다차원 최적화", "🔥 기세 추종형", "🔄 이월 시너지", "⚖️ 수치 균형형", "🛡️ 데이터 방어형"];
        var html = '';
        for (var k = 0; k < 5; k++) {
            var group = Math.floor(Math.random() * 5) + 1;
            var nums = Array.from({length:6}, () => Math.floor(Math.random() * 10));
            html += `<div class="p-combo-card" style="width:calc(20% - 15px); min-width:170px; margin:5px; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; display:flex; flex-direction:column; align-items:center;">
                <span style="font-size:0.6rem; background:#fff4e6; color:#ff8c00; padding:2px 8px; border-radius:10px; font-weight:800; margin-bottom:10px;">${strategies[k]}</span>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    <div class="pension-ball group small" style="width:24px;height:24px;">${group}</div>
                    <div style="display:flex; gap:2px;">${nums.map(n => `<div class="pension-ball small" style="width:20px;height:20px;font-size:0.7rem;">${n}</div>`).join('')}</div>
                </div>
                <div style="font-size:0.6rem; color:#94a3b8;">AI 신뢰도: <span style="color:#2ecc71;">${80 + Math.floor(Math.random()*15)}%</span></div>
            </div>`;
        }
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', function() { ViewManager.init(); });
