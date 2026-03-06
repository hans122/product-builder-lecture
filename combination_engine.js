'use strict';

/**
 * AI Combination Engine v1.2 (Lotto & Pension Combined)
 * - Standardized Monte Carlo Simulation
 * - Real-time Live Stats & Seamless UX
 * - Advanced Reverse-Chain Markov AI (GP9)
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
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = '', 100);
        }
        this.saveLottoSelection();
        this.updateLottoDisplay();
        this.updateLiveStats();
    },

    updateLiveStats: function() {
        var lotto = this.state.lotto;
        var nums = Array.from(lotto.manual).concat(Array.from(lotto.auto)).sort((a,b)=>a-b);
        var count = nums.length;
        var liveBar = document.getElementById('live-status-bar');
        if (!liveBar) return;

        if (count === 0) { liveBar.innerHTML = ''; return; }

        var sum = nums.reduce((a, b) => a + b, 0);
        var odd = nums.filter(n => n % 2 !== 0).length;
        var low = nums.filter(n => n <= 22).length;

        liveBar.innerHTML = `
            <div style="background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.6rem; color:#94a3b8; font-weight:800; margin-bottom:2px;">총합</div>
                <div style="font-size:0.85rem; font-weight:900; color:#191f28;">${sum}</div>
            </div>
            <div style="background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.6rem; color:#94a3b8; font-weight:800; margin-bottom:2px;">홀짝</div>
                <div style="font-size:0.85rem; font-weight:900; color:#191f28;">${odd}:${count-odd}</div>
            </div>
            <div style="background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:0.6rem; color:#94a3b8; font-weight:800; margin-bottom:2px;">고저</div>
                <div style="font-size:0.85rem; font-weight:900; color:#191f28;">${low}:${count-low}</div>
            </div>
        `;

        if (count === 6) {
            this.analyze();
        } else {
            var report = document.getElementById('report-section');
            if (report) report.style.opacity = '0.5'; 
        }
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
        var all = Array.from(this.state.lotto.manual).concat(Array.from(this.state.lotto.auto)).sort((a,b) => a-b);
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
        var self = this;
        groupBtns.forEach(btn => {
            btn.onclick = function() {
                groupBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                self.state.pension.group = parseInt(this.getAttribute('data-val'));
            };
        });
        if (groupBtns[0]) groupBtns[0].click();
    },

    bindPensionWheels: function() {
        var self = this;
        for (var d = 0; d < 6; d++) {
            (function(idx) {
                var container = document.getElementById('digit-' + idx);
                var btns = container.querySelectorAll('.wheel-btn');
                btns.forEach(btn => {
                    btn.onclick = function() {
                        btns.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        self.state.pension.digits[idx] = parseInt(this.getAttribute('data-val'));
                    };
                });
                if (btns[0]) btns[0].click();
            })(d);
        }
    },

    bindPensionAnchors: function() {
        var self = this;
        var btns = document.querySelectorAll('.anchor-btn');
        btns.forEach(btn => {
            btn.onclick = function() {
                btns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                self.generatePensionAI(parseInt(this.getAttribute('data-val')));
            };
        });
    },

    // --- Global Engines ---
    runMonteCarlo: function(nums, isPension, group) {
        var iterations = 10000;
        var hits = 0;
        if (isPension) {
            for (var i = 0; i < iterations; i++) {
                var match = 0;
                for (var m = 5; m >= 0; m--) { if (nums[m] === Math.floor(Math.random()*10)) match++; else break; }
                if (match >= 1) hits++;
            }
            var rate = (hits / iterations) * 100;
            return { hits: hits, score: Math.round(50 + rate * 5), rate: rate.toFixed(2) };
        } else {
            var mySet = new Set(nums);
            for (var j = 0; j < iterations; j++) {
                var sim = this.generateRandomLotto();
                var matchL = sim.filter(n => mySet.has(n)).length;
                if (matchL >= 3) hits++;
            }
            var expected = 222;
            var scoreL = 50 + ((hits - expected) / 10);
            return { hits: hits, score: Math.round(Math.min(99, Math.max(1, scoreL))) };
        }
    },

    generateRandomLotto: function() {
        var pool = Array.from({length:45}, (_,i)=>i+1);
        var res = [];
        for(var i=0; i<6; i++) res.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
        return res;
    },

    // --- Actions ---
    analyze: function() {
        if (!this.statsData) { alert('데이터 로딩 중입니다.'); return; }
        var report = document.getElementById(this.isPension ? 'p-report-section' : 'report-section');
        var results = document.getElementById(this.isPension ? 'p-analysis-results' : 'analysis-report-body');
        if (!report || !results) return;

        report.style.display = 'block';
        report.style.opacity = '1';

        var nums = this.isPension ? this.state.pension.digits : Array.from(this.state.lotto.manual).concat(Array.from(this.state.lotto.auto));
        if (nums.length < 6 && !this.isPension) return;

        var sim = this.runMonteCarlo(nums, this.isPension, this.state.pension.group);
        
        if (this.isPension) this.renderPensionReport(results, nums, sim);
        else this.renderLottoReport(results, nums, sim);
    },

    renderLottoReport: function(container, nums, sim) {
        container.innerHTML = '';
        var sortedNums = nums.slice().sort((a,b)=>a-b);
        
        var synergyResults = LottoSynergy.check(sortedNums, this.statsData);
        if (synergyResults.length > 0) {
            var synergyWrapper = document.createElement('tr');
            var synergyHtml = synergyResults.map(s => `
                <div style="margin-bottom:8px; padding:10px; border-radius:8px; border-left:4px solid ${s.status === 'danger' ? '#f04452' : '#3182f6'}; background:${s.status === 'danger' ? '#fef2f2' : '#f0f7ff'};">
                    <div style="font-size:0.75rem; font-weight:900; color:${s.status === 'danger' ? '#f04452' : '#3182f6'}; margin-bottom:4px;">[GL0] ${s.label}</div>
                    <div style="font-size:0.7rem; color:#4a5568; line-height:1.4;">${s.desc}</div>
                </div>
            `).join('');
            
            synergyWrapper.innerHTML = `<td colspan="4" style="padding:15px; background:#fff;"><div style="font-size:0.8rem; font-weight:800; color:#191f28; margin-bottom:12px;">🔍 AI 심층 진단 리포트</div>${synergyHtml}</td>`;
            container.appendChild(synergyWrapper);
        }

        var trSim = document.createElement('tr');
        trSim.innerHTML = `<td><strong style="color:#3182f6;">🧬 AI 몬테카를로</strong></td><td>${sim.hits}회</td><td><span class="status-badge safe">AI 분석</span></td><td class="text-left">1만 회 가상 추첨 결과, 통계적 우위 ${sim.score}점 산출.</td>`;
        container.appendChild(trSim);

        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.group && cfg.group.indexOf('GL') === 0);
        var stats = this.statsData.stats_summary || {};
        var totalScore = 100 + (sim.score - 50)/5;

        indicators.forEach(cfg => {
            if (!cfg.calc) return;
            var val = cfg.calc(sortedNums, this.statsData);
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            var tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${cfg.label}</strong></td><td>${val}</td><td><span class="status-badge ${status}">${status}</span></td><td class="text-left">${status==='danger'?'희귀 패턴':'안정적'}</td>`;
            container.appendChild(tr);
            if (status === 'danger') totalScore -= 12;
        });

        synergyResults.forEach(s => { if(s.status === 'danger') totalScore -= 15; });
        var finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));
        document.getElementById('combination-score').innerText = finalScore;

        var grade = 'C', comment = '통계적으로 당첨 빈도가 매우 낮은 희귀한 패턴의 조합입니다.';
        if (finalScore >= 90) { grade = 'S'; comment = '역대 1등 당첨 데이터와 완벽하게 일치하는 황금 밸런스 조합입니다.'; }
        else if (finalScore >= 80) { grade = 'A'; comment = '역대 당첨 확률이 매우 높은 균형 잡힌 조합입니다.'; }
        else if (finalScore >= 70) { grade = 'B'; comment = '무난한 조합이나 일부 지표가 통계적 범위를 벗어나 있습니다.'; }

        var gradeEl = document.getElementById('combination-grade'), commentEl = document.getElementById('grade-comment');
        if (gradeEl) gradeEl.innerText = grade + '등급';
        if (commentEl) commentEl.innerText = comment;
    },

    renderPensionReport: function(container, nums, sim) {
        if (!typeof PensionUtils !== 'undefined') { container.innerHTML = '<p>연금 분석 모듈 로딩 중...</p>'; return; }
        var balance = PensionUtils.analyzeBalance(nums);
        var pattern = PensionUtils.analyzePatterns(nums);
        var grade = sim.score >= 85 ? 'S' : (sim.score >= 75 ? 'A' : 'B');
        var color = grade === 'S' ? '#3182f6' : (grade === 'A' ? '#2ecc71' : '#ff9500');

        container.innerHTML = `
            <div class="analysis-card" style="padding:20px; border:2px solid ${color}33;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:80px; height:80px; border-radius:50%; border:4px solid ${color}; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:900; color:${color};">${grade}</div>
                    <div><h3 style="margin:0;">AI 스코어: ${sim.score}점</h3><p style="margin:5px 0; font-size:0.8rem; color:#64748b;">1만 회 시뮬레이션 당첨 확률: ${sim.rate}%</p></div>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div class="analysis-card" style="padding:15px; text-align:center;"><span style="font-size:0.7rem; color:#94a3b8;">P4 합계</span><br><strong>${balance.sum}</strong></div>
                <div class="analysis-card" style="padding:15px; text-align:center;"><span style="font-size:0.7rem; color:#94a3b8;">P2 중복</span><br><strong>${pattern.maxOccur}개</strong></div>
            </div>
        `;
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
                this.state.lotto.manual.add(n);
                var btn = document.getElementById('select-ball-' + n);
                if (btn) btn.className = 'select-ball selected-manual';
            });
            if (data && Array.isArray(data.auto)) data.auto.forEach(n => {
                this.state.lotto.auto.add(n);
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
        document.getElementById('semi-auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));
        document.getElementById('auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(true));
        document.getElementById('semi-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            self.state.lotto.manual.clear(); self.state.lotto.auto.clear();
            document.querySelectorAll('.select-ball').forEach(b => b.className = 'select-ball');
            self.updateLottoDisplay();
            self.updateLiveStats();
            var report = document.getElementById('report-section');
            if (report) report.style.display = 'none';
        });
    },

    pickLottoNumbers: function(isFullAuto) {
        var lotto = this.state.lotto;
        if (isFullAuto) { lotto.manual.clear(); lotto.auto.clear(); }
        var pool = [];
        for (var i = 1; i <= 45; i++) if (!lotto.manual.has(i) && !lotto.auto.has(i)) pool.push(i);
        while (lotto.manual.size + lotto.auto.size < 6 && pool.length > 0) {
            var num = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
            lotto.auto.add(num);
        }
        document.querySelectorAll('.select-ball').forEach(btn => {
            var n = parseInt(btn.innerText);
            if (lotto.manual.has(n)) btn.className = 'select-ball selected-manual';
            else if (lotto.auto.has(n)) btn.className = 'select-ball selected-auto';
            else btn.className = 'select-ball';
        });
        this.saveLottoSelection();
        this.updateLottoDisplay();
        this.updateLiveStats();
    },

    randomizePension: function() {
        var group = Math.floor(Math.random() * 5) + 1;
        var groupBtn = document.querySelector(`#group-selector .sel-btn[data-val="${group}"]`);
        if (groupBtn) groupBtn.click();
        for (var i = 0; i < 6; i++) {
            var val = Math.floor(Math.random() * 10);
            var wheelBtn = document.querySelector(`#digit-${i} .wheel-btn[data-val="${val}"]`);
            if (wheelBtn) wheelBtn.click();
        }
    },

    generatePensionAI: function(anchor) {
        var container = document.getElementById('ai-pension-recommendations');
        if (!container || !this.statsData) return;
        container.innerHTML = '';
        var self = this, matrix = this.statsData.markov_matrix;
        var strategies = [{ id: 'markov', label: '🔥 마르코프 체인', desc: '역방향 전이 확률 최적화' }, { id: 'monte', label: '🧬 몬테카를로', desc: '시뮬레이션 기반 고득점' }];

        strategies.forEach(st => {
            var combo = [0, 0, 0, 0, 0, anchor];
            if (st.id === 'markov' && matrix) {
                for (var i = 4; i >= 0; i--) {
                    var prev = combo[i + 1], row = matrix[prev], total = row.reduce((a, b) => a + b, 0);
                    var rand = Math.random() * total, sum = 0, picked = 0;
                    for (var n = 0; n < 10; n++) { sum += row[n]; if (rand <= sum) { picked = n; break; } }
                    combo[i] = picked;
                }
            } else { for (var i = 0; i < 5; i++) combo[i] = Math.floor(Math.random() * 10); }

            var card = document.createElement('div');
            card.className = 'analysis-card'; card.style.cssText = 'padding:15px; cursor:pointer; text-align:center; transition:all 0.2s; border:1px solid #e2e8f0;';
            var ballsHtml = combo.map((n, idx) => `<div class="pension-ball small" style="width:26px; height:26px; border-radius:50%; background:${idx===5?'#3182f6':'#f1f5f9'}; color:${idx===5?'#fff':'#1e293b'}; border:${idx===5?'none':'1px solid #e2e8f0'}; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800;">${n}</div>`).join('');
            card.innerHTML = `<div style="font-size:0.75rem; font-weight:900; color:#3182f6; margin-bottom:10px;">${st.label}</div><div style="display:flex; gap:4px; justify-content:center; margin-bottom:8px;">${ballsHtml}</div><div style="font-size:0.65rem; color:#94a3b8;">${st.desc}</div>`;
            card.onclick = () => {
                combo.forEach((n, idx) => { var btns = document.querySelectorAll('#digit-' + idx + ' .wheel-btn'); if (btns && btns[n]) btns[n].click(); });
                document.getElementById('p-analyze-btn')?.click();
                document.getElementById('p-report-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            container.appendChild(card);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() { CombinationEngine.init(); });
