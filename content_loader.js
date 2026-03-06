'use strict';

/**
 * AI Content Loader v1.4 (Lotto & Pension Unified Guide Builder)
 * - Autonomous UI Generation for both Lotto (GL) and Pension (GP)
 * - Integrated Real-time Analytics & Strategy Tips
 */

var ContentLoader = {
    isPension: false,
    
    // --- 팁 데이터 (SSOT) ---
    LOTTO_TIPS: {
        'sum': '합계 수치는 가장 출현 빈도가 높은 세이프 존 <strong>"{safe}"</strong> 범위를 유지하는 것이 전략적으로 유리합니다.',
        'odd-even': '홀수 개수는 밸런스가 좋은 <strong>"{safe}"</strong> 범위를 권장하며, 특히 3:3 배합이 가장 강력한 정규분포 중심점입니다.',
        'high-low': '고번호와 저번호의 배합은 <strong>"{safe}"</strong> 범위 내에서 선택하여 번호가 한쪽으로 쏠리지 않도록 조절하세요.',
        'period_1': '이월수(직전 1회차 재출현)는 매 회차 <strong>"{safe}"</strong>개 정도 포함되는 것이 통계적으로 가장 흔한 패턴입니다.',
        'neighbor': '직전 회차 번호의 주변수(±1)인 이웃수는 <strong>"{safe}"</strong>개 포함될 때 당첨 조합의 완성도가 높아집니다.',
        'period_1_2': '최근 2개 회차의 당첨번호 합집합 중 <strong>"{safe}"</strong>개를 활용하여 최근의 흐름을 반영해 보세요.',
        'period_1_3': '최근 3개 회차 번호 중 <strong>"{safe}"</strong>개를 선별하여 조합하면 장기적인 출현 흐름을 잡을 수 있습니다.',
        'consecutive': '연속번호는 전체 당첨의 절반 이상에서 나타나며, <strong>"{safe}"</strong>쌍 정도를 포함하는 것이 현실적인 공략입니다.',
        'prime': '소수는 수학적으로 불규칙해 보이지만, 통계적으로는 <strong>"{safe}"</strong>개 범위 내에서 꾸준히 출현하고 있습니다.',
        'composite': '합성수는 조합의 뼈대를 이루는 수들로, <strong>"{safe}"</strong>개 정도를 포함하여 기본 균형을 맞추세요.',
        'multiple-3': '3의 배수는 매 회차 평균 2개 내외로 출현하며, <strong>"{safe}"</strong>개 범위를 지키는 것이 안정적입니다.',
        'multiple-5': '5의 배수는 출현 빈도가 낮으므로 <strong>"{safe}"</strong>개 정도로 가볍게 포함시키는 전략을 권장합니다.',
        'square': '제곱수는 특이값이지만 <strong>"{safe}"</strong>개 범위 내에서 변별력을 주는 요소로 활용할 수 있습니다.',
        'double': '11, 22와 같은 쌍수는 <strong>"{safe}"</strong>개 범위 내에서 조합의 유니크함을 더해주는 지표입니다.',
        'bucket-15': '전체 번호를 3그룹으로 나눴을 때 <strong>"{safe}"</strong>개의 구간이 점유되어야 번호가 이상적으로 분산됩니다.',
        'bucket-9': '5개 구간 분할 시 <strong>"{safe}"</strong>개 구간에서 번호가 고르게 출현하는 조합이 확률이 높습니다.',
        'bucket-5': '9개 구간 분할 시 <strong>"{safe}"</strong>개 구간을 점유하여 세밀한 분산도를 확보하는 것이 좋습니다.',
        'bucket-3': '15개 구간 분할 시 <strong>"{safe}"</strong>개 구간에 번호가 퍼져 있어야 당첨 가능 구역을 모두 커버합니다.',
        'color': '5가지 공 색상 중 <strong>"{safe}"</strong>가지 이상의 색상이 섞여야 시각적/통계적으로 안정적인 조합이 됩니다.',
        'pattern-corner': '용지의 4개 모서리 영역에서 <strong>"{safe}"</strong>개 정도의 번호가 출현하는 패턴이 매우 빈번합니다.',
        'pattern-triangle': '용지 중앙의 삼각형 영역에 <strong>"{safe}"</strong>개의 번호를 배치하여 중심부의 밸런스를 잡으세요.',
        'end-sum': '일의 자리 숫자들의 합계인 끝수합은 <strong>"{safe}"</strong> 범위 내에서 가장 많이 형성됩니다.',
        'same-end': '동끝수(일의 자리가 같은 번호)는 <strong>"{safe}"</strong>개 포함될 때 당첨 확률이 비약적으로 상승합니다.',
        'ac': '산술적 복잡도(AC)는 <strong>"{safe}"</strong> 이상을 유지해야 실제 당첨 번호와 유사한 무작위성을 가집니다.',
        'span': '가장 큰 수와 작은 수의 차이(Span)는 <strong>"{safe}"</strong> 범위일 때 가장 강력한 당첨 에너지를 가집니다.',
        'first-num': '조합의 시작인 첫 번째 숫자는 <strong>"{safe}"</strong> 구간 내에서 선택하는 것이 통계적으로 매우 안정적입니다.',
        'last-num': '조합의 마무리인 마지막 숫자는 <strong>"{safe}"</strong> 구간에 위치할 때 당첨권 진입 확률이 높아집니다.',
        'mean-gap': '번호들 사이의 평균 간격이 <strong>"{safe}"</strong> 범위에 있어야 번호가 너무 뭉치거나 퍼지지 않은 이상적 밸런스를 갖춥니다.'
    },

    PENSION_TIPS: {
        'p-pos-freq': '각 자리마다 0~9까지 확률은 동일하지만, 실제 흐름에서는 특정 숫자가 반복되거나 정체되는 현상이 발생합니다.',
        'p-sequence': '번호가 1씩 차이나며 이어지는 흐름(123 등)을 관찰하여 너무 인위적인 나열을 피하세요.',
        'p-repeat': '동일 숫자가 바로 옆에 붙어서 출현하는 패턴입니다. 트리플(777) 등은 매우 희귀합니다.',
        'p-group': '연금복권의 첫 단추인 조를 선택할 때, 확률 회귀 원칙에 따라 미출현 조를 공략해 보세요.',
        'p-sum': '조를 제외한 6자리 합계가 20~34 사이인 골든 존이 당첨 확률이 가장 높습니다.',
        'p-carry': '전회차 숫자가 같은 자리에 그대로 나오는 이월 확률을 반영하여 흐름을 잡으세요.',
        'p-balance': '홀짝 및 고저 비율이 3:3으로 균형 잡힌 조합이 통계적으로 가장 우세합니다.',
        'p-flow': '최근 15회차의 번호 이동을 타임라인으로 확인하여 공백 구역을 선별하세요.'
    },

    GROUP_NAMES: {
        'GL1': '기본 균형 및 합계', 'GL2': '회차 상관관계 (이월/연속)', 'GL3': '특수 번호군 분석',
        'GL4': '구간 및 패턴 분석', 'GL5': '끝수 및 전문지표', 'GL6': '고급 필터링 지표',
        'GP1': '자리수별 독립 빈도', 'GP2': '배열 패턴 및 구성 분석', 'GP3': '조별 당첨 분포',
        'GP4': '수치 균형', 'GP5': '회차 간 상관관계', 'GP6': '세부 균형 분석', 'GP13': '당첨 번호 흐름'
    },

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

    /**
     * [CORE] 통합 가이드 UI 자동 생성 엔진
     */
    buildGuideUI: function(rootId, prefix) {
        var root = document.getElementById(rootId);
        if (!root) return;
        
        if (typeof LottoConfig === 'undefined' || !LottoConfig.INDICATORS) return;

        root.innerHTML = '';
        var self = this;
        var currentGroup = '';
        var currentSection = null;

        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (!cfg || !cfg.group || cfg.group.indexOf(prefix) !== 0) return;

            // 1. 그룹 헤더 및 섹션 카드 생성
            if (cfg.group !== currentGroup) {
                currentGroup = cfg.group;
                var gTitle = document.createElement('div');
                gTitle.className = 'guide-group-title';
                gTitle.innerText = '[' + currentGroup + '] ' + (self.GROUP_NAMES[currentGroup] || '분석 지표');
                root.appendChild(gTitle);

                currentSection = document.createElement('section');
                currentSection.className = 'logic-card';
                currentSection.innerHTML = '<h3>📍 [' + currentGroup + '] ' + (self.GROUP_NAMES[currentGroup] || '') + '</h3>';
                root.appendChild(currentSection);
            }

            // 2. 지표 항목 추가
            var itemDiv = document.createElement('div');
            itemDiv.innerHTML = 
                '<span class="sub-item-label">' + cfg.label + '</span>' +
                '<div id="' + cfg.id + '-stat-container"></div>' +
                '<p id="' + cfg.id + '-tip" class="strategy-tip"></p>';
            if (currentSection) currentSection.appendChild(itemDiv);
        });

        this.buildAIGuideUI(prefix);
    },

    buildAIGuideUI: function(prefix) {
        var rootId = prefix === 'GP' ? 'ai-pension-guide-root' : 'ai-guide-root';
        var root = document.getElementById(rootId);
        if (!root) return;

        if (prefix === 'GP') {
            root.innerHTML = `
                <div class="guide-group-title">AI 연금 분석 기술</div>
                <section class="logic-card ai-highlight" style="border-color:#ff8c0033; background:#fffaf0;">
                    <h3 style="color:#ff8c00; border-bottom-color:#ff8c00;">🔮 [GP14] AI 마르코프 다음 숫자 전이 확률</h3>
                    <div class="guide-desc">역방향 자리수별 흐름을 10x10 매트릭스로 분석하여 다음 유력 숫자를 예측합니다.</div>
                    <div id="p-markov-best-flow" class="stat-highlight"></div>
                </section>
                <section class="logic-card ai-highlight" style="border-color:#3182f633; background:#f0f7ff;">
                    <h3 style="color:#3182f6; border-bottom-color:#3182f6;">🧬 [GP15] AI 몬테카를로 당첨 기댓값</h3>
                    <div class="guide-desc">사용자 조합으로 1만 번 가상 추첨을 실행하여 실제 당첨 확률에 근접한 데이터를 산출합니다.</div>
                </section>
            `;
        } else {
            root.innerHTML = `
                <div class="guide-group-title">AI 신기술 가이드</div>
                <section class="logic-card ai-highlight" style="border: 2px solid #3182f633; background: #f0f7ff;">
                    <h3 style="color: #3182f6; border-bottom-color: #3182f6;">🔮 [GL7] AI 마르코프 전이 확률 분석</h3>
                    <div id="markov-stat-container"></div>
                </section>
                <section class="logic-card ai-highlight" style="border: 2px solid #2ecc7133; background: #f0fdf4;">
                    <h3 style="color: #2ecc71; border-bottom-color: #2ecc71;">🧬 [GL8] AI 몬테카를로 시뮬레이션</h3>
                </section>
            `;
        }
    },

    updateLottoGuide: function(data) {
        var total = data.total_draws;
        var self = this;
        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (cfg.group.indexOf('GL') !== 0) return;
            var info = self.calculateZoneInfo(data.stats_summary[cfg.statKey], data.distributions[cfg.distKey], cfg);
            if (info) {
                var container = document.getElementById(cfg.id + '-stat-container');
                if (container) {
                    container.innerHTML = `<div class="stat-highlight">통계적 <span class="text-optimal">옵티멀 존 "${info.optimal}" (${((info.optHits/total)*100).toFixed(1)}%)</span>, <span class="text-safe">세이프 존 "${info.safe}" (${((info.safeHits/total)*100).toFixed(1)}%)</span></div>`;
                }
                var tip = document.getElementById(cfg.id + '-tip');
                if (tip && self.LOTTO_TIPS[cfg.id]) tip.innerHTML = '<strong>공략 팁:</strong> ' + self.LOTTO_TIPS[cfg.id].replace(/{safe}/g, info.safe);
            }
        });

        if (data.markov_ending_matrix) {
            var m = data.markov_ending_matrix; var topF = 0, topT = 0, maxP = 0;
            for (var r=0; r<10; r++) {
                var rSum = m[r].reduce((a,b)=>a+b,0); if (rSum === 0) continue;
                for (var c=0; c<10; c++) { var p = (m[r][c]/rSum)*100; if(p>maxP){maxP=p; topF=r; topT=c;}}
            }
            var mBox = document.getElementById('markov-stat-container');
            if (mBox) mBox.innerHTML = '<div class="stat-highlight" style="background:#e8f3ff; border-left-color:#3182f6; color:#1e40af;">최고 확률 흐름: <strong>끝수 ' + topF + ' → 끝수 ' + topT + ' (' + maxP.toFixed(1) + '%)</strong></div>';
        }
    },

    updatePensionGuide: function(data) {
        var self = this;
        LottoConfig.INDICATORS.forEach(function(cfg) {
            if (cfg.group.indexOf('GP') !== 0) return;
            var tip = document.getElementById(cfg.id + '-tip');
            if (tip && self.PENSION_TIPS[cfg.id]) tip.innerHTML = '<strong>설명:</strong> ' + self.PENSION_TIPS[cfg.id];
        });

        // 실시간 데이터 주입
        var hotNums = data.pos_freq.map(f => f.indexOf(Math.max(...f)));
        var bestG = Object.entries(data.group_dist).sort((a,b)=>b[1]-a[1])[0][0];
        
        var statBox = document.getElementById('p-pos-freq-stat-container');
        if (statBox) statBox.innerHTML = `<div class="stat-highlight">현재 각 자리별 최다 출현 번호: <strong>${hotNums.join(', ')}</strong></div>`;
        
        var gBox = document.getElementById('p-group-stat-container');
        if (gBox) gBox.innerHTML = `<div class="stat-highlight">역대 가장 많이 당첨된 조: <strong>${bestG}조</strong></div>`;

        if (data.markov_matrix) {
            var topF=0, topT=0, maxP=0;
            for (var r=0; r<10; r++) {
                var rSum = data.markov_matrix[r].reduce((a,b)=>a+b,0); if (rSum===0) continue;
                for (var c=0; c<10; c++) { var p = (data.markov_matrix[r][c]/rSum)*100; if(p>maxP){maxP=p; topF=r; topT=c;}}
            }
            this.setVal('p-markov-best-flow', `최고 확률 전이: <strong>숫자 ${topF} → ${topT} (확률 ${maxP.toFixed(1)}%)</strong>`);
        }
    },

    calculateZoneInfo: function(stat, dist, cfg) {
        if (!stat || !dist) return null;
        var vals = Object.keys(dist).map(k => parseInt(k.split(/[ :\-]/)[0])).filter(v => !isNaN(v));
        if (vals.length === 0) return null;
        var dMax = Math.max.apply(null, vals), dMin = Math.min.apply(null, vals);
        var limit = (cfg && cfg.maxLimit) ? Math.min(cfg.maxLimit, dMax) : dMax;
        var optMin = Math.max(dMin, Math.round(stat.mean - stat.std)), optMax = Math.min(limit, Math.round(stat.mean + stat.std));
        var safeMin = Math.max(dMin, Math.round(stat.mean - 2 * stat.std)), safeMax = Math.min(limit, Math.round(stat.mean + 2 * stat.std));
        var optHits = 0, safeHits = 0;
        for (var k in dist) { var v = parseInt(k.split(/[ :\-]/)[0]); if (!isNaN(v)) { if (v >= optMin && v <= optMax) optHits += dist[k]; if (v >= safeMin && v <= safeMax) safeHits += dist[k]; } }
        return { optimal: optMin + '~' + optMax, safe: safeMin + '~' + safeMax, optHits: optHits, safeHits: safeHits };
    },

    setVal: function(id, val) { var el = document.getElementById(id); if (el) el.innerHTML = val; }
};

document.addEventListener('DOMContentLoaded', function() { ContentLoader.init(); });
