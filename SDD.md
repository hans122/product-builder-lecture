# 로또 번호 분석 및 추천 서비스 SDD (v2.3)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 화면의 핵심 안내 문구 및 파레토 영역 범례(골드/실버/위험)를 `sticky-header` 내부로 통합하여 상단에 고정함.
- **Vertical Legend Layout**: 범례 아이템을 세로형 리스트(`flex-direction: column`)로 배치하여 모바일 및 데스크탑 환경에서의 가독성을 개선함.
- **Vertical Center Alignment**: 앵커 클릭 시 섹션 제목이 뷰포트의 상하 정중앙(50% 지점)에 오도록 `scroll-margin-top: 50vh`를 적용함.

## 2. 분석 엔진 및 알고리즘
- **Pareto Engine**: `advanced_stats.json`의 빈도 데이터를 로드하여 실시간으로 골드(Top 20%), 실버(Top 50%) 영역을 계산하는 `getZones()` 유틸리티 구현.
- **Recommendation Logic**: `getRandomFrom()` 함수를 통해 각 영역별 할당된 개수(2:2:1:1)만큼 번호를 추출하는 전략적 알고리즘 적용.

## 3. UI 레이아웃 최적화
- **Pareto Chart**: 막대 차트의 높이(28px)와 간격을 조정하고, 내부 텍스트(퍼센트, 출현 횟수)의 시인성을 강화함.
