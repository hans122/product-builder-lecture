'use strict';

/**
 * AI Analysis Engine v2.0 - Fully Automated Dashboard
 * - Dynamic Section Generation based on LottoConfig
 * - Seamless Chart & Table Integration
 */

var AnalysisEngine = {
    isPension: false,
    statsData: null,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) { self.statsData = data; self.runPensionAnalysis(data); }
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) { self.statsData = data; self.runLottoAnalysis(data); }
            });
        }
    },

    runLottoAnalysis: function(data) {
        var root = document.getElementById('dynamic-analysis-root');
        if (!root) return;
        root.innerHTML = '';

        // 1. 전략 그룹 (Hot/Cold) 등 기존 고정 섹션은 유지 혹은 상단 처리
        // ... (기존 상단 요약 로직 생략 가능 - 필요 시 보강)

        // 2. 지표 기반 섹션 동적 생성
        var indicators = LottoConfig.INDICATORS.filter(cfg => cfg.visible && cfg.visible.analysis);
        
        indicators.forEach(cfg => {
            var section = document.createElement('section');
            section.className = 'analysis-card';
            section.innerHTML = `
                <div class="card-header"><h3>📍 ${cfg.label} 분석</h3></div>
                <div class="analysis-layout-split" style="padding: 20px;">
                    <div class="chart-wrapper"><div id="${cfg.id}-chart" style="height: 200px;"></div></div>
                    <div class="mini-table-wrapper">
                        <h4>📊 최근 ${cfg.label} 리포트</h4>
                        <table class="mini-table"><tbody id="${cfg.id}-mini-body"></tbody></table>
                    </div>
                </div>
            `;
            root.appendChild(section);

            // 3. 데이터 주입
            var dist = data.distributions[cfg.distKey];
            var stat = data.stats_summary[cfg.statKey];
            if (dist) LottoUI.createCurveChart(cfg.id + '-chart', dist, cfg.unit, stat, cfg);
            LottoUI.renderMiniTable(cfg.id + '-mini-body', data.recent_draws.slice(0, 6), cfg);
        });

        // 4. 특수 섹션 (히트맵 등) 렌더링
        if (window.renderOverAppearanceAlert) renderOverAppearanceAlert(data.recent_draws);
        var markovMatrix = LottoAI.calculateEndingChainMatrix(data.recent_draws, 300);
        LottoUI.renderMarkovHeatmap('lotto-markov-heatmap', markovMatrix, { color: '49, 130, 246', rowLabel: '끝수 ' });
    },

    runPensionAnalysis: function(data) {
        // 연금 분석 자동화 로직 (필요 시 로또와 동일 패턴으로 구현)
        // 현재는 기존 로직 유지 혹은 단순화
    }
};

document.addEventListener('DOMContentLoaded', () => AnalysisEngine.init());
