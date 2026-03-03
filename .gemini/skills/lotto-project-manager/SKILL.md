# Lotto Project Manager Skill (v8.7)

AI 로또/연금 분석 서비스의 데이터 무결성 및 아키텍처 가디언 스킬입니다.

## 🛡️ 핵심 아키텍처: 이모탈 가디언 (v8.7)
1. **0초 로딩 (Persistent Cache)**: `localStorage` 기반 v8.7 시스템 버전 관리로 즉시 업데이트 보장.
2. **불사신 엔진 (Error Isolation)**: 지표 계산 오류 시 해당 항목만 격리(Isolation) 처리하여 시스템 가용성 유지.
3. **지능형 동기화 (Smart Sync)**: 시스템 버전 변경 시 구버전 캐시 즉시 파기 및 최신 데이터 갱신.

## 🔮 AI 예측 전략 (Backtest Proven)
최근 100회차 백테스트(Time-Slice 방식)를 통해 검증된 5대 전략을 운용한다.
- **💎 다차원 최적화 (Standard)**: 평균 적중률 최상 (Avg 0.87)
- **📊 패턴 유사도형 (Trend)**: 최근 흐름 추종
- **🔥 기세 추종형 (Hot)**: 다출현 번호 집중 (변칙 당첨 변별력 입증)
- **⚖️ 밸런스 가중형 (Balanced)**: 수치적 대칭 최적화
- **🛡️ 데이터 방어형 (Defensive)**: 장기 미출현 번호 전략적 포함 (평균 회귀 노림)

## 🎟️ 연금복권 UI/UX 표준
- **티켓형 레이아웃 (Ticket UI)**: 모든 연금 조합 표시 시 '조(주황 사각)'와 '번호(하얀 원형)'를 수직선으로 물리적 분리하여 렌더링한다.
- **자리수 레이블링**: 각 번호 상단에 위치 정보(조, 1~6위)를 명시하여 시인성을 극대화한다.
- **고득점 필터링**: 추천 조합 생성 시 통계적 우량 점수(최소 85점)를 통과한 조합만 선별 노출한다.

## 🛠️ 구현 원칙
- **ES5 Hyper Stability**: 모든 코어 로직은 구형 WebView 호환을 위해 `var`, `function` 기반 문법을 엄격히 준수한다.
- **Cache Busting**: UI 표준 변경이나 로직 수정 시 `core.js`의 `SYSTEM_VERSION`을 반드시 상향한다.

## 🔄 버전 관리 및 배포
- 작업 완료 후 반드시 `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행한다.
