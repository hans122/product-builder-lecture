# GEMINI.md - AI Coding Constitution (v2.3)

## [MANDATORY RULES]
... (중략) ...
7. **UX Performance Visualization**: 성과 지표(적중 실적, 필터 제외)는 S/A/B 등급제 및 시각적 배지(빨간 사선 마킹, 스탬프 효과)를 통해 직관적으로 전달한다.
8. **Grid-Based Precision**: 예측 번호 풀은 10열 그리드(3줄/1줄)를 기본으로 하여 시각적 질서를 유지하며, 지표 리포트는 가로 3열 배치를 통해 정보 밀도를 최적화한다.

## [MAINTENANCE & AUDIT]
- **엄격한 순위제 (Strict Ranking System)**: 추천 풀(Hot 30)은 단 1점 차이로도 풀이 변동될 수 있다. (예: 1213회차 5번은 31위로 탈락). 이는 모델의 객관성을 유지하기 위한 설계 의도이다.
- **백테스트 무결성**: 과거 회차 분석 시 반드시 해당 시점 직전(`currentIndex + 1`)의 데이터만 참조하도록 `history` 슬라이싱을 엄격히 관리한다.
- **데이터 업데이트**: 매주 추첨 후 `update_latest.py` 실행 시 `advanced_stats.json`의 `recent_draws`가 최신화되어 모델의 '빈도(Momentum)' 점수에 즉시 반영된다.

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
