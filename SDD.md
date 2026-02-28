# 로또 번호 분석 및 추천 서비스 SDD (v2.4)

## 1. 헤더 및 내비게이션 고도화
- **Enhanced Sticky Header**: 통계 화면의 핵심 안내 문구 및 파레토 영역 범례(골드/실버/위험)를 `sticky-header` 내부로 통합하여 상단에 고정함.
- **Vertical Legend Layout**: 범례 아이템을 세로형 리스트(`flex-direction: column`)로 배치하여 모바일 및 데스크탑 환경에서의 가독성을 개선함.

## 2. 분석 엔진 및 알고리즘
- **Pareto Area Distribution**: `recent_draws` 데이터를 기반으로 각 당첨 번호가 속한 영역(Gold/Silver/Normal/Cold)을 실시간 매핑하고 비율을 계산하여 테이블로 출력.
- **Comprehensive Indicators (22ea)**: 히스토리 테이블에 G1(3), G2(4), G3(6), G4(6), G5(3) 총 22개의 필드를 누락 없이 매핑 (`b3`=15분할, `p_corner`=모서리 등).
- **Recommendation Logic**: `getRandomFrom()` 함수를 통해 각 영역별 할당된 개수(2:2:1:1)만큼 번호를 추출하는 전략적 알고리즘 적용.

## 3. UI 레이아웃 최적화
- **History Table Scrolling**: 22개의 컬럼을 수용하기 위해 `overflow-x: auto`를 적용하고, G5 전문 지표를 파란색으로 강조하여 데이터 가독성 확보.
- **Area Highlighting**: 테이블 내 당첨 번호 중 골드존과 실버존에 해당하는 번호에 각각 전용 테두리 디자인을 적용하여 시각적 차별화.
