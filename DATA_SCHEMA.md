# DATA_SCHEMA.md - Variable & Data Structures (v2.6)

## 1. 가이드 페이지 UI/UX 통일 규격
모든 분석 가이드 지표는 사용자가 '팩트'에 기반한 정보를 얻고 있음을 인지하도록 아래의 공통 구조를 사용한다.
- **표준 문구**: 모든 통계 박스는 `"실제 통계 결과: "`라는 문구로 시작한다.
- **표준 스타일**: `.stat-highlight` 클래스로 감싸진 파란색 하이라이트 박스 내부에 핵심 통계를 배치한다.
- **데이터 병기**: `백분율% (해당회차/전체회차)` 형식을 엄격히 준수한다.

## 2. 가이드 섹션별 컨테이너 매핑
- **G1 (Basic)**: `sum-stat-container`, `oe-stat-container`, `hl-stat-container`
- **G2 (Correlation)**: `carry-stat-container`, `consecutive-stat-container`
- **G3 (Special)**: `special-stat-container`
- **G4 (Pattern)**: `bucket-stat-container`, `pattern-stat-container`
- **G5 (Advanced)**: `end-digit-stat-container`
