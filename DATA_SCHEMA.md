# DATA_SCHEMA.md - Variable & Data Structures (v3.23)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 정규분포 확률을 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷과 컬러 배지 시스템을 적용한다.

## 2. 데이터 보존 정책 (Client-side Persistence)
- **Local Storage Keys**:
    - `combination_saved_picks`: 사용자가 선택한 수동/자동 번호 데이터 (JSON object).
    - `lastGeneratedNumbers`: 메인 화면에서 생성한 마지막 번호 세트.

## 3. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js / combination.js)
- **Full Indicator Coverage**: 22종 표준 지표 실시간 판정.
- **Standardized Naming Policy**: 전 화면 메뉴 및 제목 명칭 완전 동기화.
- `getZoneInfo()` / `getStatus()`: 정규분포 영역을 판정하는 핵심 유틸리티.
