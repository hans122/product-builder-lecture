/**
 * Main Analysis Logic v5.4 - 컴포넌트 기반 렌더링 적용
 */

let mainStatsData = null;

document.addEventListener('DOMContentLoaded', async function() {
    // 스켈레톤 UI 표시
    const gridContainer = document.getElementById('main-indicator-grid');
    if (gridContainer) gridContainer.innerHTML = '<div class="skeleton-grid" style="grid-column: span 2;">데이터 로딩 중...</div>';

    mainStatsData = await LottoDataManager.getStats();
    if (!mainStatsData) return;

    // 1. 최근 당첨 번호 정보 표시 (상단 배너)
    if (mainStatsData.last_3_draws && mainStatsData.last_3_draws.length > 0) {
        const ballContainer = document.getElementById('last-draw-balls');
        if (ballContainer) {
            ballContainer.innerHTML = '';
            mainStatsData.last_3_draws[0].forEach(num => {
                ballContainer.appendChild(LottoUI.createBall(num, true));
            });
            document.getElementById('last-draw-info').style.display = 'flex';
        }
    }
    
    // 2. 실시간 분석 대상 결정
    const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
    const sourceTitle = document.getElementById('analysis-source-title');
    
    if (savedNumbers) {
        const numbers = JSON.parse(savedNumbers);
        if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 사용자 조합";
        analyzeNumbers(numbers);
    } else if (mainStatsData.last_3_draws && mainStatsData.last_3_draws.length > 0) {
        if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 최근 당첨 번호";
        analyzeNumbers(mainStatsData.last_3_draws[0]);
    }
});

/**
 * [LottoCore 연동] 지표 분석 및 동적 렌더링
 */
window.analyzeNumbers = function(numbers) {
    if (!mainStatsData) return;
    
    // 분석 대상 번호 시각화
    const targetContainer = document.getElementById('analysis-target-balls');
    if (targetContainer) {
        targetContainer.innerHTML = '';
        [...numbers].sort((a, b) => a - b).forEach(num => {
            targetContainer.appendChild(LottoUI.createBall(num, true));
        });
    }

    // 메인 그리드 동적 렌더링
    const mainIndicatorIds = LottoConfig.PAGES.INDEX;
    LottoUI.renderIndicatorGrid('main-indicator-grid', mainIndicatorIds, numbers, mainStatsData);
};
