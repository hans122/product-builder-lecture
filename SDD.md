# 로또 번호 분석 및 추천 서비스 SDD (v3.11)

## 1. 헤더 및 내비게이션 고도화
- **Unified Menu & Title Sync**: 상단 이동 버튼명과 각 화면의 `<h1>`, `<title>`을 동일하게 매칭하여 사용자 인지 부하 최소화.
    - `🏠 번호 생성`, `📖 지표 가이드`, `📋 당첨 히스토리`, `🎯 조합 분석`, `📊 빅데이터 통계`
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 및 배지 디자인 적용.

## 2. 분석 엔진 및 알고리즘
- **Master Analysis Sequence Implementation**: `G1`~`G5` 순서로 데이터 매핑 통합 및 전 JS 파일 동기화.
- **Dynamic Strategy Tip Injection**: `guide.js` 내에 지표별 전략 템플릿 정의 및 실시간 수치 주입.
- **Expanded Metric Coverage**: 22종 이상의 정밀 지표 연산 로직 구현.

## 3. UI 레이아웃 및 시각화
- **Standardized Analysis Grids**: 모든 페이지의 분석 리포트 그리드를 G1~G5 섹션 구조로 재편.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
