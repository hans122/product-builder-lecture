'use strict';

/**
 * AI Combination Engine v1.3 (Lotto & Pension Combined)
 * - Refactored to use Unified Logic Engine (LottoAI)
 * - Managed Data Selection & Local Persistence
 */

var CombinationEngine = {
    isPension: false,
    statsData: null,
    state: {
        lotto: { manual: new Set(), auto: new Set() },
        pension: { group: 1, digits: [0, 0, 0, 0, 0, 0] }
    },

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            this.initPensionUI();
            LottoDataManager.getPensionStats(function(data) {
                if (data) self.statsData = data;
            });
        } else {
            this.initLottoUI();
            LottoDataManager.getStats(function(data) {
                if (data) {
                    self.statsData = data;
                    self.loadLottoSelection();
                }
            });
        }
        this.bindGlobalEvents();
    },

    // --- Lotto UI & Logic ---
    initLottoUI: function() {
        var container = document.getElementById('number-selector');
        if (!container) return;
        container.innerHTML = '';
        for (var i = 1; i <= 45; i++) {
            var btn = document.createElement('button');
            btn.className = 'select-ball';
            btn.id = 'select-ball-' + i;
            btn.innerText = i;
            (function(num, self) {
                btn.onclick = function() { self.toggleLottoNumber(num); };
            })(i, this);
            container.appendChild(btn);
        }
    },

    toggleLottoNumber: function(num) {
        var btn = document.getElementById('select-ball-' + num);
        var lotto = this.state.lotto;
        num = Number(num);
        
        if (lotto.manual.has(num)) {
            lotto.manual.delete(num);
            btn.className = 'select-ball';
        } else if (lotto.auto.has(num)) {
            lotto.auto.delete(num);
            btn.className = 'select-ball';
        } else {
            if (lotto.manual.size + lotto.auto.size >= 6) { alert('최대 6개까지만 선택 가능합니다.'); return; }
            lotto.manual.add(num);
            btn.className = 'select-ball selected-manual';
        }
        this.saveLottoSelection();
        this.updateLottoDisplay();
        this.updateLiveStats();
    },

    updateLiveStats: function() {
        var lotto = this.state.lotto;
        var nums = Array.from(lotto.manual).concat(Array.from(lotto.auto)).map(n => Number(n)).sort((a,b)=>a-b);
        var liveBar = document.getElementById('live-status-bar');
        if (!liveBar) return;

        if (nums.length === 0) { liveBar.innerHTML = ''; return; }

        var balance = {
            sum: nums.reduce((a, b) => a + b, 0),
            odd: nums.filter(n => n % 2 !== 0).length,
            low: nums.filter(n => n <= 22).length
        };

        liveBar.innerHTML = `
            <div class="stat-box-mini"><span>총합</span><strong>${balance.sum}</strong></div>
            <div class="stat-box-mini"><span>홀짝</span><strong>${balance.odd}:${nums.length-balance.odd}</strong></div>
            <div class="stat-box-mini"><span>고저</span><strong>${balance.low}:${nums.length-balance.low}</strong></div>
        `;

        if (nums.length === 6) this.analyze();
    },

    updateLottoDisplay: function() {
        var container = document.getElementById('selected-balls');
        var analyzeBtn = document.getElementById('analyze-my-btn');
        if (!container || !analyzeBtn) return;
        
        var total = this.state.lotto.manual.size + this.state.lotto.auto.size;
        if (total === 0) {
            container.innerHTML = '<div class="placeholder">번호를 선택해주세요</div>';
            analyzeBtn.disabled = true; return;
        }

        container.innerHTML = '';
        var all = Array.from(this.state.lotto.manual).concat(Array.from(this.state.lotto.auto)).map(n => Number(n)).sort((a,b) => a-b);
        all.forEach(n => {
            var ball = LottoUI.createBall(n, true);
            if (this.state.lotto.manual.has(n)) ball.classList.add('manual');
            else ball.classList.add('auto');
            container.appendChild(ball);
        });
        analyzeBtn.disabled = (total !== 6);
    },

    // --- Pension UI & Logic ---
    initPensionUI: function() {
        var digitContainer = document.getElementById('digit-selectors-container');
        if (digitContainer) {
            var labels = ['십만', '만', '천', '백', '십', '일'];
            var html = '';
            for (var i = 0; i < 6; i++) {
                var btns = '';
                for (var n = 0; n <= 9; n++) btns += '<button class="wheel-btn" data-pos="' + i + '" data-val="' + n + '">' + n + '</button>';
                html += '<div class="digit-box"><span class="digit-label">' + labels[i] + '</span><div class="digit-wheel" id="digit-' + i + '">' + btns + '</div></div>';
            }
            digitContainer.innerHTML = html;
            this.bindPensionWheels();
        }

        var anchorContainer = document.getElementById('ai-anchor-selector');
        if (anchorContainer) {
            var anchorHtml = '';
            for (var a = 0; a <= 9; a++) anchorHtml += '<button class="sel-btn anchor-btn" data-val="' + a + '">' + a + '</button>';
            anchorContainer.innerHTML = anchorHtml;
            this.bindPensionAnchors();
        }

        var groupBtns = document.querySelectorAll('#group-selector .sel-btn');
        groupBtns.forEach(btn => {
            btn.onclick = () => {
                groupBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.pension.group = parseInt(btn.getAttribute('data-val'));
            };
        });
        if (groupBtns[0]) groupBtns[0].click();
    },

    bindPensionWheels: function() {
        for (var d = 0; d < 6; d++) {
            ((idx) => {
                var btns = document.querySelectorAll('#digit-' + idx + ' .wheel-btn');
                btns.forEach(btn => {
                    btn.onclick = () => {
                        btns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.state.pension.digits[idx] = parseInt(btn.getAttribute('data-val'));
                    };
                });
                if (btns[0]) btns[0].click();
            })(d);
        }
    },

    bindPensionAnchors: function() {
        var btns = document.querySelectorAll('.anchor-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.generatePensionAI(parseInt(btn.getAttribute('data-val')));
            };
        });
    },

    // --- Actions ---
    analyze: function() {
        if (!this.statsData) return;
        var report = document.getElementById(this.isPension ? 'p-report-section' : 'report-section');
        var results = document.getElementById(this.isPension ? 'p-analysis-results' : 'analysis-report-body');
        if (!report || !results) return;

        var nums = this.isPension ? this.state.pension.digits : Array.from(this.state.lotto.manual).concat(Array.from(this.state.lotto.auto)).map(n => Number(n));
        if (nums.length < 6 && !this.isPension) return;

        report.style.display = 'block';
        report.style.opacity = '1';

        // 1. Unified Simulation
        var sim = LottoAI.runMonteCarlo(nums, this.isPension, this.statsData);
        
        if (this.isPension) this.renderPensionReport(results, nums, sim);
        else this.renderLottoReport(results, nums, sim);
    },

    renderLottoReport: function(container, nums, sim) {
        container.innerHTML = '';
        var sortedNums = nums.slice().sort((a,b)=>a-b);
        var stats = this.statsData.stats_summary || {};
        
        // 1. Synergy Report (LottoUI component)
        var synergy = LottoSynergy.check(sortedNums, this.statsData);
        if (synergy.length > 0) {
            var tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4" style="padding:0; border:none;">${LottoUI.renderSynergyReport(synergy)}</td>`;
            container.appendChild(tr);
        }

        // 2. Monte Carlo Row
        var trSim = document.createElement('tr');
        trSim.innerHTML = `<td><strong style="color:var(--primary-blue);">🧬 AI 시뮬레이션</strong></td><td>${sim.hits}회</td><td><span class="status-badge safe">적중도</span></td><td class="text-left">1만 회 가상 추첨 결과, 유의미성 ${sim.score}점 산출</td>`;
        container.appendChild(trSim);

        // 3. Individual Indicators (Automated)
        var indicatorStatuses = [];
        var activeIndicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.combination);
        
        activeIndicators.forEach(cfg => {
            if (!cfg.calc) return;
            var val = cfg.calc(sortedNums, this.statsData);
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            indicatorStatuses.push(status);
            var tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${cfg.label}</strong></td><td>${val}</td><td><span class="status-badge ${status}">${status}</span></td><td class="text-left">${status==='danger'?'희귀 패턴':'정상 범위'}</td>`;
            container.appendChild(tr);
        });

        // 4. Score & Grade Calculation (Unified Engine)
        var finalScore = LottoAI.calculateTotalScore(sim.score, synergy, indicatorStatuses);
        var gradeInfo = LottoAI.getGrade(finalScore);

        document.getElementById('combination-score').innerText = finalScore;
        var gradeEl = document.getElementById('combination-grade'), commentEl = document.getElementById('grade-comment');
        if (gradeEl) gradeEl.innerText = gradeInfo.grade + '등급';
        if (commentEl) commentEl.innerText = gradeInfo.comment;
    },

    renderPensionReport: function(container, nums, sim) {
        if (typeof PensionUtils === 'undefined') { container.innerHTML = '<p>엔진 로딩 중...</p>'; return; }
        container.innerHTML = '';
        var stats = this.statsData.stats_summary || {};
        var activeIndicators = LottoConfig.PENSION_INDICATORS.filter(cfg => cfg.visible && cfg.visible.combination);

        // 1. Monte Carlo Row (Header)
        var gradeInfo = LottoAI.getGrade(sim.score);
        var color = gradeInfo.grade === 'S' ? '#3182f6' : (gradeInfo.grade === 'A' ? '#2ecc71' : '#ff9500');
        
        var headerDiv = document.createElement('div');
        headerDiv.className = 'analysis-card';
        headerDiv.style.cssText = `padding:20px; border:2px solid ${color}33; margin-bottom:15px;`;
        headerDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="width:80px; height:80px; border-radius:50%; border:4px solid ${color}; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:900; color:${color};">${gradeInfo.grade}</div>
                <div><h3 style="margin:0;">AI 스코어: ${sim.score}점</h3><p style="margin:5px 0; font-size:0.8rem; color:#64748b;">1만 회 시뮬레이션 당첨 확률: ${sim.rate}%</p></div>
            </div>
        `;
        container.appendChild(headerDiv);

        // 2. Indicators Table
        var table = document.createElement('table');
        table.className = 'results-table';
        table.innerHTML = `<thead><tr><th>항목</th><th>나의 조합</th><th>상태</th><th>통계적 의견</th></tr></thead><tbody id="p-analysis-table-body"></tbody>`;
        container.appendChild(table);
        
        var tbody = table.querySelector('tbody');
        activeIndicators.forEach(cfg => {
            var val = cfg.calc(nums, { last_draw: this.statsData.recent_draws[0]?.nums });
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            var tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${cfg.label}</strong></td><td>${val}</td><td><span class="status-badge ${status}">${status}</span></td><td class="text-left">${status==='danger'?'희귀 패턴':'정상 범위'}</td>`;
            tbody.appendChild(tr);
        });
    },

    // --- Helpers ---
    saveLottoSelection: function() {
        var data = { manual: Array.from(this.state.lotto.manual), auto: Array.from(this.state.lotto.auto) };
        localStorage.setItem('combination_saved_picks', JSON.stringify(data));
    },
    loadLottoSelection: function() {
        var saved = localStorage.getItem('combination_saved_picks');
        if (!saved) return;
        try {
            var data = JSON.parse(saved);
            if (data && Array.isArray(data.manual)) data.manual.forEach(n => {
                this.state.lotto.manual.add(Number(n));
                var btn = document.getElementById('select-ball-' + n);
                if (btn) btn.className = 'select-ball selected-manual';
            });
            if (data && Array.isArray(data.auto)) data.auto.forEach(n => {
                this.state.lotto.auto.add(Number(n));
                var btn = document.getElementById('select-ball-' + n);
                if (btn) btn.className = 'select-ball selected-auto';
            });
            this.updateLottoDisplay();
            this.updateLiveStats();
        } catch(e) {}
    },
    bindGlobalEvents: function() {
        var self = this;
        document.getElementById('analyze-my-btn')?.addEventListener('click', () => {
            self.analyze();
            document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        document.getElementById('p-analyze-btn')?.addEventListener('click', () => self.analyze());
        document.getElementById('p-random-btn')?.addEventListener('click', () => self.randomizePension());
        document.getElementById('auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(true));
        document.getElementById('semi-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));
        document.getElementById('semi-auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            self.state.lotto.manual.clear(); self.state.lotto.auto.clear();
            document.querySelectorAll('.select-ball').forEach(b => b.className = 'select-ball');
            self.updateLottoDisplay(); self.updateLiveStats();
            var report = document.getElementById('report-section'); if (report) report.style.display = 'none';
        });
    },

    pickLottoNumbers: function(isFullAuto) {
        var lotto = this.state.lotto;
        lotto.auto.clear();
        if (isFullAuto) lotto.manual.clear();
        
        var pool = [];
        for (var i = 1; i <= 45; i++) { if (!lotto.manual.has(i)) pool.push(i); }
        
        while (lotto.manual.size + lotto.auto.size < 6 && pool.length > 0) {
            var picked = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
            lotto.auto.add(Number(picked));
        }
        
        document.querySelectorAll('.select-ball').forEach(btn => {
            var n = Number(btn.innerText);
            if (lotto.manual.has(n)) btn.className = 'select-ball selected-manual';
            else if (lotto.auto.has(n)) btn.className = 'select-ball selected-auto';
            else btn.className = 'select-ball';
        });
        this.saveLottoSelection(); this.updateLottoDisplay(); this.updateLiveStats();
    },

    randomizePension: function() {
        var group = Math.floor(Math.random() * 5) + 1;
        document.querySelector(`#group-selector .sel-btn[data-val="${group}"]`)?.click();
        for (var i = 0; i < 6; i++) {
            var val = Math.floor(Math.random() * 10);
            document.querySelector(`#digit-${i} .wheel-btn[data-val="${val}"]`)?.click();
        }
    },

    generatePensionAI: function(anchor) {
        var container = document.getElementById('ai-pension-recommendations');
        if (!container || !this.statsData) return;
        container.innerHTML = '';
        var matrix = this.statsData.markov_matrix;
        var strategies = [{ id: 'markov', label: '🔥 마르코프 체인', desc: '역방향 전이 확률 최적화' }, { id: 'monte', label: '🧬 몬테카를로', desc: '시뮬레이션 기반 고득점' }];

        strategies.forEach(st => {
            var combo = (st.id === 'markov') ? LottoAI.generateMarkovPension(anchor, matrix) : Array.from({length:6}, (_,i)=>i===5?anchor:Math.floor(Math.random()*10));
            var card = document.createElement('div');
            card.className = 'analysis-card'; card.style.cssText = 'padding:15px; cursor:pointer; text-align:center; transition:all 0.2s; border:1px solid #e2e8f0;';
            var ballsHtml = combo.map((n, idx) => `<div class="pension-ball small" style="width:26px; height:26px; border-radius:50%; background:${idx===5?'#3182f6':'#f1f5f9'}; color:${idx===5?'#fff':'#1e293b'}; border:${idx===5?'none':'1px solid #e2e8f0'}; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800;">${n}</div>`).join('');
            card.innerHTML = `<div style="font-size:0.75rem; font-weight:900; color:#3182f6; margin-bottom:10px;">${st.label}</div><div style="display:flex; gap:4px; justify-content:center; margin-bottom:8px;">${ballsHtml}</div><div style="font-size:0.65rem; color:#94a3b8;">${st.desc}</div>`;
            card.onclick = () => {
                combo.forEach((n, idx) => document.querySelectorAll('#digit-' + idx + ' .wheel-btn')[n]?.click());
                document.getElementById('p-analyze-btn')?.click();
                document.getElementById('p-report-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            container.appendChild(card);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => CombinationEngine.init());
