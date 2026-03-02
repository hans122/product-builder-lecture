# GEMINI.md - AI Coding Constitution (v2.4)

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
8. **Grid-Based Precision**: 예측 번호 풀은 10열 그리드를 기본으로 하며, 히스토리 표는 데이터 중심의 초콤팩트 레이아웃(40px 열 너비)을 준수한다.
9. **Expert Table Features**: 가로로 긴 표는 반드시 **45도 대각선 헤더(Slanted Header)**와 **틀 고정(Sticky Columns: 회차/번호)** 기능을 적용하여 데이터 밀도와 가독성을 동시에 확보한다.
10. **Data-Driven Automation (SSOT)**: 표의 헤더와 데이터 열은 반드시 `indicators.js` 설정을 참조하여 동적으로 생성하며, HTML 내 수동 TH/TD 작성을 금지한다.

## [RECENT UPDATES]
- **전문가용 히스토리 표 고도화 (v9.8)**: 45도 대각선 헤더 및 엑셀형 틀 고정 기능 구현. 우측 유령 공간 제거를 위한 초압축 레이아웃 적용.
- **시스템 팩토링 완료**: `indicators.js` 기반의 헤더 자동 생성 로직 도입으로 유지보수 효율 극대화.
- **호환성 최적화**: Firebase Studio 웹뷰 등 제한적 환경에서도 헤더가 확실히 보이도록 DOM 생성 로직(innerHTML) 보강.
- **통계 화면 레이아웃 최적화**: 차트(유연)와 미니 표(고정)의 비율 및 여백을 정밀 조정하여 대시보드 시인성 향상.

## [MAINTENANCE & AUDIT]
- **엄격한 순위제 (Strict Ranking System)**: 추천 풀(Hot 30)은 단 1점 차이로도 풀이 변동될 수 있다. (예: 1213회차 5번은 31위로 탈락). 이는 모델의 객관성을 유지하기 위한 설계 의도이다.
- **백테스트 무결성**: 과거 회차 분석 시 반드시 해당 시점 직전(`currentIndex + 1`)의 데이터만 참조하도록 `history` 슬라이싱을 엄격히 관리한다.
- **데이터 업데이트**: 매주 추첨 후 `update_latest.py` 실행 시 `advanced_stats.json`의 `recent_draws`가 최신화되어 모델의 '빈도(Momentum)' 점수에 즉시 반영된다.

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
