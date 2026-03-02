# GEMINI.md - AI Coding Constitution (v2.2)

## [MANDATORY RULES]
1. **Unified Classification (G1~G5)**: 모든 UI는 `DATA_SCHEMA.md`에 정의된 5대 표준 분류 순서와 항목명을 엄격히 준수한다.
2. **Core-Centric Development (LottoCore)**: 공통 로직, 유틸리티, UI 렌더링은 반드시 `core.js`를 거쳐야 하며, 각 페이지 스크립트에서의 중복 정의를 금지한다.
3. **Data-Driven Automation (Master Mapping)**: 모든 데이터 키값 및 JS ID는 `DATA_SCHEMA.md`의 마스터 매핑 테이블을 절대적 기준으로 삼는다.
4. **Anchor Centering Policy**: 통계 섹션의 앵커 이동 시 반드시 `scroll-margin-top: 50vh`를 유지하여 제목이 화면 상하 정중앙에 위치하게 한다.
5. **Statistical Visualization Refinement**: 
    - 차트 라벨은 통계 구역과 색상을 동기화한다.
    - 차트 높이는 최소 200px 이상 확보하며, 이중 빗금(Dual-Hatching) 정책을 준수한다.
6. **Self-Maintaining Pipeline**: 데이터 갱신 시 `update_latest.py` 프로세스를 활용하여 전체 통계 체인의 무결성을 보장한다.
7. **UX Performance Visualization**: 성과 지표(적중 실적, 필터 제외)는 S/A/B 등급제 및 시각적 배지(빨간 사선 마킹, 스탬프 효과)를 통해 직관적으로 전달한다.

## [RECENT UPDATES]
- **과거 적중 실적 고도화**: 최근 20회차 백테스트 표에 S/A/일반 등급 시스템 및 '제외성공' 배지 적용.
- **조합 분석 용지 리뉴얼**: 실제 로또 용지 질감(웜 화이트), 세로형 칸 디자인, 빨간색 펜 사선 마킹(Slash) 효과 구현.
- **응답형 컨트롤 레이아웃**: 번호 선택 화면을 와이드 해상도에서 '좌 용지 - 우 컨트롤' 배치로 개선 (모바일은 상하 배치 유지).

## [FILE RESPONSIBILITIES]
... (중략) ...

- `analysis.html`: 50vh 스크롤 정책이 적용된 심층 통계 카드 모음.
- `combination.html`: 로또 용지 UI를 통한 번호 선택 및 사용자 조합 정밀 분석.
- `combination.js`: 번호 선택 상태 관리(localStorage) 및 실시간 조합 분석 로직.
- `guide.js`: 실시간 통계 기반의 지능형 텍스트 생성 엔진.

## [VIBE CODING PROTOCOL]
1. **Speed & Precision**: 모호한 요청은 '가장 일반적이고 합리적인' 방식으로 즉시 구현 후 확인을 받는다. 불필요한 질문으로 흐름을 끊지 않는다.
2. **Context Retention**: 프로젝트의 핵심 규칙(G1~G5 분류, 디자인 시스템)은 매 턴마다 재학습하지 않고 내재화하여 즉각 적용한다.
3. **Proactive Maintenance**: 수정 중 발견된 연관된 사소한 버그나 스타일 오류는 별도 지시 없이도 함께 수정하여 코드 품질을 유지한다.
4. **Live Documentation**: 변경 사항이 아키텍처나 주요 로직에 영향을 줄 경우, 즉시 `GEMINI.md`나 `PRD.md`를 동기화하여 '문서의 최신성'을 보장한다.
