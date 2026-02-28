# 로또 번호 분석 및 추천 서비스 SDD (v3.3)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스 적용.

## 2. 분석 엔진 및 알고리즘
- **Intelligent Semi-auto Logic**: `combination.js`의 `semiAutoSelect()` 함수를 통해 사용자가 기선택한 번호를 제외한 나머지 슬롯을 가중치 기반 파레토 영역(Gold/Silver/Normal)에서 가중치를 적용하여 무작위 추출 및 자동 마킹 처리.
- **Robust UI State Management**: 번호 선택 및 자동 생성 시 `initNumberSelector`와 `toggleNumber` 함수의 무결성을 유지하여 렌더링 오류 방지 및 선택 상태(Marking) 동기화.
- **Compressed Stat Formatter**: 옵티멀/세이프 존의 범위와 실제 히트수를 산출하여 전문 텍스트 형식으로 렌더링.

## 3. UI 레이아웃 및 시각화
- **Dynamic Real-time Tooltip**: 메인 화면의 분석 항목에 마우스 오버 시, 현재 통계 데이터 기준의 옵티멀/세이프 범위를 실시간으로 계산하여 툴팁으로 노출.
- **Dynamic Tip Injection**: 각 분석 항목의 공략 팁에 실시간 계산된 세이프 수치 범위를 삽입.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값만 선택적으로 표시.
