# DATA_SCHEMA.md - Variable & Data Structures (v3.5)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 정규분포 확률을 기반으로 분석 영역을 시각화한다.

### 시각 요소 및 범례 정의
- **옵티멀 존 (Optimal Zone) - [Green]:**
    - 기준: 평균($\mu$) $\pm$ 1표준편차($\sigma$) 범위.
    - 확률 점유: 데이터의 약 68.2% 밀집.
- **세이프 존 (Safe Zone) - [Blue]:**
    - 기준: 평균($\mu$) $\pm$ 2표준편차($\sigma$) 범위.
    - 확률 점유: 데이터의 약 95.4% 유효.
- **위험 구간 (Danger Zone) - [Red]:**
    - 기준: 95.4% 신뢰 범위를 벗어난 영역.
- **가중치 파레토 (Weighted Pareto):**
    - 골드(Top 20%), 실버(Top 50%)를 산출할 때 최근 20회차에 가중치 60% 부여.

## 2. 실시간 분석 엔진 (analysis.js / history.js)
- `stats_summary`: 22개 전 지표에 대한 실시간 통계 요약(mean, std) 객체.
- `renderCurveChart()`: 모든 지표에 대해 `statSummary`를 연결하여 Optimal/Safe 영역 및 라벨 렌더링.
- `Weighted Score Logic`: `(누적 빈도 * 0.4) + (최근 20회 빈도 * 가중치 * 0.6)` 산식 적용.
