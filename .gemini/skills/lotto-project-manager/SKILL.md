---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 동적 렌더링(Dynamic UI), 엄격 모드(Strict Mode) 표준을 강제한다.
---

# Lotto Project Manager Skill (v11.2)

이 스킬은 프로젝트의 **통합 엔진 및 자율형 UI 아키텍처(Autonomous UI Architecture)**를 보장하며, 로직 일관성, 코드 안정성, 백엔드 중심의 데이터 유효성 검증을 관리합니다.

## 주요 워크플로우

1.  **사전 검토 (Pre-Check)**:
    *   모든 수정 요청 전, `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 표준을 내재화한다.
    *   **접두사 표준 준수**: 로또 지표는 `[GL#]`, 연금 지표는 `[GP#]` 형식을 엄격히 따르는지 확인한다.
    *   **데이터 검증**: `analyze_data.py`의 유효성 검사 로직(Validation)을 통과한 데이터만 처리됨을 인지한다.

2.  **구현 원칙**:
    *   **자율형 동적 렌더링**: 가이드 페이지 등 반복되는 UI는 HTML 수동 수정 대신 `indicators.js` 설정을 읽어 JS가 스스로 그리도록(Dynamic Rendering) 강제한다.
    *   **엄격 모드 적용**: 모든 JavaScript 파일 최상단에 `'use strict';` 선언을 필수 포함하여 런타임 안정성을 확보한다.
    *   **통합 엔진 활용**: 5대 핵심 엔진(`analysis_engine.js`, `combination_engine.js`, `data_viewer.js`, `view_manager.js`, `content_loader.js`) 내부에서 도메인을 분기 처리한다.
    *   **캐시 버스팅**: 리소스 업데이트 시 `core.js`의 `SYSTEM_VERSION`을 갱신(현재 v11.2)하고, 모든 HTML의 리소스 호출 경로(?v=11.2)를 동기화한다.
    *   **반응형 차트**: 모든 SVG 기반 분석 차트는 `style.css`의 표준 반응형 속성(`max-width: 100%`)을 준수해야 한다.

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후 `PRD.md`, `SDD.md`, `GEMINI.md`에 변경 사항을 동시 반영한다.
    *   `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행하여 문서 버전을 갱신한다.

## 사용 예시

*   "지표 이름 변경" -> `indicators.js`만 수정하여 가이드/통계/분석 전 페이지에 자동 반영되게 한다.
*   "새로운 분석 기능 추가" -> `analyze_data.py`에서 통계를 선계산하고, 통합 엔진 중 적절한 모듈에 렌더링 로직을 추가한다.
*   "에러 발생" -> `'use strict';` 모드에 따른 전역 변수 오염이나 데이터 유효성 검사 실패 여부를 먼저 확인한다.

## 도구 활용

*   **버전 업데이트**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
*   **통합 분석**: `python3 analyze_data.py` (Lotto & Pension 전체 빌드)
*   **버전 일괄 적용**: HTML 파일의 `?v=X.X` 파라미터 일괄 치환 실행
