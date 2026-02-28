# 로또 번호 분석 및 추천 서비스 SDD (v2.8)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 안내 문구 및 지표 영역 범례(옵티멀/세이프/위험)를 `sticky-header` 내부로 통합.
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭하고 전 화면 일관성 확보.

## 2. 분석 엔진 및 알고리즘
- **Dynamic Guide Engine**: `guide.js`에서 각 지표별 `stats_summary` 데이터를 가공하여 구체적인 옵티멀/세이프 수치 범위를 추출하고, 이를 **통계 결과 박스**와 **공략 팁 텍스트**에 동적으로 주입.
- **Statistical Formatting**: `formatStat` 유틸리티를 통해 `확률% (횟수/전체)` 형태의 정밀 데이터 포맷 구현.
- **Full Indicator Statistics**: `analyze_data.py`에서 22개 전 지표에 대해 평균(`mean`) 및 표준편차(`std`)를 계산하여 `stats_summary`에 저장.

## 3. UI 레이아웃 및 시각화
- **Dynamic Highlight Box**: 통계 수치와 정규분포 영역 정보를 결합한 하이브리드 UI 구현.
- **Chart Zone Labels**: 각 차트 SVG 내부에 "Optimal Zone", "Safe Zone" 텍스트 라벨을 직접 렌더링하고 색상 동기화.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값(Min, Max, Mean, ±1σ, ±2σ)만 선택적으로 표시하여 가독성 확보.
