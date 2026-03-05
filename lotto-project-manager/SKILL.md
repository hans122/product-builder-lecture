---
name: lotto-project-manager
description: AI 로또 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 코드 수정 전 PRD/SDD/DATA_SCHEMA를 확인하고 작업 후 문서 버전을 자동 업데이트한다.
---

# Lotto Project Manager Skill (v10.0)

이 스킬은 프로젝트의 설계도와 코드 사이의 완벽한 일치를 보장하며, AI 예측 엔진의 정밀도와 UI 일관성을 유지하기 위해 사용됩니다.

## 주요 워크플로우

1.  **사전 검토 (Pre-Check)**:
    *   모든 코드 수정 요청 시, 루트 디렉토리의 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 먼저 읽는다.
    *   현재 요청이 `DATA_SCHEMA.md`의 G1~G6 분류 체계를 준수하는지 확인한다.
    *   AI 예측 로직 변경 시 `prediction.js`의 3단계 과출현 억제 모델(Grid Search 결과)을 준수한다.

2.  **구현 원칙**:
    *   **SSOT 준수**: 지표명, ID, 키값은 반드시 `indicators.js`와 `DATA_SCHEMA.md`를 따른다.
    *   **AI 정합성**: 백테스트 렌더링 시 6개 표준 컬럼 및 S/A/B 등급제 레이아웃을 절대적 기준으로 삼는다.
    *   **차트 시각화 표준**: 모든 분포 차트(Curve Chart)는 실시간 통계 엔진을 통해 평균(Mean)과 표준편차(Std)를 산출하여 정규분포 곡선으로 렌더링한다. 누적 확률 백분위(2.5%, 16%, 50%, 84%, 97.5%) 라벨링 및 45px 충돌 방지 로직을 필수 적용한다.
    *   **분할 레이아웃 표준**: 모든 분포 차트 우측에는 `analysis-layout-split` 구조를 적용하여 최근 5회차의 수치를 보여주는 `mini-table` 리포트를 반드시 병기한다. 이를 통해 통계적 추세와 최근 실측 데이터의 즉각적인 대조를 보장한다.
    *   **리포트 최적화**: 연금 분석 리포트는 가독성 및 모바일 대응을 위해 최근 5회차 데이터로 제한한다. (Lotto는 6~10회차 유지)
    *   **캐시 관리**: 데이터 구조나 로직 변경 시 `core.js`의 `LottoDataManager.SYSTEM_VERSION`을 즉시 업데이트하여 클라이언트 캐시를 강제 갱신한다.
    *   **UI Grid**: 예측 풀은 반드시 `pool-grid-10` (10열 그리드) 및 `.ball.mini` 규격을 준수한다.

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후, 변경된 사항을 `PRD.md`나 `GEMINI.md`에 반영한다.
    *   `scripts/bump_version.cjs`를 실행하여 관련 문서의 버전을 자동으로 올린다.

## 사용 예시

*   "통계 지표 순서를 바꿔줘" -> `indicators.js`와 `DATA_SCHEMA.md`를 동시 수정하도록 안내한다.
*   "새로운 분석 기능을 추가해줘" -> `PRD.md`에 요구사항을 먼저 적고 구현하도록 프로세스를 강제한다.
*   "자료가 안 보여" -> `SYSTEM_VERSION` 체크 및 `advanced_stats.json` 데이터 구조를 먼저 검증한다.

## 도구 활용

*   **버전 업데이트**: `node scripts/bump_version.cjs` 실행
*   **데이터 검증**: `python3 analyze_data.py` 실행 후 `recent_draws` 필드 유무 확인
