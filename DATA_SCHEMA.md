# DATA_SCHEMA.md - Variable & Data Structures (v3.15)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 정규분포 확률을 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷과 컬러 배지 시스템을 적용한다.

### 시각 요소 및 범례 정의
- **최적 (Optimal)**: $\mu \pm 1\sigma$ (68.2%).
- **안전 (Safe)**: $\mu \pm 2\sigma$ (95.4%).
- **주의 (Warning)**: 95.4% 신뢰 범위를 벗어난 희귀 영역.

### 데이터 매핑 정책 (Analysis Engine)
분석 엔진은 수치형 데이터 판정 시 `stats_summary`의 정확한 키를 참조해야 한다.
- 홀짝: `odd_count` (not odd_even)
- 고저: `low_count` (not high_low)
- 1~3회전: `period_1_3`
- 기타 지표는 원본 `distributions` 키와 동일.

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js / combination.js)
- **Unified Badge System**: 모든 분석 리포트에서 `status-badge` 클래스를 통해 통합된 시각 피드백 제공.
- **Auto-Analysis Trigger**: 번호 6개 완성 시 즉각적인 분석 엔진 가동 정책.
- `getZoneInfo()` / `getStatus()`: 정규분포 영역을 판정하는 핵심 유틸리티.
