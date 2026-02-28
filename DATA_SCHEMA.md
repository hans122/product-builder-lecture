# DATA_SCHEMA.md - Variable & Data Structures (v2.8)

## 1. 정규분포 통계 요약 (stats_summary)
수치형 지표들의 분포 분석을 위해 `advanced_stats.json`에 추가된 객체이다.
- `mean`: 역대 전체 회차의 산술 평균($\mu$).
- `std`: 역대 전체 회차의 표준 편차($\sigma$).
- **대상 지표**: `sum` (총합), `ac` (AC값), `span` (간격)

## 2. 정규분포 기반 상태 판정 규칙
- **Optimal (Golden Zone)**: $|Z-score| \le 1.0$ (평균에서 1표준편차 이내, 상위 약 68% 영역)
- **Normal**: $1.0 < |Z-score| \le 2.0$ (평균에서 2표준편차 이내, 상위 약 95% 영역)
- **Warning**: $|Z-score| > 2.0$ (희귀 출현 영역)

---

# 로또 번호 분석 및 추천 서비스 SDD (v2.8)

## 1. 통계 분석 엔진 (Normal Distribution)
- **Visual Mapping**: `analysis.js`에서 각 차트의 막대를 정규분포상의 위치에 따라 색상 분기 처리 (`golden-zone`, `is-mean`, `current-pos`).
- **Real-time Pointer**: 사용자가 생성한 번호의 지표 값이 차트상 어느 위치에 해당하는지 역삼각형 기호(`▼`)로 실시간 포인팅함.
- **Scientific Grading**: Z-Score를 활용하여 총합, AC값, Span의 등급을 수학적으로 산출함.
