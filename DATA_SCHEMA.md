# DATA_SCHEMA.md - Variable & Data Structures (v3.7)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 정규분포 확률을 기반으로 분석 영역을 시각화하며, 전 화면(메인, 히스토리, 통계)에 걸쳐 일관된 색상 코드를 적용한다.

### 시각 요소 및 범례 정의 (Cross-Page Consistency)
- **옵티멀 존 (Optimal Zone) - [Green]:**
    - 기준: 평균($\mu$) $\pm$ 1표준편차($\sigma$) 범위 (68.2% 밀집).
    - 표시: 메인(Optimal 배지), 히스토리(녹색 텍스트), 통계(녹색 영역).
- **세이프 존 (Safe Zone) - [Blue]:**
    - 기준: 평균($\mu$) $\pm$ 2표준편차($\sigma$) 범위 (95.4% 유효).
    - 표시: 메인(Safe 배지), 히스토리(파란색 텍스트), 통계(파란색 영역).
- **위험 구간 (Danger Zone) - [Red]:**
    - 기준: 95.4% 신뢰 범위를 벗어난 희귀 영역.
    - 표시: 메인(Warning 배지), 히스토리(빨간색 텍스트), 통계(빨간색 영역).

### X축 레이블 간소화 정책 (Sparse Labeling)
- **적용 대상:** 데이터 포인트가 10개를 초과하는 지표.
- **표시 항목:** Min, Max, Mean, mu±1sd, mu±2sd (글자색 영역과 동기화).

## 2. 실시간 분석 엔진 (analysis.js / history.js / main.js)
- `stats_summary`: 22개 전 지표에 대한 평균 및 표준편차를 포함하는 전역 통계 객체.
- `getZoneClass()`: 수치 데이터를 정규분포 구간별 CSS 클래스로 매핑하는 공용 유틸리티.
- `Weighted Score Logic`: 최근 흐름을 반영한 가중치 파레토 영역 산출 알고리즘.
