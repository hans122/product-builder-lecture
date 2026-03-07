'use strict';

/**
 * AI Content Loader v1.5 (Refactored & Lean Edition)
 * - Managed UI Generation using LottoConfig (SSOT)
 * - Logic consolidated into LottoUtils
 */

var ContentLoader = {
    isPension: false,
    
    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) {
                    self.buildGuideUI('dynamic-pension-guide-root', 'GP');
                    self.updatePensionGuide(data);
                }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) {
                    self.buildGuideUI('dynamic-guide-root', 'GL');
                    self.updateLottoGuide(data);
                }
            });
        }
    },

    buildGuideUI: function(rootId, prefix) {
        var root = document.getElementById(rootId);
        if (!root || typeof LottoConfig === 'undefined' || !LottoConfig.INDICATORS) return;

        root.innerHTML = '';
        var currentGroup = '';
        var currentSection = null;

        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (!cfg || !cfg.group || cfg.group.indexOf(prefix) !== 0) return;

            if (cfg.group !== currentGroup) {
                currentGroup = cfg.group;
                var groupNames = LottoConfig.GROUP_NAMES || {};
                var gTitle = document.createElement('div');
                gTitle.className = 'guide-group-title';
                gTitle.innerText = '[' + currentGroup + '] ' + (groupNames[currentGroup] || '분석 지표');
                root.appendChild(gTitle);

                currentSection = document.createElement('section');
                currentSection.className = 'logic-card';
                currentSection.innerHTML = '<h3>📍 [' + currentGroup + '] ' + (groupNames[currentGroup] || '') + '</h3>';
                root.appendChild(currentSection);
            }

            var itemDiv = document.createElement('div');
            itemDiv.innerHTML = `<span class="sub-item-label">${cfg.label}</span><div id="${cfg.id}-stat-container"></div><p id="${cfg.id}-tip" class="strategy-tip"></p>`;
            if (currentSection) currentSection.appendChild(itemDiv);
        });

        this.buildAIGuideUI(prefix);
    },

    buildAIGuideUI: function(prefix) {
        var rootId = prefix === 'GP' ? 'ai-pension-guide-root' : 'ai-guide-root';
        var root = document.getElementById(rootId);
        if (!root) return;

        if (prefix === 'GP') {
            root.innerHTML = `<div class="guide-group-title">AI 연금 분석 기술</div>
                <section class="logic-card ai-highlight" style="border-color:#ff8c0033; background:#fffaf0;">
                    <h3 style="color:#ff8c00; border-bottom-color:#ff8c00;">🔮 [GP14] AI 마르코프 다음 숫자 전이 확률</h3>
                    <div class="guide-desc">역방향 자리수별 흐름을 10x10 매트릭스로 분석하여 다음 유력 숫자를 예측합니다.</div>
                    <div id="p-markov-best-flow" class="stat-highlight"></div>
                </section>
                <section class="logic-card ai-highlight" style="border-color:#3182f633; background:#f0f7ff;">
                    <h3 style="color:#3182f6; border-bottom-color:#3182f6;">🧬 [GP15] AI 몬테카를로 당첨 기댓값</h3>
                    <div class="guide-desc">사용자 조합으로 1만 번 가상 추첨을 실행하여 실제 당첨 확률에 근접한 데이터를 산출합니다.</div>
                </section>`;
        } else {
            root.innerHTML = `<div class="guide-group-title">AI 신기술 가이드</div>
                <section class="logic-card ai-highlight" style="border: 2px solid #3182f633; background: #f0f7ff;">
                    <h3 style="color: #3182f6; border-bottom-color: #3182f6;">🔮 [GL7] AI 마르코프 전이 확률 분석</h3>
                    <div id="markov-stat-container"></div>
                </section>
                <section class="logic-card ai-highlight" style="border: 2px solid #2ecc7133; background: #f0fdf4;">
                    <h3 style="color: #2ecc71; border-bottom-color: #2ecc71;">🧬 [GL8] AI 몬테카를로 시뮬레이션</h3>
                </section>`;
        }
    },

    updateLottoGuide: function(data) {
        var total = data.total_draws;
        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (cfg.group.indexOf('GL') !== 0) return;
            var info = LottoUtils.calculateZoneInfo(data.stats_summary[cfg.statKey], data.distributions[cfg.distKey], cfg);
            if (info) {
                var container = document.getElementById(cfg.id + '-stat-container');
                if (container) container.innerHTML = `<div class="stat-highlight">통계적 <span class="text-optimal">옵티멀 존 "${info.optimal}" (${((info.optHits/total)*100).toFixed(1)}%)</span>, <span class="text-safe">세이프 존 "${info.safe}" (${((info.safeHits/total)*100).toFixed(1)}%)</span></div>`;
                
                var tip = document.getElementById(cfg.id + '-tip');
                var tipText = LottoConfig.LOTTO_TIPS[cfg.id];
                if (tip && tipText) tip.innerHTML = '<strong>공략 팁:</strong> ' + tipText.replace(/{safe}/g, info.safe);
            }
        });

        if (data.markov_ending_matrix) {
            var m = data.markov_ending_matrix, topF = 0, topT = 0, maxP = 0;
            for (var r=0; r<10; r++) {
                var rSum = m[r].reduce((a,b)=>a+b,0); if (rSum === 0) continue;
                for (var c=0; c<10; c++) { var p = (m[r][c]/rSum)*100; if(p>maxP){maxP=p; topF=r; topT=c;}}
            }
            var mBox = document.getElementById('markov-stat-container');
            if (mBox) mBox.innerHTML = `<div class="stat-highlight" style="background:#e8f3ff; border-left-color:#3182f6; color:#1e40af;">최고 확률 흐름: <strong>끝수 ${topF} → 끝수 ${topT} (${maxP.toFixed(1)}%)</strong></div>`;
        }
    },

    updatePensionGuide: function(data) {
        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (cfg.group.indexOf('GP') !== 0) return;
            var tip = document.getElementById(cfg.id + '-tip');
            var tipText = LottoConfig.PENSION_TIPS[cfg.id];
            if (tip && tipText) tip.innerHTML = '<strong>설명:</strong> ' + tipText;
        });

        var hotNums = data.pos_freq.map(f => f.indexOf(Math.max(...f)));
        var bestG = Object.entries(data.group_dist).sort((a,b)=>b[1]-a[1])[0][0];
        this.setVal('p-pos-freq-stat-container', `<div class="stat-highlight">현재 각 자리별 최다 출현 번호: <strong>${hotNums.join(', ')}</strong></div>`);
        this.setVal('p-group-stat-container', `<div class="stat-highlight">역대 가장 많이 당첨된 조: <strong>${bestG}조</strong></div>`);

        if (data.markov_matrix) {
            var topF=0, topT=0, maxP=0;
            for (var r=0; r<10; r++) {
                var rSum = data.markov_matrix[r].reduce((a,b)=>a+b,0); if (rSum===0) continue;
                for (var c=0; c<10; c++) { var p = (data.markov_matrix[r][c]/rSum)*100; if(p>maxP){maxP=p; topF=r; topT=c;}}
            }
            this.setVal('p-markov-best-flow', `최고 확률 전이: <strong>숫자 ${topF} → ${topT} (확률 ${maxP.toFixed(1)}%)</strong>`);
        }
    },

    setVal: function(id, val) { var el = document.getElementById(id); if (el) el.innerHTML = val; }
};

document.addEventListener('DOMContentLoaded', () => ContentLoader.init());
