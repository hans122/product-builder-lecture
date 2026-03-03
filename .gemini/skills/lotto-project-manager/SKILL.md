# Lotto Project Manager Skill (v8.6)

AI 로또/연금 분석 서비스의 데이터 무결성 및 아키텍처 가디언 스킬입니다.

## 🛡️ 핵심 아키텍처: 이모탈 가디언 (v8.6)
1. **0초 로딩 (Persistent Cache)**: `localStorage` 기반 v8.6 시스템 버전 관리로 즉시 업데이트 보장.
2. **불사신 엔진 (Error Isolation)**: 지표 계산 오류 시 해당 항목만 격리(Isolation) 처리.
3. **지능형 동기화 (Smart Sync)**: 매일 첫 접속 또는 시스템 버전 변경 시 서버 데이터 갱신.

## 🔮 AI 예측 전략 (Backtest Proven)
최근 100회차 백테스트(Time-Slice 방식)를 통해 검증된 5대 전략을 운용한다.
- **💎 다차원 최적화 (Standard)**: 평균 적중률 최상 (Avg 0.87)
- **📊 패턴 유사도형 (Trend)**: 최근 흐름 추종
- **🔥 기세 추종형 (Hot)**: 다출현 번호 집중 (당첨 변별력 입증)
- **⚖️ 밸런스 가중형 (Balanced)**: 수치적 대칭 최적화
- **🛡️ 데이터 방어형 (Defensive)**: 장기 미출현 번호 전략적 포함 (이변 대비)

## 🎟️ 연금복권 UI/UX 표준
- **티켓형 레이아웃**: 모든 연금 조합은 '조(사각 박스)'와 '6자리 번호(원형 공)'를 물리적으로 분리하여 렌더링한다.
- **전문가용 정밀 리포트**: P1~P8 지표를 종합하여 100점 만점 스코어 및 S/A/B/C 등급을 산출한다.
- **신뢰도 지표**: AI 추천 시 통계적 정합성(Confidence) 수치를 %로 명시한다.

## 🛠️ 구현 원칙
- **ES5 Hyper Stability**: 구형 WebView 호환을 위해 `var`, `function` 기반의 ES5 문법을 엄격히 준수한다.
- **Cache Busting**: 주요 로직 수정 시 `core.js`의 `SYSTEM_VERSION`을 반드시 상향한다.

## 🔄 버전 관리 및 배포
- 작업 완료 후 반드시 `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행하여 문서 동기화를 수행한다.
