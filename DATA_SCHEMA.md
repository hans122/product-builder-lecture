# DATA_SCHEMA.md - Variable & Data Structures (v3.13)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 개별 원시 데이터(Raw Numeric) 분포를 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷을 적용한다.

### 시각 요소 및 범례 정의
- **옵티멀 존 (Optimal Zone)**: $\mu \pm 1\sigma$ (68.2%).
- **세이프 존 (Safe Zone)**: $\mu \pm 2\sigma$ (95.4%).

### 데이터 포맷 정책
- **전문 압축 형식 (Guide)**: `옵티멀 존 범위 확률%(횟수/전체), 세이프 존 범위 확률%(횟수/전체)`.
- **행동 지침 팁 (Actionable Tip)**: `[지표명] 권장 세이프 "[범위]" 이 좋습니다.` (사용자 경험 최적화).

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js / combination.js)
- `stats_summary`: 22개 전 지표에 대한 평균 및 표준편차 정보.
- `getZoneInfo()`: 특정 구간 내 빈도를 합산하여 적중률과 수치 범위를 반환.
- `semiAutoSelect()`: 사용자 기선택 번호를 유지하며 부족한 슬롯을 가중치 파레토 기반으로 자동 생성하는 로직.
