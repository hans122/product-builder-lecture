# DATA_SCHEMA.md - Variable & Data Structures (v3.21)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 정규분포 확률을 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷과 컬러 배지 시스템을 적용한다.

### 시각 요소 및 범례 정의
- **최적 (Optimal)**: $\mu \pm 1\sigma$ (68.2%).
- **안전 (Safe)**: $\mu \pm 2\sigma$ (95.4%).
- **주의 (Warning)**: 95.4% 신뢰 범위를 벗어난 희귀 영역.

### 표준 분석 그룹 (G1-G5)
1. **G1 (Basic)**: `sum`, `odd_count`, `low_count`
2. **G2 (Correlation)**: `period_1`, `neighbor`, `period_1_2`, `period_1_3`, `consecutive`
3. **G3 (Special)**: `prime`, `composite`, `multiple_3`, `multiple_5`, `square`, `double_num`
4. **G4 (Pattern)**: `bucket_15`, `bucket_9`, `bucket_5`, `bucket_3`, `color`, `pattern_corner`, `pattern_triangle`
5. **G5 (Expert)**: `end_sum`, `same_end`, `ac`, `span`

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js / combination.js)
- **Standardized Naming Policy**: 전 화면 메뉴 및 제목 명칭 완전 동기화.
- **Full Indicator Coverage**: 가이드 및 조합 분석 시 위 22종 지표 실시간 판정.
- **Strategy Tip Policy**: 가이드 페이지 내 맞춤형 공략 팁 노출.
- `getZoneInfo()` / `getStatus()`: 정규분포 영역을 판정하는 핵심 유틸리티.
