---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 컴포넌트 기반 UI, 이벤트 드리븐 상태 관리를 강제한다.
---

# Lotto Project Manager Skill (v29.2)

이 스킬은 프로젝트의 **허브 아키텍처(Hub Architecture)** 및 **비즈니스 로직 독립성**을 보장하며, 컴포넌트 재사용성과 시스템 안정성을 극대화하는 관리 표준을 정의합니다.

## 주요 워크플로우 Standard

1.  **사전 검토 (Pre-Check)**:
    *   **Document-First**: 수정 시작 전 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락을 파악한다.
    *   **Logic Isolation**: 모든 알고리즘은 반드시 `unified_engine.js` 또는 `ai_worker.js`에서만 관리되어야 한다.

2.  **구현 원칙 (v29.2+)**:
    *   **Non-Blocking AI**: 딥 시너지 연산 및 조합 생성과 같은 고부하 작업은 반드시 **Web Worker(`ai_worker.js`)**를 통해 비동기로 처리하여 메인 스레드 점유를 방지한다.
    *   **Adaptive Visualization**: 모든 통계 차트는 `viewBox` 기반의 반응형 SVG로 구현하며, `IntersectionObserver`를 통한 **지연 렌더링(Lazy Loading)**을 기본 적용한다.
    *   **SSOT (Single Source of Truth)**: 모든 지표와 예측 전략 설정은 `indicators.js`에서 통합 관리하며, 개별 엔진에서의 하드코딩을 엄격히 금지한다.
    *   **Logic Mirroring**: Python 백엔드 데이터와 JS 프론트엔드 연산 결과는 항상 100% 일치해야 하며, 변경 시 `verify_logic_match.py`를 통한 검증이 필수적이다.

3.  **사후 정리 (Post-Sync)**:
    *   데이터 갱신 시 `python3 sync_all.py`를 실행하여 수집-분석-검증 과정을 일괄 수행한다.
    *   시스템 버전 변경 시 `node sync_version.cjs`를 실행하여 리소스 캐싱 파라미터를 일괄 동기화한다.

## 주요 도구 및 검증

*   **Unified Sync**: `python3 sync_all.py` (수집/분석/검증 통합 자동화)
*   **Logic Guardian**: `python3 verify_logic_match.py` (Python-JS 로직 교차 전수 검증)
*   **Performance Monitor**: Web Worker 상태 및 UI 반응성 체크.
*   **Version Bump**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
