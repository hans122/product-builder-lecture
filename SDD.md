# 로또 번호 분석 및 추천 서비스 SDD (v3.5)

## 1. 헤더 및 내비게이션 고도화
- **Vertical Legend & Color Sync**: 범례 텍스트 색상을 차트 영역 색상과 1:1 매칭.
- **Cross-Page Unified Style**: 전 서비스 화면 통합 상태 클래스(`.optimal`, `.safe`, `.warning`) 및 배지 디자인 적용.

## 2. 분석 엔진 및 알고리즘
- **Precision Data Key Mapping**: `combination.js` 내의 Z-score 산출 로직이 `stats_summary`의 정확한 원시 데이터 키(`odd_count`, `low_count`, `period_1_3` 등)를 참조하도록 매핑 고도화.
- **Automatic Analysis Trigger**: 번호 완성 시 `runDetailedAnalysis()`를 즉시 호출하여 리포트 렌더링.
- **Intelligent Semi-auto Logic**: 가중치 기반 파레토 영역에서 무작위 추출 및 자동 마킹 처리.

## 3. UI 레이아웃 및 시각화
- **Unified Analysis Report UI**: 리포트 내의 모든 항목에 정규분포 임계값($\pm 1\sigma, \pm 2\sigma$)을 적용한 컬러 배지 연동.
- **Dynamic Real-time Tooltip**: 분석 항목 마우스 오버 시 실시간 계산된 옵티멀/세이프 범위 노출.
- **Sparse X-axis Labeling**: 통계적 경계값 중심의 가독성 높은 차트 레이블 제공.

