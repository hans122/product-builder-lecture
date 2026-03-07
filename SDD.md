# SDD (System Design Document) - v14.8

## 1. 시스템 아키텍처 개요 (Modular Hub)
본 시스템은 **`indicators.js` (설정)**를 중심으로 비즈니스 로직과 UI 렌더링을 완전히 분리한 **모듈러 허브 아키텍처**를 채택한다. 각 파일은 단일 책임 원칙(SRP)에 따라 엄격히 관리되며, 종속성 해결을 위한 로드 순서를 준수한다.

## 2. 모듈별 상세 설계
### 2.1. LottoConfig (indicators.js) - SSOT
- 서비스의 모든 지표(GL/GP), 시너지 규칙, 페이지별 지표 그룹을 관리하는 **단일 진실 공급원(Single Source of Truth)**.

### 2.2. Logic Layer
- **LottoCore (core.js)**: 공통 데이터 로더(`LottoDataManager`), 이벤트 버스(`LottoEvents`), 공통 유틸리티(`LottoUtils`)를 포함한 코어 엔진.
- **PensionUtils (pension_utils.js)**: 연금복권에 특화된 패턴, 밸런스, 동적 흐름 분석 알고리즘 독립 모듈.
- **AI Prediction (prediction.js)**: 10대 핵심 전략 알고리즘 및 심층 조합 생성 엔진.

### 2.3. UI Layer (ui_components.js)
- **LottoUI**: 순수 UI 렌더링 담당. 구슬, 카드, 배지 생성 및 복잡한 시각화 로직 통합.
- **SVG Visualization**: `μ±σ`, `μ±2σ` 기반 정규분포 곡선 및 **더블 라인 라벨링(수치/%)** 엔진.
- **Skeleton System**: 데이터 로딩 중 `pulse` 애니메이션을 동반한 스켈레톤 카드 렌더링.

### 2.4. View Layer (Page Engines)
- **view_manager.js**: 메인 대시보드 및 연금 메인 화면의 뷰 조율.
- **analysis_engine.js / combination_engine.js**: 각 페이지별 특화된 상호작용 및 실시간 연산 담당.

## 3. 리소스 로드 표준 (Strict Loading Order)
모든 HTML 파일은 종속성 오류(`ReferenceError`) 방지를 위해 다음 순서를 반드시 준수한다.
1. `lotto_utils.js`: 최상단 유틸리티 (수학/통계).
2. `indicators.js`: 전역 설정 및 팁 데이터.
3. `core.js`: 코어 엔진 및 데이터 매니저.
4. `unified_engine.js`: 비즈니스 로직 허브.
5. `pension_utils.js`: (연금 페이지 한정) 특화 로직.
6. `ui_components.js`: UI 컴포넌트 라이브러리.
7. `engine.js`: 페이지 전용 구동부.

## 4. 정밀 시각화 및 테이블 표준
- **Double-Line Metric**: 차트 X축 하단에 실제 수치(폰트 10px, 900)와 누적 확률(폰트 9px, 700)을 상하로 배치.
- **Content-Fit Grid**: 통계 표의 컬럼 너비를 데이터에 최적화하여 여백 최소화. (회차 55px / 번호 230px / 결과 80px)
- **Center Alignment**: 셀 내부의 모든 데이터(공, 텍스트)를 `justify-content: center`로 정렬.

## 5. 데이터 흐름 (Data Flow)
1. **Sync**: `update_latest.py`를 통해 최신 당첨 데이터 수집.
2. **Analysis**: `analyze_data.py`가 CSV를 가공하여 JSON 통계 생성.
3. **Caching**: 브라우저 로드 시 `LottoDataManager`가 JSON 데이터를 로컬 스토리지에 캐싱.
4. **Rendering**: `LottoUI`가 설정 데이터를 바탕으로 컴포넌트 기반 UI 동적 생성.
