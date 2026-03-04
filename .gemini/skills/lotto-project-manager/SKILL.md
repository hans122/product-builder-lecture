# Lotto Project Manager Skill (v9.2)

AI 로또/연금 분석 서비스의 데이터 무결성, 아키텍처 가디언 및 자동화 관리 스킬입니다.

## 🛡️ 핵심 아키텍처: 이모탈 가디언 (v9.2)
1. **0초 로딩 (Persistent Cache)**: `localStorage` 기반 v9.2 버전 관리. 사생활 보호 모드(Private Browsing) 대응을 위한 `try-catch` 스토리지 샌드박스 적용.
2. **불사신 엔진 (Error Isolation)**: 지표 계산 및 시너지 검증 오류 시 해당 항목만 격리(Isolation) 처리하여 전체 시스템 가용성 100% 유지.
3. **하이브리드 데이터 로드**: 구형 WebView 호환을 위한 `Callback` 패턴과 최신 브라우저를 위한 `Promise` 방식을 동시 지원.
4. **시각적 예열 (Skeleton UI)**: 데이터 로딩 찰나의 순간에 실루엣 UI를 제공하여 체감 속도 최적화.

## 🔮 AI 예측 및 백테스트 전략
- **5대 차별화 전략**: Standard(정석), Trend(흐름), Hot(기세), Balanced(균형), Defensive(방어) 전략 운용.
- **무결성 검증**: 모든 추천 조합은 미래 데이터를 차단한 **Time-Slice 백테스트**를 통해 유효성 검증 완료.
- **시너지 엔진 (G0/P0)**: 로또와 연금 각각에 최적화된 상관관계 분석 엔진(`LottoSynergy`, `PensionSynergy`) 탑재.

## 🎟️ 연금복권 분석 표준화
- **티켓형 레이아웃 (Ticket UI)**: '조(Group)'와 '6자리 번호'를 물리적으로 분리하고 자리수 레이블링(1위~6위)을 적용한 실제 복권 규격 준수.
- **실시간 Gap 분석**: 자리수별 숫자 미출현 회차를 히트맵으로 시각화하여 임계점 도달 번호 식별.
- **자동화 파이프라인**: `update_pension.py`를 통해 매주 목요일 추첨 직후 데이터 자동 수집 및 지연 대응(Retry) 수행.

## 🛠️ 개발 및 유지보수 원칙
- **ES5 Strict Stability**: 모든 코어 스크립트(`core.js`, `main.js`, `prediction.js`)는 `var`, `function` 기반의 ES5 문법을 엄격히 준수하여 크로스 브라우징 보장.
- **Cache Busting**: 엔진 수정 시 `core.js`의 `SYSTEM_VERSION`을 반드시 상향하여 클라이언트 동기화 강제.

## 🔄 버전 관리 및 배포
- 모든 작업 완료 후 `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행하여 문서 정합성을 유지한다.
