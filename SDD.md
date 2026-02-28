# 로또 번호 분석 및 추천 서비스 SDD (v3.8)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 및 배지 디자인 적용.

## 2. 분석 엔진 및 알고리즘
- **Precision Data Key Mapping**: `combination.js` 내의 Z-score 산출 로직이 `stats_summary`의 정확한 원시 데이터 키(`odd_count`, `low_count`, `period_1_3` 등)를 참조하도록 매핑 고도화.
- **Unified Selection Logic**: `semiAutoSelect()` 함수를 통해 자동/반자동 기능을 단일 버튼으로 통합.
- **Comprehensive Guide Statistics**: 
    - `guide.js`에서 15개 이상의 지표에 대해 `getZoneInfo`를 호출하여 실제 적중 통계 산출.
    - 서브 컨테이너(`carry-3`, `special-3`, `bucket-9/3`, `pattern-ac/span/color`) 동적 업데이트.

## 3. UI 레이아웃 및 시각화
- **Unified Analysis Report UI**: 리포트 내의 모든 항목에 정규분포 임계값($\pm 1\sigma, \pm 2\sigma$)을 적용한 컬러 배지 연동.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
- **Sparse X-axis Labeling Center**: 통계적 경계값중심의 가독성 높은 차트 레이블 제공.


