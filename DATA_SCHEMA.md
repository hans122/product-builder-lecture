# DATA_SCHEMA.md - Variable & Data Structures (v3.6)

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

### X축 레이블 간소화 정책 (Sparse Labeling)
- **적용 조건:** 지표의 데이터 포인트가 10개를 초과할 경우 (예: Span, 끝수합 등).
- **표시 기준:** 전체 데이터를 다 보여주는 대신, 통계적 경계값만 선택적으로 표시하여 가독성 확보.
- **표시 항목:** 최소값(Min), 최대값(Max), 평균($\mu$), 옵티멀 경계($\mu \pm 1\sigma$), 세이프 경계($\mu \pm 2\sigma$).
- **글자색 동기화:** 표시되는 레이블의 색상을 해당 영역의 색상(녹색/파란색/빨간색)과 일치시켜 직관성 강화.

## 2. 실시간 분석 엔진 (analysis.js / history.js)
- `stats_summary`: 22개 전 지표에 대한 실시간 통계 요약(mean, std) 객체.
- `renderCurveChart()`: 모든 지표에 대해 `statSummary`를 연결하여 Optimal/Safe 영역, 라벨, 간소화된 X축 레이블 렌더링.
- `Weighted Score Logic`: `(누적 빈도 * 0.4) + (최근 20회 빈도 * 가중치 * 0.6)` 산식 적용.
