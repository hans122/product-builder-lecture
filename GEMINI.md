# GEMINI.md - AI Coding Constitution (v1.5)

## [MANDATORY RULES]
1. **Unified Classification**: 모든 UI(메인, 통계, 히스토리, 리포트)는 `DATA_SCHEMA.md`에 정의된 G1~G5 그룹 순서와 항목 분류를 엄격히 따른다.
2. **Naming Consistency**: 
    - 윈도우 매칭은 반드시 `1~2회전`, `1~3회전`이라는 용어를 사용한다.
    - 구간 분석은 `N분할 (M개씩)` 명칭을 병기한다.
3. **Cross-Page Synchronization**: 한 화면의 항목이 추가/삭제되면 반드시 `DATA_SCHEMA`를 거쳐 전 화면에 동시 적용한다.

---

# 로또 번호 분석 및 추천 서비스 PRD (v1.5)

## 1. 표준 분석 지표
사용자에게 혼란을 주지 않도록 전 서비스 영역에 **5대 표준 통계 그룹**을 적용한다.
- **기본 균형**: 전체적인 수의 흐름 파악.
- **회차 상관관계**: 과거 당첨번호와의 연계성 추적.
- **특수 번호군**: 수학적 성질(소수, 배수 등)에 기반한 분석.
- **구간 및 패턴**: 번호의 공간적 분산도 분석.
- **끝수 및 전문지표**: 미세 패턴(끝수) 및 무작위성(AC값) 검증.

---

# 로또 번호 분석 및 추천 서비스 SDD (v1.5)

## 1. UI 컴포넌트 분류 설계
모든 프론트엔드 뷰는 `G1_Basic`, `G2_Correlation`, `G3_Special`, `G4_Pattern`, `G5_Advanced` 클래스 또는 섹션으로 구조화한다.

## 2. 데이터 매핑 로직
`main.js`의 `analyzeNumbers`와 `analysis.js`의 `renderDistChart`는 동일한 데이터 키 셋을 참조하여 렌더링 순서를 보장한다.
