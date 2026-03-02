# GEMINI.md - AI Coding Constitution (v2.5)

## [MANDATORY RULES]
1. **Document-First Workflow**: 모든 작업(구현, 수정, 리팩토링) 시작 전, 반드시 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락과 기술 표준을 내재화한다.
2. **Unified Classification (G1~G6)**: 모든 UI 및 데이터 표시는 `DATA_SCHEMA.md`에 정의된 5대 표준 분류 및 G6 고급 지표 순서와 항목명을 절대적 기준으로 삼는다.
3. **Core-Centric Development (LottoCore)**: 공통 로직, 유틸리티, UI 렌더링은 반드시 `core.js`를 거쳐야 하며, 각 페이지 스크립트에서의 중복 정의를 금지한다.
4. **Data-Driven Automation (Master Mapping)**: 모든 데이터 키값 및 JS ID는 `DATA_SCHEMA.md`의 마스터 매핑 테이블을 절대적 기준으로 삼는다.
5. **Architectural Conformity**: 문서에 정의된 설계 철학(Sticky Columns, Slanted Header, SSOT 등)과 충돌하는 독자적 구현을 금지하며, 변경 시 반드시 문서를 동시 업데이트한다.
6. **Anchor Centering Policy**: 통계 섹션의 앵커 이동 시 반드시 `scroll-margin-top: 50vh`를 유지하여 제목이 화면 상하 정중앙에 위치하게 한다.
7. **Statistical Visualization Refinement**: 차트 라벨 색상 동기화, 최소 높이 200px 확보, 이중 빗금 정책을 준수한다.
8. **UX Performance Visualization**: 성과 지표는 S/A/B 등급제 및 직관적인 색상 강조 효과(Solid Color)를 통해 전달한다.
9. **Grid-Based Precision**: 예측 번호 풀은 10열 그리드를 기본으로 하며, 히스토리 표는 데이터 중심의 초콤팩트 레이아웃(40px 열 너비)을 준수한다.
10. **Expert Table Features**: 가로로 긴 표는 반드시 **45도 대각선 헤더**와 **틀 고정(회차/번호)** 기능을 적용한다.

## [RECENT UPDATES]
- **추천 조합(Top 5) 레이아웃 정밀화**: 카드 너비를 190px에서 170px로 축소하여 정보 밀도를 높이고 한 줄 배치를 더욱 강화.
- **번호 선택 UI 개선**: 실제 용지 감성의 빨간 사선 마킹을 제거하고, 시인성이 높은 솔리드 컬러 강조 방식으로 변경.
- **전문가용 히스토리 표 고도화**: 45도 대각선 헤더, 엑셀형 틀 고정, 우측 유령 공간 제거(v9.8).
- **시스템 팩토링 및 문서 최신화**: `indicators.js` 기반 자동화 완성 및 PRD/SDD/DATA_SCHEMA v4.0~6.0 동기화.
- **통계 레이아웃 최적화**: 차트(유연)와 미니 표(235px 고정)의 완벽한 밸런스 및 여백 확보.

## [MAINTENANCE & AUDIT]
- **엄격한 순위제**: 추천 풀은 단 1점 차이로도 변동될 수 있음을 인지한다.
- **백테스트 무결성**: 과거 시뮬레이션 시 미래 데이터 차단 로직을 엄격히 관리한다.

## [FILE RESPONSIBILITIES]
- `indicators.js`: 서비스의 모든 설정 및 지표 관리 (SSOT).
- `core.js`: 공통 유틸리티, 시너지 엔진, UI 컴포넌트 통합 관리.
- `index.html`, `analysis.html`, `combination.html`, `history.html`: 데이터 기반의 뷰(View).

## [VIBE CODING PROTOCOL]
1. **Speed & Precision**: 모호한 요청은 문서의 표준을 근거로 최적의 솔루션을 즉시 구현한다.
2. **Context Retention**: 프로젝트의 핵심 문서들을 매 턴마다 재학습하여 '의도'가 아닌 '설계'를 구현한다.
3. **Proactive Maintenance**: 변경 사항이 아키텍처에 영향을 줄 경우, 즉시 관련 문서를 동기화하여 '문서의 최신성'을 보장한다.
