# 로또 번호 분석 및 추천 서비스 SDD (v3.1)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 적용.

## 2. 분석 엔진 및 알고리즘
- **Compressed Stat Formatter**: `guide.js`에서 옵티멀/세이프 존의 범위와 실제 히트수를 산출하여 전문 텍스트 형식으로 렌더링.
- **Unified Tip Template**: `updateSection` 내 `subjects` 매핑 테이블을 통해 모든 공략 팁을 고정된 템플릿(`... 권장 세이프 "범위" 이 좋습니다.`)으로 출력하도록 표준화.
- **Raw Numeric Distribution**: 총합(Sum) 데이터를 수치형으로 전환하여 정밀 분석 차트 구현.

## 3. UI 레이아웃 및 시각화
- **Dynamic Tip Injection**: 각 분석 항목의 공략 팁에 실시간 계산된 세이프 수치 범위를 삽입.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값만 선택적으로 표시.
