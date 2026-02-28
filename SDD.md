# 로또 번호 분석 및 추천 서비스 SDD (v3.0)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭하고 전 화면 일관성 확보.
- **Cross-Page Unified Style**: 전 서비스 화면(Main, History, Stat, Guide) 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 적용.

## 2. 분석 엔진 및 알고리즘
- **Compressed Stat Formatter**: `guide.js`에서 `getZoneInfo`를 통해 옵티멀/세이프 존의 범위와 실제 히트수를 산출하여 한 줄의 전문 텍스트 형식으로 렌더링.
- **Raw Numeric Distribution**: 총합(Sum) 데이터를 20단위 구간에서 개별 수치형으로 전환하여 `analysis.js`의 `renderCurveChart`에서 Sparse Labeling(Min, Safe, Opti, Mean, Max)이 적용되도록 통합.
- **Full Indicator Statistics**: `analyze_data.py`에서 22개 전 지표에 대해 평균(`mean`) 및 표준편차(`std`)를 계산하여 정규분포 신뢰 구간 확보.

## 3. UI 레이아웃 및 시각화
- **Dynamic Tip Injection**: 각 분석 항목의 공략 팁에 실시간 계산된 세이프 수치 범위를 삽입.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값만 선택적으로 표시하여 가독성 확보.
- **Fixed Position Marker**: 내 번호 위치 표시를 정적 붉은 점(`my-pos-marker`)으로 고정.

