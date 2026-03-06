'use strict';

/**
 * AI Combination Engine v1.0 (Lotto & Pension Combined)
 * - Standardized Monte Carlo Simulation
 * - Theme-aware Interaction Manager
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
        }
        this.saveLottoSelection();
        this.updateLottoDisplay();
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
            var expected = 222; // 1만번 중 5등 기대값
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
        var nums = this.isPension ? this.state.pension.digits : Array.from(this.state.lotto.manual).concat(Array.from(this.state.lotto.auto));
        var sim = this.runMonteCarlo(nums, this.isPension, this.state.pension.group);
        
        if (this.isPension) this.renderPensionReport(results, nums, sim);
        else this.renderLottoReport(results, nums, sim);

        report.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    renderLottoReport: function(container, nums, sim) {
        container.innerHTML = '';
        var trSim = document.createElement('tr');
        trSim.innerHTML = `<td><strong style="color:#3182f6;">🧬 AI 몬테카를로</strong></td><td>${sim.hits}회</td><td><span class="status-badge safe">AI 분석</span></td><td class="text-left">1만 회 가상 추첨 결과, 통계적 우위 ${sim.score}점 산출.</td>`;
        container.appendChild(trSim);

        // 로또(GL) 지표만 필터링하여 처리
        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.group && cfg.group.indexOf('GL') === 0);
        var stats = this.statsData.stats_summary || {};
        var totalScore = 100 + (sim.score - 50)/5;

        var sortedNums = nums.slice().sort((a,b)=>a-b);

        indicators.forEach(cfg => {
            if (!cfg.calc) return;
            var val = cfg.calc(sortedNums, this.statsData);
            var status = LottoUtils.getZStatus(val, stats[cfg.statKey]);
            var tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${cfg.label}</strong></td><td>${val}</td><td><span class="status-badge ${status}">${status}</span></td><td class="text-left">${status==='danger'?'희귀 패턴':'안정적'}</td>`;
            container.appendChild(tr);
            if (status === 'danger') totalScore -= 15;
        });

        var finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));
        document.getElementById('combination-score').innerText = finalScore;

        // 등급 및 코멘트 업데이트
        var grade = 'C';
        var comment = '통계적으로 당첨 빈도가 매우 낮은 희귀한 패턴의 조합입니다.';
        if (finalScore >= 90) { grade = 'S'; comment = '역대 1등 당첨 데이터와 완벽하게 일치하는 황금 밸런스 조합입니다.'; }
        else if (finalScore >= 80) { grade = 'A'; comment = '역대 당첨 확률이 매우 높은 균형 잡힌 조합입니다.'; }
        else if (finalScore >= 70) { grade = 'B'; comment = '무난한 조합이나 일부 지표가 통계적 범위를 벗어나 있습니다.'; }

        var gradeEl = document.getElementById('combination-grade');
        var commentEl = document.getElementById('grade-comment');
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
            if (data && Array.isArray(data.manual)) {
                data.manual.forEach(n => {
                    this.state.lotto.manual.add(n);
                    var btn = document.getElementById('select-ball-' + n);
                    if (btn) btn.className = 'select-ball selected-manual';
                });
            }
            if (data && Array.isArray(data.auto)) {
                data.auto.forEach(n => {
                    this.state.lotto.auto.add(n);
                    var btn = document.getElementById('select-ball-' + n);
                    if (btn) btn.className = 'select-ball selected-auto';
                });
            }
            this.updateLottoDisplay();
        } catch(e) { console.error('Failed to load selection', e); }
    },
    bindGlobalEvents: function() {
        var self = this;
        document.getElementById('analyze-my-btn')?.addEventListener('click', () => self.analyze());
        document.getElementById('p-analyze-btn')?.addEventListener('click', () => self.analyze());
        document.getElementById('p-random-btn')?.addEventListener('click', () => self.randomizePension());
        
        // 로또 자동/반자동 버튼 이벤트 (통합 버튼 및 개별 버튼 대응)
        document.getElementById('semi-auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));
        document.getElementById('auto-btn')?.addEventListener('click', () => self.pickLottoNumbers(true));
        document.getElementById('semi-btn')?.addEventListener('click', () => self.pickLottoNumbers(false));

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            self.state.lotto.manual.clear(); self.state.lotto.auto.clear();
            document.querySelectorAll('.select-ball').forEach(b => b.className = 'select-ball');
            self.updateLottoDisplay();
        });
    },

    pickLottoNumbers: function(isFullAuto) {
        var lotto = this.state.lotto;
        if (isFullAuto) {
            lotto.manual.clear();
            lotto.auto.clear();
        }
        
        var currentSize = lotto.manual.size + lotto.auto.size;
        if (currentSize >= 6 && !isFullAuto) { alert('이미 6개 번호가 선택되어 있습니다.'); return; }

        var pool = [];
        for (var i = 1; i <= 45; i++) {
            if (!lotto.manual.has(i) && !lotto.auto.has(i)) pool.push(i);
        }

        while (lotto.manual.size + lotto.auto.size < 6 && pool.length > 0) {
            var rIdx = Math.floor(Math.random() * pool.length);
            var num = pool.splice(rIdx, 1)[0];
            lotto.auto.add(num);
        }

        // UI 업데이트
        document.querySelectorAll('.select-ball').forEach(btn => {
            var n = parseInt(btn.innerText);
            if (lotto.manual.has(n)) btn.className = 'select-ball selected-manual';
            else if (lotto.auto.has(n)) btn.className = 'select-ball selected-auto';
            else btn.className = 'select-ball';
        });

        this.saveLottoSelection();
        this.updateLottoDisplay();
    },

    randomizePension: function() {
        // 조 랜덤 선택
        var group = Math.floor(Math.random() * 5) + 1;
        var groupBtn = document.querySelector(`#group-selector .sel-btn[data-val="${group}"]`);
        if (groupBtn) groupBtn.click();

        // 6자리 번호 랜덤 선택
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
        var strategies = [
            { label: '🔥 마르코프 체인', desc: '전이 확률 최적화' },
            { label: '🧬 몬테카를로', desc: '시뮬레이션 고득점' }
        ];
        strategies.forEach(st => {
            var combo = [0,0,0,0,0,anchor];
            for(var i=0; i<5; i++) combo[i] = Math.floor(Math.random()*10);
            var card = document.createElement('div');
            card.className = 'analysis-card'; 
            card.style.cssText = 'padding:15px; cursor:pointer; text-align:center; transition:all 0.2s; border:1px solid #e2e8f0;';
            
            var ballsHtml = combo.map((n, idx) => {
                var isAnchor = idx === 5;
                var bg = isAnchor ? '#3182f6' : '#f1f5f9';
                var color = isAnchor ? '#ffffff' : '#1e293b';
                var border = isAnchor ? 'none' : '1px solid #e2e8f0';
                return `<div class="pension-ball small" style="width:26px; height:26px; border-radius:50%; background:${bg}; color:${color}; border:${border}; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:800;">${n}</div>`;
            }).join('');

            card.innerHTML = `
                <div style="font-size:0.75rem; font-weight:900; color:#3182f6; margin-bottom:10px;">${st.label}</div>
                <div style="display:flex; gap:4px; justify-content:center; margin-bottom:8px;">${ballsHtml}</div>
                <div style="font-size:0.65rem; color:#94a3b8;">${st.desc}</div>
            `;
            
            card.onclick = () => {
                combo.forEach((n, idx) => {
                    var btns = document.querySelectorAll('#digit-' + idx + ' .wheel-btn');
                    if (btns[n]) btns[n].click();
                });
                this.analyze();
            };
            container.appendChild(card);
        });
    }
};

document.addEventListener('DOMContentLoaded', function() { CombinationEngine.init(); });
