/**
 * Statistical Analysis Page v6.1 - LottoCore 통합 및 팩토링 완료
 */

let globalStatsData = null;

function restoreMyNumbers() {
    const section = document.getElementById('my-numbers-section');
    const list = document.getElementById('my-numbers-list');
    if (!section || !list) return;
    const saved = localStorage.getItem('lastGeneratedNumbers');
    if (!saved) { section.style.display = 'none'; return; }
    try {
        const nums = JSON.parse(saved);
        if (Array.isArray(nums) && nums.length === 6) {
            section.style.display = 'flex';
            list.innerHTML = '';
            [...nums].sort((a, b) => a - b).forEach(n => {
                list.appendChild(LottoUI.createBall(n, true));
            });
        } else { section.style.display = 'none'; }
    } catch (e) { section.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', async function() {
    restoreMyNumbers();
    globalStatsData = await LottoDataManager.getStats();
    if (!globalStatsData) return;

    const dists = globalStatsData.distributions;
    const stats = globalStatsData.stats_summary || {};

    // 1. 설정 기반 차트 및 미니 표 자동 렌더링 (Core 통합)
    const saved = localStorage.getItem('lastGeneratedNumbers');
    let myNums = null;
    try { if(saved) myNums = JSON.parse(saved); } catch(e){}

    LottoConfig.INDICATORS.forEach(cfg => {
        // 차트 렌더링 (LottoUI 공통 엔진 사용)
        if (dists[cfg.distKey]) {
            let myVal = null;
            if (myNums && cfg.calc) myVal = cfg.calc(myNums.sort((a,b)=>a-b), globalStatsData);
            LottoUI.createCurveChart(`${cfg.id}-chart`, dists[cfg.distKey], cfg.unit, stats[cfg.statKey], cfg, myVal);
        }
        // 미니 표 렌더링 (LottoUI 공통 엔진 사용)
        if (globalStatsData.recent_draws) {
            LottoUI.renderMiniTable(`${cfg.id}-mini-body`, globalStatsData.recent_draws.slice(0, 6), cfg);
        }
    });

    if (globalStatsData.frequency) renderFrequencyChart(globalStatsData.frequency);
});

function renderFrequencyChart(data) {
    const container = document.getElementById('full-frequency-chart'); if(!container) return;
    container.innerHTML = '';
    const freqs = Object.values(data); const maxFreq = Math.max(...freqs, 1);
    for (let i = 1; i <= 45; i++) {
        const f = data[i] || 0; const h = (f / maxFreq) * 85;
        const w = document.createElement('div'); w.className = 'bar-wrapper';
        const b = document.createElement('div'); b.className = `bar ${LottoUtils.getBallColorClass(i)}`; b.style.height = `${h}%`;
        const v = document.createElement('span'); v.className = 'bar-value'; v.innerText = f;
        b.appendChild(v);
        const l = document.createElement('span'); l.className = 'bar-label'; l.innerText = i;
        w.appendChild(b); w.appendChild(l); container.appendChild(w);
    }
}
