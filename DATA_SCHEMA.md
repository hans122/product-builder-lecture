# DATA_SCHEMA.md - Variable & Data Structures (v2.9)

## 1. 통계 시각화 정책 (Smooth Curve)
데이터의 연속성과 확률 분포의 흐름을 직관적으로 보여주기 위해 모든 통계 차트는 SVG 기반의 곡선형 Area Chart로 구현한다.
- **Visual Elements**:
    - `Curve Path`: 데이터 포인트를 잇는 부드러운 연결선.
    - `Area Fill`: 차트 하단을 채우는 반투명 배경.
    - `Golden Zone Fill`: 평균($\mu$) $\pm$ 1표준편차($\sigma$) 영역을 강조하는 별도의 하이라이트 레이어.
    - `My Position Marker`: 사용자의 최신 번호 지표가 위치한 지점에 박동하는(Pulse) 레드 마커를 표시.

## 2. 렌더링 엔진 (analysis.js)
- `renderCurveChart()` 함수를 통해 전 지표를 동적으로 생성하며, 뷰포트 크기에 따른 반응형 SVG ViewBox를 사용한다.
