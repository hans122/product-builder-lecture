# GEMINI.md - AI Coding Constitution (v1.6)

## [MANDATORY RULES]
1. **Unified Classification**: 모든 UI(메인, 통계, 히스토리, 리포트, 가이드)는 `DATA_SCHEMA.md`에 정의된 G1~G5 그룹 순서와 항목 분류를 엄격히 따른다.
2. **Naming Consistency**: 
    - 윈도우 매칭은 반드시 `1~2회전`, `1~3회전`이라는 용어를 사용한다.
    - 구간 분석은 `N분할 (M개씩)` 명칭을 병기한다.
3. **Cross-Page Synchronization**: 한 화면의 항목이 추가/삭제되면 반드시 `DATA_SCHEMA`를 거쳐 **가이드 페이지(`guide.js`)를 포함한** 전 화면에 동시 적용한다.
4. **Data-Driven Guidance**: 가이드 페이지의 확률 정보는 절대로 하드코딩하지 않으며, 반드시 `advanced_stats.json`의 데이터를 계산하여 실시간으로 표시한다.
