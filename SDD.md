# 로또 번호 분석 및 추천 서비스 SDD (v2.9)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 안내 문구 및 지표 영역 범례(옵티멀/세이프/위험)를 `sticky-header` 내부로 통합.
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭하고 전 화면 일관성 확보.

## 2. 분석 엔진 및 알고리즘
- **Dynamic Guide Engine**: `guide.js`의 `getZoneInfo` 함수를 통해 각 지표별 `stats_summary`와 `distributions` 데이터를 결합하여 **세이프 존 내 실제 당첨 누적 횟수(Safe Hits)**를 실시간으로 계산.
- **Statistical Formatting**: `formatStat` 유틸리티를 통해 `확률% (횟수/전체)` 형태의 정밀 데이터 포맷 구현.
- **Full Indicator Statistics**: `analyze_data.py`에서 22개 전 지표에 대해 평균(`mean`) 및 표준편차(`std`)를 계산하여 `stats_summary`에 저장.

## 3. UI 레이아웃 및 시각화
- **Dynamic Tip Injection**: 각 분석 항목의 공략 팁 텍스트에 실시간 계산된 세이프 범위를 동적으로 삽입하여 사용자 친화적인 가이드 제공.
- **Chart Zone Labels**: 각 차트 SVG 내부에 "Optimal Zone", "Safe Zone" 텍스트 라벨을 직접 렌더링하고 색상 동기화.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값만 선택적으로 표시하여 가독성 확보.
