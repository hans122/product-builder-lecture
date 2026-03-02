/**
 * Main Analysis Logic - LottoCore v4.3 기반 리팩토링
 */

let mainStatsData = null;

document.addEventListener('DOMContentLoaded', async function() {
    mainStatsData = await LottoDataManager.getStats();
    if (!mainStatsData) return;

    // 1. 최근 당첨 번호 정보 표시 (상단 배너)
    if (mainStatsData.last_3_draws && mainStatsData.last_3_draws.length > 0) {
        const infoContainer = document.getElementById('last-draw-info');
        const ballContainer = document.getElementById('last-draw-balls');
        if (infoContainer && ballContainer) {
            infoContainer.style.display = 'flex';
            ballContainer.innerHTML = '';
            mainStatsData.last_3_draws[0].forEach(num => {
                const ball = document.createElement('div');
                ball.className = `ball mini ${LottoUtils.getBallColorClass(num)}`;
                ball.innerText = num;
                ballContainer.appendChild(ball);
            });
        }
    }
    
    // 2. 실시간 분석 대상 결정 (사용자 번호 > 최근 당첨 번호)
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    const sourceTitle = document.getElementById('analysis-source-title');
    
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 사용자 조합";
        analyzeNumbers(numbers);
    } else if (mainStatsData.last_3_draws && mainStatsData.last_3_draws.length > 0) {
        if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 최근 당첨 번호 (참조)";
        analyzeNumbers(mainStatsData.last_3_draws[0]);
    }
});

function analyzeNumbers(numbers) {
    if (!mainStatsData) return;
    
    // 분석 대상 번호 시각화
    const targetContainer = document.getElementById('analysis-target-balls');
    if (targetContainer) {
        targetContainer.innerHTML = '';
        [...numbers].sort((a, b) => a - b).forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball mini ${LottoUtils.getBallColorClass(num)}`;
            ball.innerText = num;
            targetContainer.appendChild(ball);
        });
    }

    const summary = mainStatsData.stats_summary || {};

    // [LottoCore 통합 연동] 메인에서 보여줄 핵심 6개 지표만 필터링하여 처리
    const mainIndicatorIds = ['sum', 'odd-even', 'high-low', 'period_1', 'neighbor', 'ac'];
    
    LottoConfig.INDICATORS.filter(cfg => mainIndicatorIds.includes(cfg.id)).forEach(cfg => {
        const element = document.getElementById(cfg.id);
        if (!element) return;
        
        const value = cfg.calc(numbers, mainStatsData);
        const status = LottoUtils.getZStatus(value, summary[cfg.statKey]);
        updateAnalysisItem(element, value, status, cfg.label, summary[cfg.statKey]);
    });
}

function updateAnalysisItem(element, text, status, label, stat) {
    if (!element) return;
    element.innerText = text;
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.className = 'analysis-item ' + status;
        if (stat) {
            const optMin = Math.max(0, Math.round(stat.mean - stat.std));
            const optMax = Math.round(stat.mean + stat.std);
            const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            const safeMax = Math.round(stat.mean + 2 * stat.std);
            const link = element.closest('a') || parent;
            link.setAttribute('data-tip', `[${label}] 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})`);
        }
    }
}
