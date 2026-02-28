# DATA_SCHEMA.md - Variable & Data Structures (v3.11)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 수치 지표는 개별 원시 데이터(Raw Numeric) 분포를 기반으로 분석하며, 전 화면에 걸쳐 일관된 전문 포맷을 적용한다.

### 시각 요소 및 범례 정의
- **옵티멀 존 (Optimal Zone) - [Green]**: 데이터의 68.2% 밀집 구간 ($\mu \pm 1\sigma$).
- **세이프 존 (Safe Zone) - [Blue]**: 데이터의 95.4% 유효 구간 ($\mu \pm 2\sigma$).
- **위험 구간 (Danger Zone) - [Red]**: 신뢰 범위를 벗어난 희귀 영역.

### 데이터 포맷 및 산출 정책
- **전문 압축 형식 (Guide)**: `옵티멀 존 범위 확률%(횟수/전체), 세이프 존 범위 확률%(횟수/전체)` (예: `옵티멀 존은 "107 ~ 169" 68.0%(824/1212)`).
- **수치형 지표 통합**: 총합(sum), Span, 끝수합 등 모든 수치 데이터는 `distributions` 내 개별 숫자 키로 관리하여 정밀한 곡선 차트 렌더링 지원.

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js / guide.js)
- `stats_summary`: 22개 전 지표에 대한 평균 및 표준편차 정보.
- `getZoneInfo()`: 특정 구간(Opt/Safe) 내의 실시간 빈도를 합산하여 적중률과 수치 범위를 반환.
- `Weighted Score Logic`: 최근 흐름을 반영한 가중치 파레토 영역 산출 알고리즘.
