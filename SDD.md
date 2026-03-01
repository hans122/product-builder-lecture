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
    - `prediction.js`에서 롤링 윈도우(Rolling Window) 기법을 활용한 가중치 기반 예측 로직 구현.
    - 최근 20회차에 대해 '당시 알 수 있었던 정보'만을 사용하여 동적으로 예상수(Hot), 보류수(Neutral), 제외수(Cold)를 산출.
    - AI 스마트 조합 엔진: 선정된 풀 내에서 합계(100~175) 및 홀짝(2:4~4:2) 필터링을 통과한 Top 5 조합 생성.
- **Cross-Browser UI Optimization**:
    - 크롬 등 다양한 브라우저에서의 수치 찌부러짐 현상을 방지하기 위해 성과 요약 바에 표준 HTML Table 레이아웃 적용.
- **Master Analysis Sequence Implementation**: `G1`~`G5` 표준 시퀀스 엄격 준수.

## 3. UI 레이아웃 및 시각화
- **Interactive Share Section**: CSS 애니메이션(`fadeIn`)이 적용된 공유 유도 섹션(`share-prompt-section`) 구현.
- **Anchor Scroll Optimization**: `style.css`의 `scroll-margin-top`을 `140px`로 고정하여 스티키 헤더에 의한 앵커 가려짐 현상 해결.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
