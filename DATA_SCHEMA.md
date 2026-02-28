# DATA_SCHEMA.md - Variable & Data Structures (v3.4)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 확률 분포를 곡선형(Area Chart) 및 영역별 분포 테이블로 보여주며, 사용자의 번호가 통계적으로 어느 지점에 위치하는지 실시간으로 추적한다.

### 시각 요소 및 범례 정의
- **골드 존 (Gold) - [Golden Border]:**
    - 의미: 파레토 법칙에 따른 출현 빈도 상위 20% 핵심 번호군.
    - 확률 점유: 전체 당첨의 약 22% 집중.
- **실버 존 (Silver) - [Blue Border]:**
    - 의미: 골드존을 포함한 상위 50% 확장 번호군.
    - 확률 점유: 전체 당첨의 약 54% 이상 점유.
- **G5 전문 지표 - [Blue Text]:**
    - 히스토리 테이블에서 AC, Span, 색상 분포 등 핵심 통계 지표를 강조.

## 2. 실시간 분석 엔진 (analysis.js / history.js)
- `getZones()`: 최신 빈도 데이터를 기반으로 4단계 파레토 영역(Gold, Silver, Normal, Cold) 실시간 산출.
- `renderParetoMiniTable()`: 최근 회차의 영역별 점유 비중을 `G:S:N:C` 형식으로 요약 출력.
- `renderHistoryTable()`: G1~G5에 걸친 22가지 분석 데이터를 JSON 객체에서 HTML 테이블로 1:1 매핑 및 렌더링.
