# 로또 번호 분석 및 추천 서비스 SDD (v2.6)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 안내 문구 및 지표 영역 범례(옵티멀/세이프/위험)를 `sticky-header` 내부로 통합.
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭하고 세로형 레이아웃 적용.

## 2. 분석 엔진 및 알고리즘
- **Full Indicator Statistics**: `analyze_data.py`에서 22개 전 지표에 대해 평균(`mean`) 및 표준편차(`std`)를 계산하여 `stats_summary`에 저장.
- **Weighted Pareto (20-Draw Window)**: 누적 빈도(40%)와 최근 20회차 빈도(60%)를 합산한 점수제로 영역 판정 정밀도 개선.
- **Hybrid Recommendation (2:3:1)**: 골드존 2개, 실버존 3개, 일반존 1개를 추출하여 최근 흐름과 전통적 빈도를 동시에 공략.

## 3. UI 레이아웃 및 시각화
- **Chart Zone Labels**: 각 차트 SVG 내부에 "Optimal Zone (68%)", "Safe Zone (95%)" 텍스트 라벨을 직접 렌더링.
- **Fixed Position Marker**: 내 번호의 위치를 나타내는 빨간 점(`.my-pos-marker`)에서 애니메이션을 제거하고 정적 고정 형태로 변경하여 가독성 확보.
- **History Mapping**: G1~G5 22개 필드를 `history.js`를 통해 1:1 매핑하여 전체 통계 흐름 가시화.

