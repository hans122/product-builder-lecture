# GEMINI.md - AI Coding Constitution (v2.1)

## [MANDATORY RULES]
1. **Unified Classification (G1~G5)**: 모든 UI는 `DATA_SCHEMA.md`에 정의된 5대 표준 분류 순서와 항목명을 엄격히 준수한다.
2. **Anchor Centering Policy**: 통계 섹션의 앵커 이동 시 반드시 `scroll-margin-top: 50vh`를 유지하여 제목이 화면 상하 정중앙에 위치하게 한다.
3. **Sticky Header Integrity**: `sticky-header` 내부의 `header-inner`, `my-numbers-banner`, `intro-text-section` 구조를 유지하여 고정 영역의 완성도를 보장한다.
4. **Data-Driven Guidance**: 가이드 페이지 및 안내 문구는 절대로 하드코딩하지 않으며, 반드시 `advanced_stats.json` 데이터를 실시간 분석하여 투영한다.

## [FILE RESPONSIBILITIES]
- `index.html`: G1~G5 링크가 포함된 실시간 분석 대시보드.
- `analysis.html`: 50vh 스크롤 정책이 적용된 심층 통계 카드 모음.
- `guide.js`: 실시간 통계 기반의 지능형 텍스트 생성 엔진.
