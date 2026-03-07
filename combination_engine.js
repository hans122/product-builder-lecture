'use strict';

/**
 * AI Combination Engine v2.0 (Expert Hierarchy Edition)
 * - Highlights Critical Failures (Danger) at the top
 * - Unified Logic for Lotto & Pension
 * - Adaptive Visual Hierarchy for better readability
 */

var CombinationEngine = {
    isPension: false,
    statsData: null,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) { self.statsData = data; self.renderSelection(); }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) { self.statsData = data; self.renderSelection(); }
            });
        }
    },

    renderSelection: function() {
        var raw = localStorage.getItem(this.isPension ? 'lastGeneratedPension' : 'lastGeneratedNumbers');
        if (!raw) return;
        var data = JSON.parse(raw);
        var nums = this.isPension ? data.digits : data;
        
        var container = document.getElementById(this.isPension ? 'p-analysis-report' : 'lotto-analysis-report');
        if (!container) return;

        // Run Simulation & Synergy Analysis
        var sim = LottoAI.runMonteCarlo(nums, this.isPension, this.statsData);
        
        if (this.isPension) {
            this.renderPensionReport(container, nums, sim);
        } else {
            this.renderLottoReport(container, nums, sim);
        }
    },

    /** [v32.4] 로또 리포트 (치명적 결함 우선 분석) */
    renderLottoReport: function(container, nums, sim) {
        container.innerHTML = '';
        var sortedNums = nums.slice().sort((a,b)=>a-b);
        var stats = this.statsData.stats_summary || {};
        var dists = this.statsData.distributions || {};
        
        var activeIndicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.combination);
        var results = activeIndicators.map(cfg => {
            var ctx = { last_3_draws: (this.statsData.recent_draws || []).slice(0, 3).map(d => d.nums), recent_draws: this.statsData.recent_draws };
            var val = cfg.calc(sortedNums, ctx);
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            var tip = LottoConfig.LOTTO_TIPS[cfg.id] || '정상 범위 내 조합입니다.';
            var zone = LottoUtils.calculateZoneInfo(stats[cfg.statKey], dists[cfg.distKey], cfg);
            if (zone && tip.includes('{safe}')) tip = tip.replace('{safe}', zone.safe);
            return { cfg: cfg, val: val, status: status, tip: tip };
        });

        // 1. 치명적 결함 강조
        var dangers = results.filter(r => r.status === 'danger');
        if (dangers.length > 0) {
            var dBox = document.createElement('div');
            dBox.style.cssText = 'background:#fff5f5; border:2px solid #feb2b2; border-radius:12px; padding:20px; margin-bottom:25px;';
            dBox.innerHTML = `<div style="color:#c53030; font-weight:900; margin-bottom:12px;">⚠️ 치명적 불균형 요소 (${dangers.length}건)</div>` +
                dangers.map(d => `<div style="display:flex; justify-content:space-between; background:white; padding:10px; border-radius:8px; margin-bottom:8px; border-left:4px solid #f56565;">
                    <div style="font-size:0.8rem;"><b>${d.cfg.label}</b><br><small style="color:#718096;">${d.tip}</small></div>
                    <div style="text-align:right;"><span style="color:#e53e3e; font-weight:900; font-size:1.1rem;">${d.val}</span><br><small style="color:#fc8181;">위험</small></div>
                </div>`).join('');
            container.appendChild(dBox);
        }

        // 2. 시너지 리포트
        var synergy = LottoSynergy.check(sortedNums, this.statsData);
        if (synergy.length > 0) {
            var sDiv = document.createElement('div');
            sDiv.style.marginBottom = '20px';
            sDiv.innerHTML = LottoUI.renderSynergyReport(synergy);
            container.appendChild(sDiv);
        }

        // 3. 상세 지표 테이블
        var table = document.createElement('table');
        table.className = 'results-table';
        table.innerHTML = `<thead><tr><th>항목</th><th>수치</th><th>상태</th><th>통계적 의견</th></tr></thead><tbody></tbody>`;
        var tbody = table.querySelector('tbody');
        container.appendChild(table);

        results.forEach(r => {
            var tr = document.createElement('tr');
            var sLab = r.status === 'safe' ? '세이프' : (r.status === 'warning' ? '주의' : '위험');
            tr.innerHTML = `<td><strong>${r.cfg.label}</strong></td><td><span style="font-weight:900;">${r.val}</span></td><td><span class="status-badge ${r.status}">${sLab}</span></td><td class="text-left" style="font-size:0.75rem;">${r.tip}</td>`;
            tbody.appendChild(tr);
        });

        // 4. 기댓값 및 조화도
        var harmony = LottoAI.checkCorrelationHarmony(sortedNums, this.statsData);
        var prob = LottoAI.calculateWinProbability(sortedNums, false, this.statsData);
        
        var trH = document.createElement('tr');
        trH.innerHTML = `<td><strong>🔗 지표 조화도</strong></td><td>${harmony.score}</td><td><span class="status-badge ${harmony.score>0?'safe':'warning'}">Sync</span></td><td class="text-left" style="font-size:0.75rem;">${harmony.violations.length>0?harmony.violations.join(', '):'완벽한 통계적 조화'}</td>`;
        tbody.appendChild(trH);

        var trP = document.createElement('tr');
        trP.innerHTML = `<td><strong>📈 당첨 기댓값</strong></td><td><span style="color:var(--primary-blue); font-weight:900;">${prob.multiplier}배</span></td><td><span class="status-badge safe">PROB</span></td><td class="text-left" style="font-size:0.75rem;">무작위 조합 대비 <b>${prob.multiplier}배</b> 높은 확률 (신뢰도 ${prob.confidence}%)</td>`;
        tbody.appendChild(trP);

        // 스코어 갱신 (v32.10 가중치 반영 연동)
        var finalScore = LottoAI.calculateTotalScore(sim.score, synergy, results) + harmony.score;
        var gradeInfo = LottoAI.getGrade(finalScore);
        document.getElementById('combination-score').innerText = finalScore;
        var gEl = document.getElementById('combination-grade'), cEl = document.getElementById('grade-comment');
        if (gEl) gEl.innerText = gradeInfo.grade + '등급';
        if (cEl) cEl.innerText = gradeInfo.comment;
    },

    /** [v32.4] 연금 리포트 (고도화) */
    renderPensionReport: function(container, nums, sim) {
        container.innerHTML = '';
        var stats = this.statsData.stats_summary || {};
        var active = LottoConfig.PENSION_INDICATORS.filter(cfg => cfg.visible && cfg.visible.combination);
        
        var results = active.map(cfg => {
            var val = cfg.calc(nums, { last_draw: this.statsData.recent_draws[0]?.nums, recent_draws: this.statsData.recent_draws });
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            var tip = LottoConfig.PENSION_TIPS[cfg.id] || '정상 범위 내 조합입니다.';
            return { cfg: cfg, val: val, status: status, tip: tip };
        });

        // 1. 치명적 결함
        var dangers = results.filter(r => r.status === 'danger');
        if (dangers.length > 0) {
            var dBox = document.createElement('div');
            dBox.style.cssText = 'background:#fffaf0; border:2px solid #feebc8; border-radius:12px; padding:20px; margin-bottom:25px;';
            dBox.innerHTML = `<div style="color:#c05621; font-weight:900; margin-bottom:12px;">⚠️ 연금 밸런스 위험 요소 (${dangers.length}건)</div>` +
                dangers.map(d => `<div style="display:flex; justify-content:space-between; background:white; padding:10px; border-radius:8px; margin-bottom:8px; border-left:4px solid #ed8936;">
                    <div style="font-size:0.8rem;"><b>${d.cfg.label}</b><br><small style="color:#718096;">${d.tip}</small></div>
                    <div style="text-align:right;"><span style="color:#dd6b20; font-weight:900; font-size:1.1rem;">${d.val}</span><br><small style="color:#f6ad55;">위험</small></div>
                </div>`).join('');
            container.appendChild(dBox);
        }

        // 2. 상세 지표 테이블
        var table = document.createElement('table');
        table.className = 'results-table';
        table.innerHTML = `<thead><tr><th>분석 항목</th><th>수치</th><th>상태</th><th>통계적 의견</th></tr></thead><tbody></tbody>`;
        var tbody = table.querySelector('tbody');
        container.appendChild(table);

        results.forEach(r => {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${r.cfg.label}</strong></td><td><b>${r.val}</b></td><td><span class="status-badge ${r.status}">${r.status}</span></td><td class="text-left" style="font-size:0.75rem;">${r.tip}</td>`;
            tbody.appendChild(tr);
        });

        // 3. 기댓값
        var prob = LottoAI.calculateWinProbability(nums, true, this.statsData);
        var trP = document.createElement('tr');
        trP.innerHTML = `<td><strong>📈 당첨 기댓값</strong></td><td><span style="color:#ff8c00; font-weight:900;">${prob.multiplier}배</span></td><td><span class="status-badge safe">PROB</span></td><td class="text-left" style="font-size:0.75rem;">시뮬레이션 결과 <b>${prob.multiplier}배</b> 높은 기댓값</td>`;
        tbody.appendChild(trP);
    }
};

document.addEventListener('DOMContentLoaded', () => CombinationEngine.init());
