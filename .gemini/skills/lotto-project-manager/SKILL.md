---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine) 구조와 백엔드 분석 파이프라인 정합성을 강제한다.
---

# Lotto Project Manager Skill (v11.0)

이 스킬은 프로젝트의 **통합 엔진 아키텍처(Unified Engine Architecture)**를 보장하며, 로또와 연금 서비스 간의 로직 일관성 및 백엔드(Python) 중심의 데이터 처리를 관리합니다.

## 주요 워크플로우

1.  **사전 검토 (Pre-Check)**:
    *   모든 코드 수정 요청 시, 루트 디렉토리의 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 필독하여 맥락을 내재화한다.
    *   **통합 엔진 준수**: 개별 페이지용 스크립트(예: `pension_*.js`) 대신 통합 엔진(`analysis_engine.js`, `combination_engine.js` 등) 수정을 우선한다.
    *   **데이터 출처 확인**: 브라우저 연산 대신 파이썬에서 미리 빌드된 `advanced_stats.json` 및 `pension_stats.json` 사용 여부를 확인한다.

2.  **구현 원칙**:
    *   **통합 모듈화**: 새로운 기능 추가 시 `view_manager.js`, `data_viewer.js`, `content_loader.js` 중 적절한 통합 모듈에 배치한다.
    *   **몬테카를로 표준**: 모든 조합 분석 기능은 `CombinationEngine` 내의 표준화된 몬테카를로 시뮬레이션 인터페이스를 사용한다.
    *   **백엔드 우선 분석**: 복잡한 통계 계산은 반드시 `analyze_data.py`에 구현하여 JSON으로 추출하고, JS는 이를 렌더링하는 역할만 수행한다.
    *   **캐시 관리**: 데이터 구조 변경 시 `core.js`의 `LottoDataManager.SYSTEM_VERSION`을 즉시 업데이트(현재 v11.0)하여 클라이언트 캐시를 갱신한다.
    *   **유틸리티 통합**: 쿠키 동의, 유효성 검사 등 공용 유틸리티는 `core.js` 내부 모듈(`PrivacyManager` 등)로 통합 관리한다.

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후 `PRD.md`, `SDD.md`, `GEMINI.md`에 변경 사항을 동시 반영한다.
    *   `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행하여 버전 번호를 동기화한다.

## 사용 예시

*   "연금 분석 로직 수정" -> `analysis_engine.js` 내부의 `runPensionAnalysis`를 수정하고, 필요한 경우 `analyze_data.py`를 업데이트하여 JSON 데이터 구조를 맞춘다.
*   "새로운 조합 추천 전략 추가" -> `combination_engine.js`에 공통 인터페이스를 정의하고 로또/연금 모드별 전략을 구현한다.
*   "페이지 로딩 최적화" -> 클라이언트 연산을 `analyze_data.py`로 이관하고 통합 모듈을 통해 JS 요청 수를 줄인다.

## 도구 활용

*   **버전 업데이트**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
*   **통합 분석 실행**: `python3 analyze_data.py` (로또/연금 전체 통계 재빌드)
*   **시스템 버전 체크**: `core.js` 내 `SYSTEM_VERSION` 필드 확인
