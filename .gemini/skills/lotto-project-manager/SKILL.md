---
name: lotto-project-manager
description: AI 로또 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 코드 수정 전 PRD/SDD/DATA_SCHEMA를 확인하고 작업 후 문서 버전을 자동 업데이트한다.
---

# Lotto Project Manager Skill

이 스킬은 프로젝트의 설계도와 코드 사이의 완벽한 일치를 보장하기 위해 사용됩니다.

## 주요 워크플로우

1.  **사전 검토 (Pre-Check)**:
    *   모든 코드 수정 요청 시, 루트 디렉토리의 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 먼저 읽는다.
    *   현재 요청이 `DATA_SCHEMA.md`의 G1~G6 분류 체계를 준수하는지 확인한다.
    *   `indicators.js` 설정과 UI 구현이 일치하는지 검토한다.
    *   **물리적 한계 검증**: 모든 지표가 로또의 물리적 규칙(`maxLimit`) 및 실제 데이터 범위를 준수하는지 확인한다.

2.  **구현 원칙**:
    *   **SSOT 준수**: 지표명, ID, 키값은 반드시 `indicators.js`와 `DATA_SCHEMA.md`를 따른다.
    *   **Core-Centric**: UI 컴포넌트(`LottoUI`)와 분석 로직(`LottoUtils`)은 반드시 `core.js`를 거쳐야 하며, 개별 페이지에서의 중복 정의를 금지한다.
    *   **25/5/15 전략**: AI 예측 번호 풀은 '추천 25 / 보류 5 / 제외 15' 구성을 표준으로 유지한다.

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후, 변경된 사항을 `PRD.md`나 `GEMINI.md`에 반영한다.
    *   `scripts/bump_version.cjs`를 실행하여 관련 문서의 버전을 자동으로 올린다.

## 사용 예시

*   "통계 지표 순서를 바꿔줘" -> 이 스킬이 트리거되어 `indicators.js`와 `DATA_SCHEMA.md`를 동시 수정하도록 안내한다.
*   "새로운 분석 기능을 추가해줘" -> `PRD.md`에 요구사항을 먼저 적고 구현하도록 프로세스를 강제한다.

## 도구 활용

*   **버전 업데이트**: `node scripts/bump_version.cjs` 실행
