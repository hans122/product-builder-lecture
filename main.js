/**
 * Main Analysis Logic v6.0 - Immortal Guardian (ES5 Stable)
 */

var mainStatsData = null;

document.addEventListener('DOMContentLoaded', function() {
    // 1. 스켈레톤 UI 표시
    var gridContainer = document.getElementById('main-indicator-grid');
    if (gridContainer) {
        LottoUI.showSkeletons('main-indicator-grid', 6);
    }

    // 2. 데이터 로드 (콜백 방식 통일)
    LottoDataManager.getStats(function(data) {
        if (!data) return;
        mainStatsData = data;

        // 최근 당첨 번호 정보 표시 (상단 배너)
        if (data.recent_draws && data.recent_draws.length > 0) {
            var lastDraw = data.recent_draws[0];
            var ballContainer = document.getElementById('last-draw-balls');
            if (ballContainer) {
                ballContainer.innerHTML = '';
                for (var i = 0; i < lastDraw.nums.length; i++) {
                    ballContainer.appendChild(LottoUI.createBall(lastDraw.nums[i], true));
                }
                var lastDrawInfo = document.getElementById('last-draw-info');
                if (lastDrawInfo) lastDrawInfo.style.display = 'flex';
            }
        }
        
        // 실시간 분석 대상 결정
        var savedNumbers = localStorage.getItem('lastGeneratedNumbers');
        var sourceTitle = document.getElementById('analysis-source-title');
        
        if (savedNumbers) {
            try {
                var numbers = JSON.parse(savedNumbers);
                if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 사용자 조합";
                window.analyzeNumbers(numbers);
            } catch(e) { 
                if (data.recent_draws) window.analyzeNumbers(data.recent_draws[0].nums);
            }
        } else if (data.recent_draws && data.recent_draws.length > 0) {
            if (sourceTitle) sourceTitle.innerText = "📊 분석 결과: 최근 당첨 번호";
            window.analyzeNumbers(data.recent_draws[0].nums);
        }
    });
});

/**
 * [LottoCore 연동] 지표 분석 및 동적 렌더링
 */
window.analyzeNumbers = function(numbers) {
    if (!mainStatsData) return;
    
    // 분석 대상 번호 시각화
    var targetContainer = document.getElementById('analysis-target-balls');
    if (targetContainer) {
        targetContainer.innerHTML = '';
        var sortedNums = [].concat(numbers).sort(function(a, b) { return a - b; });
        for (var i = 0; i < sortedNums.length; i++) {
            targetContainer.appendChild(LottoUI.createBall(sortedNums[i], true));
        }
    }

    // 메인 그리드 동적 렌더링
    var mainIndicatorIds = LottoConfig.PAGES.INDEX;
    LottoUI.renderIndicatorGrid('main-indicator-grid', mainIndicatorIds, numbers, mainStatsData);
};
