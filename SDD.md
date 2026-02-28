# 로또 번호 분석 및 추천 서비스 SDD (v3.13)

## 1. 헤더 및 내비게이션 고도화
- **Unified Header Layout**: `header-inner` 및 `header-top-row` 구조를 전 HTML에 적용하여 제목과 내비게이션의 상단 중앙 정렬 완성.
- **Anchor Scroll Optimization**: `style.css`의 `scroll-margin-top`을 `140px`로 고정하여 스티키 헤더에 의한 앵커 가려짐 현상 해결.

## 2. 분석 엔진 및 알고리즘
- **Combination State Persistence**: 
    - `combination.js` 내 `saveSelection()` 및 `loadSavedSelection()` 구현.
    - `manualNumbers`와 `autoNumbers` Set 객체를 JSON 직렬화하여 `localStorage`에 상주.
    - 페이지 로드 시 마킹 버튼(`.select-ball`)의 클래스를 상태에 따라 동적 부여하여 UI 복구.
- **Master Analysis Sequence Implementation**: `G1`~`G5` 표준 시퀀스 엄격 준수.

## 3. UI 레이아웃 및 시각화
- **Standardized Analysis Grids**: 모든 페이지의 분석 리포트 그리드를 G1~G5 섹션 구조로 재편.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
