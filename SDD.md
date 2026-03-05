# SDD (System Design Document) - v4.2

## 1. 시스템 아키텍처 개요
본 시스템은 **`indicators.js` (설정)**와 **`core.js` (엔진)**를 핵심 축으로 하는 **Data-Driven Architecture**를 채택한다. 모든 UI 구성 요소와 분석 로직은 이 두 파일의 정의를 따르며, 개별 페이지(`index.html`, `analysis.html` 등)는 렌더링 결과만 출력하는 뷰(View)의 역할을 수행한다.

## 2. 모듈별 상세 설계
### 2.1. LottoConfig (indicators.js) - SSOT
- 서비스의 모든 지표(G1~G6), 시너지 규칙(G0), 데이터 키 매핑을 관리하는 **단일 진실 공급원(Single Source of Truth)**.
- 루프 기반 렌더링 엔진의 입력 소스로 활용됨.

### 2.2. LottoCore (core.js) - 통합 엔진
- **LottoUtils**: Z-Score 기반 상태 판정, 공 색상 클래스 반환 등 공통 유틸리티 제공.
- **LottoUI**: 동적 DOM 생성 및 SVG 차트 빌더. 컴포넌트 단위의 UI 일관성 보장.
- **LottoSynergy**: 조합의 정합성을 검증하는 정밀 분석 로직 실행.
- **LottoDataManager**: 로컬 스토리지와 서버 데이터를 연동하는 캐싱 레이어.

### 2.3. Expert-Grade Table System
- **Slanted Header**: CSS `transform: rotate(-45deg)`를 활용하여 고정된 열 너비 안에서 긴 텍스트를 가시화.
- **Sticky Column**: `position: sticky`와 `z-index` 설정을 통해 스크롤 시에도 핵심 열(회차, 번호)을 브라우저 좌측에 고정.

## 3. 데이터 흐름 (Data Flow)
1. **수집**: `update_latest.py`가 외부 API에서 최신 데이터를 가져와 `lt645.csv`에 저장.
2. **분석**: `analyze_data.py`가 CSV를 바탕으로 심층 통계를 생성하여 `advanced_stats.json` 빌드.
3. **로드**: 브라우저 로드 시 `LottoDataManager`가 JSON 데이터를 캐싱.
4. **렌더링**: `LottoUI`가 `LottoConfig` 설정을 순회하며 페이지별 맞춤형 UI(차트, 표, 리포트)를 동적 생성.

## 4. 디자인 시스템 가이드라인
- **Colors**: `--primary-blue` (#3182f6), `--danger-red` (#f04452), `--success-green` (#2ecc71).
- **Typography**: Apple SD Gothic Neo, Noto Sans KR (700 Bold 기반).
- **Interactive**: `scale(1.05)`, `translateY(-5px)` 등 미세한 애니메이션으로 피드백 제공.
