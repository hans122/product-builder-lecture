# 로또 번호 분석 및 추천 서비스 SDD (v3.4)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스 적용.

## 2. 분석 엔진 및 알고리즘
- **Automatic Analysis Trigger**: `autoSelect` 및 `semiAutoSelect` 완료 시 `runDetailedAnalysis()`를 즉시 호출하여 사용자의 추가 클릭 없이 결과 리포트를 렌더링하도록 흐름 개선.
- **Intelligent Semi-auto Logic**: 사용자가 기선택한 번호를 제외한 나머지 슬롯을 가중치 기반 파레토 영역에서 가중치를 적용하여 무작위 추출 및 자동 마킹 처리.
- **Robust UI State Management**: `updateSelectedBallsDisplay` 함수의 정렬 로직 에러(미정의 변수 참조)를 수정하여 번호 렌더링 무결성 확보.

## 3. UI 레이아웃 및 시각화
- **Dynamic Real-time Tooltip**: 메인 화면의 분석 항목에 마우스 오버 시, 현재 통계 데이터 기준의 옵티멀/세이프 범위를 실시간으로 계산하여 툴팁으로 노출.
- **Dynamic Tip Injection**: 각 분석 항목의 공략 팁에 실시간 계산된 세이프 수치 범위를 삽입.
- **Sparse X-axis Labeling**: 데이터가 많은 차트에서 통계적 경계값만 선택적으로 표시.
