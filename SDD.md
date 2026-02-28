# 로또 번호 분석 및 추천 서비스 SDD (v2.7)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 안내 문구 및 지표 영역 범례(옵티멀/세이프/위험)를 `sticky-header` 내부로 통합.
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭하고 전 화면 일관성 확보.

## 2. 분석 엔진 및 알고리즘
- **Dynamic Guide Engine**: `guide.js`에서 `getRangeText()` 유틸리티를 통해 각 지표별 `stats_summary` 데이터를 가공하여 구체적인 옵티멀/세이프 수치 범위를 화면에 렌더링.
- **Full Indicator Statistics**: `analyze_data.py`에서 22개 전 지표에 대해 평균(`mean`) 및 표준편차(`std`)를 계산하여 `stats_summary`에 저장.
- **Weighted Pareto (20-Draw Window)**: 누적 빈도(40%)와 최근 20회차 빈도(60%)를 합산한 점수제로 영역 판정 정밀도 개선.

## 3. UI 레이아웃 및 시각화
- **Dynamic Highlight Box**: 가이드 페이지의 `wrapHighlight()` 함수를 고도화하여 실제 통계 수치와 정규분포 영역 정보를 결합한 하이라이트 UI 구현.
- **Chart Zone Labels**: 각 차트 SVG 내부에 "Optimal Zone", "Safe Zone" 텍스트 라벨을 직접 렌더링하고 색상 동기화.
- **Fixed Position Marker**: 내 번호 위치 표시 빨간 점(`.my-pos-marker`)의 애니메이션을 제거하여 시인성 개선.
