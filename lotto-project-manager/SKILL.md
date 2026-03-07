# Lotto Project Manager Skill (v22.29)

## 1. 개요 (Overview)
본 스킬은 시스템의 **데이터 무결성**, **계층형 모듈 아키텍처**, 그리고 **사용자 경험(UX)**을 수호한다. 모든 개발은 파편화를 지양하고 `LottoCore` 허브를 통한 통합 관리를 원칙으로 한다.

## 2. 계층형 아키텍처 (Layered Architecture)

### 2.1. 데이터 계층 (Data & Storage)
*   **LottoStorage (SSOT)**: 모든 로컬 저장소 접근은 `LottoStorage` 객체로 단일화한다.
    *   `pushUnique()`: 중복 제거, 정렬, 용량 제한 로직 통합 관리.
    *   `KEYS`: `LOTTO_ARCHIVE`, `LOTTO_POOL` 등 상수를 통해 키 파편화 방지.
*   **LottoDataManager**: 로또/연금 통계 데이터를 Fetch API와 캐시 버스팅 로직을 통해 안정적으로 로드한다.

### 2.2. 로직 계층 (Logic Hub)
*   **Unified Engine**: 핵심 알고리즘은 `unified_engine.js`에 집중시키고, 페이지별 엔진은 인터랙션만 담당한다.
*   **Smart Sync**: `sync_all.py`를 통해 데이터 노후도(+7일) 및 코드 변경을 감지하여 지능적으로 분석을 수행한다.

### 2.3. UI 계층 (Component System)
*   **LottoUI Namespace**: UI 컴포넌트를 카테고리별로 조직화하여 관리한다.
    *   `LottoUI.Ball`: 로또/연금 구슬 렌더링.
    *   `LottoUI.Chart`: 정규분포 곡선, 마르코프 히트맵 등 시각화.
    *   `LottoUI.Card`: 추천 조합 카드 등 복합 컴포넌트.
    *   `LottoUI.Feedback`: Undo 토스트, 툴팁 등 인터랙션.

## 3. UX/UI 표준 가이드 (UX Standard)

### 3.1. 무중단 워크플로우
*   **Undo Pattern**: 삭제 등의 파괴적 행위 시 `LottoUI.Feedback.toast`를 통해 즉시 실행 및 실행 취소(Undo) 기회를 제공한다.
*   **2-Step Confirm**: 중대 작업(전체 삭제 등)은 버튼 내 상태 변화를 통한 2단계 확인 방식을 권장한다.

### 3.2. 성능 최적화
*   **Cloud Sync**: 서버의 `system_pool.json`과 로컬 캐시를 동기화하여 첫 로딩 시의 연산 부하를 최소화한다.
*   **Hybrid Feed**: 저장된 에이스(80%)와 실시간 생성(20%)을 혼합하여 신뢰도와 신선도를 동시에 확보한다.

## 4. 버전 및 정합성 관리
*   모든 리소스는 `SYSTEM_VERSION` (현재 v22.29) 파라미터를 강제 적용하여 캐시 문제를 방지한다.
*   로직 변경 시 Python-JS 교차 검증(`verify_logic_match.py`)을 반드시 수행한다.

## 5. 버전 히스토리
*   **v22.29**: 코어 기반 모듈화(LottoStorage, LottoUI Namespace) 완성.
*   **v22.28**: Smart Sync, Dual Storage 분리, Undo UX 도입.
