# DATA_SCHEMA.md - Variable & Data Structures (v3.2)

## 1. 통계 시각화 정책 (Scientific Visualization)
모든 통계 지표는 역대 당첨 데이터의 확률 분포를 곡선형(Area Chart) 및 파레토 분포형(Horizontal Bar)으로 보여주며, 사용자의 번호가 통계적으로 어느 지점에 위치하는지 실시간으로 추적한다.

### 시각 요소 및 범례 정의
- **골드 존 (Gold) - [Golden]:**
    - 의미: 파레토 법칙에 따른 출현 빈도 상위 20% 핵심 번호군.
    - 확률 점유: 전체 당첨의 약 22% 집중.
- **실버 존 (Silver) - [Blue]:**
    - 의미: 골드존을 포함한 상위 50% 확장 번호군.
    - 확률 점유: 전체 당첨의 약 54% 이상 점유.
- **위험 구간 (Danger Zone) - [Red]:**
    - 의미: 출현 확률이 매우 낮은 통계적 극단값 또는 콜드 번호 구간.
- **내 번호 위치 (My Position) - [Pulse Red Circle]:**
    - 의미: 현재 사용자가 생성한 번호 조합의 지표별 통계적 위치.

## 2. 실시간 분석 엔진 (analysis.js / main.js)
- `getZones()`: 최신 빈도 데이터를 기반으로 4단계 파레토 영역(Gold, Silver, Normal, Cold) 실시간 산출.
- `renderParetoChart()`: 영역별 확률 점유 비중을 수평 막대 차트로 시각화.
- `autoSelect()`: 2:2:1:1 비중 기반의 전략적 번호 자동 추출 알고리즘.
