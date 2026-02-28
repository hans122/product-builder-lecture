# DATA_SCHEMA.md - Variable & Data Structures (v3.9)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 정규분포 확률을 기반으로 분석 영역을 시각화하며, 전 화면에 걸쳐 일관된 색상 코드와 정밀한 데이터 포맷을 적용한다.

### 시각 요소 및 범례 정의 (Cross-Page Consistency)
- **옵티멀 존 (Optimal Zone) - [Green]:** 데이터의 68.2% 밀집 구간.
- **세이프 존 (Safe Zone) - [Blue]:** 데이터의 95.4% 유효 구간.
- **위험 구간 (Danger Zone) - [Red]:** 95.4% 신뢰 범위를 벗어난 희귀 영역.

### 데이터 포맷 정책
- **정밀 통계 표시**: `확률% (당첨횟수/전체회차)` (예: `30.5% (312/1024)`).
- **동적 범위 주입**: 가이드 및 팁 영역에 실시간 계산된 `min ~ max` 범위를 삽입하여 사용자 의사결정 지원.

### X축 레이블 간소화 정책 (Sparse Labeling)
- **적용 대상:** 데이터 포인트가 10개를 초과하는 지표.
- **표시 항목:** Min, Max, Mean, mu±1sd, mu±2sd (글자색 영역과 동기화).

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js)
- `stats_summary`: 22개 전 지표에 대한 평균 및 표준편차를 포함하는 전역 통계 객체.
- `formatStat()`: 일관된 정밀 통계 문자열을 생성하는 공용 포맷터.
- `Weighted Score Logic`: 최근 흐름을 반영한 가중치 파레토 영역 산출 알고리즘.
