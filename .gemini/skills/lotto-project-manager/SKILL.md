---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 컴포넌트 기반 UI, 이벤트 드리븐 상태 관리를 강제한다.
---

# Lotto Project Manager Skill (v18.1)

이 스킬은 프로젝트의 **허브 아키텍처(Hub Architecture)** 및 **비즈니스 로직 독립성**을 보장하며, 컴포넌트 재사용성과 시스템 안정성을 극대화하는 관리 표준을 정의합니다.

## 주요 워크플로우 Standard

1.  **사전 검토 (Pre-Check)**:
    *   **Document-First**: 수정 시작 전 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락을 파악한다.
    *   **Logic Isolation Check**: 모든 알고리즘(시뮬레이션, 추천, 스코어링, 번호 풀링, 시너지 매트릭스)은 반드시 `unified_engine.js`(`LottoAI`)에 정의되어야 한다.
    *   **Multi-Layer Validation**: 추천 조합 생성 시 단순 빈도 외에 **번호 간 궁합(Synergy)** 및 **구조적 지표(Mean Gap, AC Value, Flow Score)**를 반드시 교차 검증한다.

2.  **구현 원칙 (v18.1+)**:
    *   **아키텍처 분리 (Modular Hub)**: `lotto_utils.js`(공통 수학), `indicators.js`(설정), `core.js`(인프라), `unified_engine.js`(로직), `ui_components.js`(UI), `prediction.js`/`pension_prediction.js`(예측)로 모듈을 세분화한다.
    *   **엄격한 로드 순서 (Utils-First)**: 모든 HTML 파일은 `lotto_utils.js` -> `indicators.js` -> `core.js` -> `unified_engine.js` -> `pension_utils.js` -> `ui_components.js` -> `engine.js` 순으로 로드한다.
    *   **Synergy-AI 표준**: 추천 엔진은 실시간 계산된 **Co-occurrence Matrix**를 기반으로 번호 간 유대 점수를 산출하며, 시너지 점수(pt)를 UI에 반드시 명시한다.
    *   **정밀 레이아웃 표준**: 통계 표 컬럼 너비(55/230/80) 및 중앙 정렬, 차트 라벨 더블 라인(수치/%) 표준을 준수한다.
    *   **버전 동기화 (Vibe Sync)**: 시스템 버전 갱신 시 `node sync_version.cjs`를 실행하여 모든 HTML 리소스 파라미터와 문서 버전을 일괄 동기화한다. (현재 v18.1 표준)

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후 `GEMINI.md` 및 핵심 문서들을 실시간 업데이트하여 '설계의 최신성'을 유지한다.
    *   커밋 전 `verify_logic_match.py`를 통해 백엔드와 프론트엔드 간의 로직 일관성을 최종 확인한다.

## 사용 예시

*   "번호 간 궁합 로직 수정" -> `unified_engine.js`의 `calculateSynergyMatrix`를 수정하여 추천 알고리즘의 기초를 다진다.
*   "새로운 분석 지표 통합" -> `unified_engine.js`의 `getAdvancedScore`에 해당 지표를 추가하여 Multi-Layer 필터링을 강화한다.
*   "성과 리포트 업데이트" -> `prediction.js`의 `runBacktest` 로직을 최신 분석 기준에 맞춰 동기화한다.

## 핵심 도구

*   **Vibe Sync (v12.0+)**: `node sync_version.cjs` (리소스/문서 버전 일괄 동기화)
*   **Data Guardian**: `python3 verify_data.py` (데이터 무결성 심층 검증)
*   **Logic Matcher**: `python3 verify_logic_match.py` (Python-JS 로직 교차 검증)
*   **Version Bump**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`


