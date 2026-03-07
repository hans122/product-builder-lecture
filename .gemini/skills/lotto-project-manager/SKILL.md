---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 컴포넌트 기반 UI, 이벤트 드리븐 상태 관리를 강제한다.
---

# Lotto Project Manager Skill (v22.0)

이 스킬은 프로젝트의 **허브 아키텍처(Hub Architecture)** 및 **비즈니스 로직 독립성**을 보장하며, 컴포넌트 재사용성과 시스템 안정성을 극대화하는 관리 표준을 정의합니다.

## 주요 워크플로우 Standard

1.  **사전 검토 (Pre-Check)**:
    *   **Document-First**: 수정 시작 전 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락을 파악한다.
    *   **Data-Driven Check**: UI나 로직 수정 시 하드코딩을 지양하고, `indicators.js` 설정을 통해 자동 반영될 수 있는지 우선 검토한다.
    *   **Logic Isolation Check**: 모든 알고리즘(시뮬레이션, 추천, 스코어링, 번호 풀링)은 반드시 `unified_engine.js`(`LottoAI`)에 정의되어야 한다.

2.  **구현 원칙 (v22.0+)**:
    *   **완전 자동화 (Full Automation)**: 히스토리 표, 분석 대시보드, 가이드, 추천 엔진 필터는 `indicators.js`의 `visible` 및 `filter` 속성을 읽어 동적으로 생성 및 적용되어야 한다.
    *   **AI Regression Timing**: 지표별 회귀 에너지는 ±1σ(68% 구간)를 기준으로 산출하며, 3단계 색상(Red/Orange/Blue) 신호를 필수로 적용한다.
    *   **Expert Visualization**: 차트의 통계 범위(Safe/Optimal)는 반드시 **이중 빗금(Double-Hatching)** 패턴을 사용하여 선명도를 확보한다.
    *   **아키텍처 분리 (Modular Hub)**: `lotto_utils.js`(공통 수학), `indicators.js`(설정), `core.js`(인프라), `unified_engine.js`(로직), `ui_components.js`(UI), `prediction.js`/`pension_prediction.js`(예측)로 모듈을 세분화한다.
    *   **엄격한 로드 순서 (Utils-First)**: 모든 HTML 파일은 `lotto_utils.js` -> `indicators.js` -> `core.js` -> `unified_engine.js` -> `pension_utils.js` -> `ui_components.js` -> `engine.js` 순으로 로드한다.
    *   **SSOT 데이터 관리**: 모든 분석 지표 설정, 가이드 팁, 그룹 명칭은 `indicators.js`에서만 관리한다.
    *   **버전 동기화 (Vibe Sync)**: 시스템 버전 갱신 시 `node sync_version.cjs`를 실행하여 모든 HTML 리소스 파라미터와 문서 버전을 일괄 동기화한다. (현재 v22.0 표준)

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후 `GEMINI.md` 및 핵심 문서들을 실시간 업데이트하여 '설계의 최신성'을 유지한다.
    *   커밋 전 `verify_logic_match.py`를 통해 백엔드와 프론트엔드 간의 로직 일관성을 최종 확인한다.

## 사용 예시

*   "새로운 분석 지표 추가" -> `indicators.js`의 `INDICATORS` 배열에 객체를 추가하고 `visible: {history: true}` 등을 설정하면 모든 페이지에 자동 반영된다.
*   "추천 필터링 기준 변경" -> `indicators.js`의 `filter` 속성값만 수정한다. (엔진 코드 수정 불필요)
*   "조합 분석 점수 로직 수정" -> `unified_engine.js`의 `LottoAI.calculateTotalScore`를 수정한다.

## 핵심 도구

*   **Vibe Sync (v22.0)**: `node sync_version.cjs` (리소스/문서 버전 일괄 동기화)
*   **Data Guardian**: `python3 verify_data.py` (데이터 무결성 심층 검증)
*   **Logic Matcher**: `python3 verify_logic_match.py` (Python-JS 로직 교차 검증)
*   **Version Bump**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
