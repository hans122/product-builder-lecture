# 로또 번호 분석 및 추천 서비스 SDD (v1.8)

## 1. 사용자 경험(UX) 개선
- **Smooth Anchor Scrolling**: 모든 페이지 간 앵커 링크 이동 시 `scroll-behavior: smooth`를 적용하여 부드러운 전환 제공.
- **Sticky Header Compensation**: 앵커 이동 시 상단 고정 헤더에 의해 콘텐츠 제목이 가려지지 않도록 `.analysis-card`에 `scroll-margin-top: 140px`를 적용.
- **Visual Feedback**: 메인 화면의 실시간 분석 아이템을 클릭 가능한 버튼 형태로 시각화하고 Hover 효과를 강화함.

## 2. 네비게이션 정책
- **Direct Deep Linking**: `index.html`에서 `analysis.html`의 특정 통계 섹션으로 직접 딥링크(Deep Link)를 연결하여 정보 탐색 시간 단축.
