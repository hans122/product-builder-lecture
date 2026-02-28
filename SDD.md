# 로또 번호 분석 및 추천 서비스 SDD (v1.9)

## 1. 정밀 내비게이션 설계
- **Centering Policy**: 앵커 이동 시 해당 항목이 화면 상단에 가려지지 않고 시각적 주목도를 높이기 위해 `scroll-margin-top: 30vh`를 적용. 이를 통해 항목의 제목과 차트가 뷰포트 중앙 부근에 오도록 배치함.
- **Smooth Anchor Scrolling**: `html { scroll-behavior: smooth; }`를 통해 페이지 내 이동 시 부드러운 스크롤 효과 제공.

## 2. UI/UX 일관성
- 메인 화면(`index.html`)의 모든 실시간 분석 항목은 `analysis.html`의 고유한 섹션 ID와 1:1로 매핑되어 있으며, 클릭 시 즉시 상세 통계로 연결됨.
