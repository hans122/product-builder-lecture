# DATA_SCHEMA.md - Variable & Data Structures (v3.17)

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
- **Unified Button Policy**:
    - `semi-auto-btn` (자동/반자동): `manualNumbers` 상태에 따른 가변 추출 로직 수행.
    - `auto-select-btn` (전체 자동): UI 간소화를 위해 삭제 및 `semi-auto-btn`으로 통합.
- **Manual vs Auto Distinction Policy**:
    - `manualNumbers`: 사용자 수동 클릭 (Navy marking, "MY" label).
    - `autoNumbers`: 시스템 자동 생성 (Red marking, standard ball).
- **Manual Trigger Policy**: 자동 선택 시 리포트 자동 생성 중단, 사용자의 명시적 "조합 분석 실행" 클릭 시 리포트 가동.
- `getZoneInfo()` / `getStatus()`: 정규분포 영역을 판정하는 핵심 유틸리티.
