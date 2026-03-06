/**
 * AI Content Loader v1.0 (Dynamic Guide & Tooltips)
 * - Unified Logic for Live Stat Updates in Guides
 * - Theme-aware Content Injector
 */

var ContentLoader = {
    isPension: false,

    init: function() {
        this.isPension = document.body.classList.contains('pension-theme');
        var self = this;

        if (this.isPension) {
            LottoDataManager.getPensionStats(function(data) {
                if (data) self.updatePensionGuide(data);
            });
        } else {
            LottoDataManager.getStats(function(data) {
                if (data) self.updateLottoGuide(data);
            });
        }
    },

    updateLottoGuide: function(data) {
        if (!data || !data.distributions || !data.stats_summary) return;
        var dists = data.distributions;
        var stats = data.stats_summary;
        var total = data.total_draws;

        LottoConfig.INDICATORS.forEach(cfg => {
            var container = document.getElementById(cfg.id + '-stat-container');
            var info = this.calculateZoneInfo(stats[cfg.statKey], dists[cfg.distKey], cfg);
            if (info && container) {
                var optProb = ((info.optHits / total) * 100).toFixed(1);
                var safeProb = ((info.safeHits / total) * 100).toFixed(1);
                container.innerHTML = `<div class="stat-highlight">
                    통계적 <span class="text-optimal">옵티멀 존 "${info.optimal}" (${optProb}%)</span>, 
                    <span class="text-safe">세이프 존 "${info.safe}" (${safeProb}%)</span>
                </div>`;
            }
        });
    },

    calculateZoneInfo: function(stat, dist, cfg) {
        if (!stat || !dist) return null;
        var vals = Object.keys(dist).map(k => parseInt(k.split(/[ :\-]/)[0])).filter(v => !isNaN(v));
        var dMax = Math.max(...vals), dMin = Math.min(...vals);
        var limit = (cfg && cfg.maxLimit) ? Math.min(cfg.maxLimit, dMax) : dMax;

        var optMin = Math.max(dMin, Math.round(stat.mean - stat.std));
        var optMax = Math.min(limit, Math.round(stat.mean + stat.std));
        var safeMin = Math.max(dMin, Math.round(stat.mean - 2 * stat.std));
        var safeMax = Math.min(limit, Math.round(stat.mean + 2 * stat.std));

        var optHits = 0, safeHits = 0;
        Object.entries(dist).forEach(([k, c]) => {
            var v = parseInt(k.split(/[ :\-]/)[0]);
            if (!isNaN(v)) {
                if (v >= optMin && v <= optMax) optHits += c;
                if (v >= safeMin && v <= safeMax) safeHits += c;
            }
        });
        return { optimal: optMin + '~' + optMax, safe: safeMin + '~' + safeMax, optHits: optHits, safeHits: safeHits };
    },

    updatePensionGuide: function(data) {
        var total = data.total_draws;
        var recent = data.recent_draws;
        
        // 자리수별 고빈도 번호
        var hotNums = data.pos_freq.map(freq => {
            var maxV = Math.max(...freq);
            return freq.indexOf(maxV);
        });
        this.setVal('p1-hot-numbers', hotNums.join(', '));

        // 조별 베스트
        var bestG = 1, maxG = 0;
        Object.entries(data.group_dist).forEach(([g, c]) => { if(c > maxG) { maxG = c; bestG = g; } });
        this.setVal('p3-best-group', bestG + '조');

        // 패턴 및 균형 지표 (최근 100회차 샘플링 분석 권장하나 전체 데이터 기준 수행)
        var counts = { seq: 0, golden: 0, carry: 0 };
        recent.forEach((d, i) => {
            var p = PensionUtils.analyzePatterns(d.nums);
            var b = PensionUtils.analyzeBalance(d.nums);
            if (p.seq >= 2) counts.seq++;
            if (b.sum >= 20 && b.sum <= 34) counts.golden++;
            if (i < recent.length - 1) {
                var prev = recent[i+1].nums;
                if (d.nums.some((n, idx) => n === prev[idx])) counts.carry++;
            }
        });

        this.setRate('p2-seq-rate', counts.seq, recent.length);
        this.setRate('p4-golden-rate', counts.golden, recent.length);
        this.setRate('p5-carry-rate', counts.carry, recent.length - 1);
    },

    setVal: function(id, val) { var el = document.getElementById(id); if (el) el.innerText = val; },
    setRate: function(id, count, total) { var el = document.getElementById(id); if (el && total > 0) el.innerText = ((count / total) * 100).toFixed(1); }
};

document.addEventListener('DOMContentLoaded', function() { ContentLoader.init(); });
