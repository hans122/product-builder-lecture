# DATA_SCHEMA.md - Variable & Data Structures (v3.18)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 정규분포 확률을 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷과 컬러 배지 시스템을 적용한다.

### 시각 요소 및 범례 정의
- **최적 (Optimal)**: $\mu \pm 1\sigma$ (68.2%).
- **안전 (Safe)**: $\mu \pm 2\sigma$ (95.4%).
- **주의 (Warning)**: 95.4% 신뢰 범위를 벗어난 희귀 영역.

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js / combination.js)
- **Full Indicator Guide Coverage**: 가이드 페이지에서 노출되는 모든 메인/하위 지표(15종 이상)에 대해 `stats_summary` 기반 적중률 산출.
- **Manual vs Auto Distinction Policy**: `manualNumbers` (Navy marking, "MY" label) vs `autoNumbers` (Red marking).
- **Unified Badge System**: 모든 분석 리포트에서 `status-badge` 클래스를 통해 통합된 시각 피드백 제공.
- `getZoneInfo()` / `getStatus()`: 정규분포 영역을 판정하는 핵심 유틸리티.
