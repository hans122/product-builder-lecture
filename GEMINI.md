# GEMINI.md - AI Coding Constitution (v2.1)

## [MANDATORY RULES]
1. **Unified Classification (G1~G5)**: 모든 UI는 `DATA_SCHEMA.md`에 정의된 5대 표준 분류 순서와 항목명을 엄격히 준수한다.
2. **Data-Driven Automation (SSOT)**: 지표 추가/수정 시 각 JS 파일의 `INDICATOR_CONFIG` 설정을 통해 관리하며, 하드코딩된 반복 로직을 지양한다.
3. **Anchor Centering Policy**: 통계 섹션의 앵커 이동 시 반드시 `scroll-margin-top: 50vh`를 유지하여 제목이 화면 상하 정중앙에 위치하게 한다.
4. **Sticky Header Integrity**: `sticky-header` 내부의 `header-inner`, `my-numbers-banner`, `intro-text-section` 구조를 유지하여 고정 영역의 완성도를 보장한다.
5. **Data-Driven Guidance**: 가이드 페이지 및 안내 문구는 절대로 하드코딩하지 않으며, 반드시 `advanced_stats.json` 데이터를 실시간 분석하여 투영한다.

## [FILE RESPONSIBILITIES]
- `index.html`: G1~G5 링크가 포함된 실시간 분석 대시보드.
- `analysis.html`: 50vh 스크롤 정책이 적용된 심층 통계 카드 모음.
- `combination.html`: 로또 용지 UI를 통한 번호 선택 및 사용자 조합 정밀 분석.
- `combination.js`: 번호 선택 상태 관리(localStorage) 및 실시간 조합 분석 로직.
- `guide.js`: 실시간 통계 기반의 지능형 텍스트 생성 엔진.

## [VIBE CODING PROTOCOL]
1. **Speed & Precision**: 모호한 요청은 '가장 일반적이고 합리적인' 방식으로 즉시 구현 후 확인을 받는다. 불필요한 질문으로 흐름을 끊지 않는다.
2. **Context Retention**: 프로젝트의 핵심 규칙(G1~G5 분류, 디자인 시스템)은 매 턴마다 재학습하지 않고 내재화하여 즉각 적용한다.
3. **Proactive Maintenance**: 수정 중 발견된 연관된 사소한 버그나 스타일 오류는 별도 지시 없이도 함께 수정하여 코드 품질을 유지한다.
4. **Live Documentation**: 변경 사항이 아키텍처나 주요 로직에 영향을 줄 경우, 즉시 `GEMINI.md`나 `PRD.md`를 동기화하여 '문서의 최신성'을 보장한다.
