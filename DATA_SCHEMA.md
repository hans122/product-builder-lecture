# DATA_SCHEMA.md - Variable & Data Structures (v3.10)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 정규분포 확률을 기반으로 분석 영역을 시각화하며, 전 화면에 걸쳐 일관된 색상 코드와 정밀한 데이터 포맷을 적용한다.

### 시각 요소 및 범례 정의 (Cross-Page Consistency)
- **옵티멀 존 (Optimal Zone) - [Green]:** 데이터의 68.2% 밀집 구간.
- **세이프 존 (Safe Zone) - [Blue]:** 데이터의 95.4% 유효 구간.
- **위험 구간 (Danger Zone) - [Red]:** 95.4% 신뢰 범위를 벗어난 희귀 영역.

### 데이터 포맷 및 산출 정책
- **세이프 존 적중률 산출**: 계산된 세이프 범위($\mu \pm 2\sigma$) 내에 포함되는 모든 범주/수치 항목의 `distributions` 빈도수를 합산하여 실제 적중률 산출.
- **정밀 통계 표시**: `확률% (당첨횟수/전체회차)` (예: `95.4% (976/1024)`).
- **동적 범위 주입**: 가이드 및 팁 영역에 실시간 계산된 `min ~ max` 범위를 삽입하여 사용자 의사결정 지원.

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js)
- `stats_summary`: 22개 전 지표에 대한 평균 및 표준편차를 포함하는 전역 통계 객체.
- `getZoneInfo()`: 특정 구간 내의 빈도를 합산하여 적중률과 수치 범위를 반환하는 분석 유틸리티.
- `Weighted Score Logic`: 최근 흐름을 반영한 가중치 파레토 영역 산출 알고리즘.
