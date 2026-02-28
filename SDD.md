# 로또 번호 분석 및 추천 서비스 SDD (v3.9)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 및 배지 디자인 적용.

## 2. 분석 엔진 및 알고리즘
- **Master Analysis Sequence Implementation**: 
    - `G1` (Balance), `G2` (Correlation), `G3` (Special), `G4` (Zone/Pattern), `G5` (Expert) 순서로 데이터 매핑 통합.
    - `combination.js`, `analysis.js`, `history.js`, `main.js`의 분석 루프가 위 시퀀스를 엄격히 준수.
- **Expanded Metric Coverage**:
    - 이웃수(neighbor), 합성수(composite), 5배수(m5), 제곱수(square), 쌍수(double), 삼각형패턴(p_tri), 끝수합(end_sum) 등 22종 이상의 지표 산출.
- **Pareto Logic Decoupling**: 통계(analysis.html) 페이지 UI에서 파레토 분석 섹션 제거 및 지표별 분포 차트 고도화.

## 3. UI 레이아웃 및 시각화
- **Standardized Analysis Grids**: 모든 페이지의 분석 리포트 그리드를 G1~G5 섹션 구조로 재편.
- **History Table Expansion**: 히스토리 테이블을 27개 컬럼(회차, 당첨번호 + 22종 지표 + 기타)으로 확장하여 입체적 데이터 제공.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
- **Sparse X-axis Labeling**: 통계적 경계값 중심의 가독성 높은 차트 레이블 제공.
