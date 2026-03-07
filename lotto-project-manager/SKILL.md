---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 컴포넌트 기반 UI, 이벤트 드리븐 상태 관리를 강제한다.
---

# Lotto Project Manager Skill (v32.0)

이 스킬은 프로젝트의 **허브 아키텍처(Hub Architecture)** 및 **비즈니스 로직 독립성**을 보장하며, 컴포넌트 재사용성과 시스템 안정성을 극대화하는 관리 표준을 정의합니다.

## 주요 워크플로우 Standard

1.  **사전 검토 (Pre-Check)**:
    *   **Document-First**: 수정 시작 전 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락을 파악한다.
    *   **Logic Isolation**: 모든 알고리즘은 반드시 `unified_engine.js` 또는 `ai_worker.js`에서만 관리되어야 한다.

2.  **구현 원칙 (v32.0+)**:
    *   **Max-Gap Integrated Synergy**: 34대 전수 지표와 47쌍 이상의 상관관계를 딥 시너지 엔진에서 실시간으로 검증한다.
    *   **Ensemble Strategy**: 다중 전략 필터를 동시에 통과한 조합을 식별하여 `ensembleCount`를 산출하고 UI에 배지로 시각화한다.
    *   **Smart Extraction**: `weightedRandomPick`을 사용하여 시너지 점수와 회귀 에너지가 높은 번호에 가중치를 부여하는 스마트 추출 방식을 기본으로 한다.
    *   **Global Hard Filter**: 색상 5개 쏠림, 3연속 출현 번호 등 통계적 아웃라이어는 전략 종류와 무관하게 강제 배제한다.
    *   **Non-Blocking Performance**: 고부하 연산은 `ai_worker.js`에서 처리하며, 가중치 사전 계산(Pre-calculation)을 통해 루프 성능을 최적화한다.
    *   **Adaptive Visualization**: 차트 라벨은 데이터 기반 클램핑(Data-Driven Clamping)을 적용하여 음수 표기를 방지하고, 반응형 SVG로 구현한다.

3.  **사후 정리 (Post-Sync)**:
    *   데이터 갱신 시 `python3 sync_all.py`를 실행하여 수집-분석-검증 과정을 일괄 수행한다.
    *   시스템 버전 변경 시 `node sync_version.cjs`를 실행하여 리소스 캐싱 파라미터를 일괄 동기화한다.

## 주요 도구 및 검증

*   **Unified Sync**: `python3 sync_all.py` (수집/분석/검증 통합 자동화)
*   **Logic Guardian**: `python3 verify_logic_match.py` (Python-JS 로직 교차 전수 검증)
*   **Precision Backtest**: `python3 verify_prob_precision.py` (기댓값 지수 변별력 검증)
*   **Performance Monitor**: Web Worker 상태 및 UI 반응성 체크.
*   **Version Bump**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
