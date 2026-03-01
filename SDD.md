# 로또 번호 분석 및 추천 서비스 SDD (v3.14)

## 1. 외부 서비스 통합 및 인터랙션
- **Disqus Comments Implementation**:
    - 전 HTML 파일 하단에 `disqus_thread` 컨테이너 및 임베드 스크립트 적용.
    - `disqus_config` 설정을 통해 `index`, `analysis`, `combination`, `history`, `guide`, `privacy` 등 각 페이지별 독립된 식별자 부여.
- **Share-to-Comment Workflow**:
    - 번호 생성(`main.js`) 및 정밀 분석(`combination.js`) 로직 종료 시점에 `showSharePrompt()` 함수 호출.
    - `navigator.clipboard.writeText`를 활용한 번호 복사 및 공유 유도 텍스트 자동 생성.

## 2. 분석 엔진 및 알고리즘
- **Combination State Persistence**: 
    - `combination.js` 내 `saveSelection()` 및 `loadSavedSelection()` 구현.
    - `manualNumbers`와 `autoNumbers` Set 객체를 JSON 직렬화하여 `localStorage`에 상주.
- **AI Prediction Engine & Rolling Backtest**:
    - `prediction.js`: 롤링 윈도우 기반 예측 로직 및 `generateSmartCombinations()`를 통한 필터링 조합 생성.
    - [Refresh Logic]: `lastHotPool` 전역 상태를 활용하여 페이지 리로드 없이 비동기식 조합 재생성 지원.
    - [Data Transfer]: 선택된 조합을 `pending_analysis_numbers` 키로 `localStorage`에 직렬화하여 페이지 간 데이터 공유.
- **Auto-Analysis Mechanism**:
    - `combination.js`: 로드 시 `localStorage`를 체크하여 대기 중인 번호가 있을 경우 즉시 마킹 UI 업데이트 및 `runDetailedAnalysis()` 자동 트리거.
- **Cross-Browser UI Optimization**:
    - 크롬 등 다양한 브라우저에서의 수치 찌부러짐 현상을 방지하기 위해 성과 요약 바에 표준 HTML Table 레이아웃 적용.
- **Master Analysis Sequence Implementation**: `G1`~`G5` 표준 시퀀스 엄격 준수.

## 3. UI 레이아웃 및 시각화
- **Interactive Share Section**: CSS 애니메이션(`fadeIn`)이 적용된 공유 유도 섹션(`share-prompt-section`) 구현.
- **Anchor Scroll Optimization**: `style.css`의 `scroll-margin-top`을 `140px`로 고정하여 스티키 헤더에 의한 앵커 가려짐 현상 해결.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
