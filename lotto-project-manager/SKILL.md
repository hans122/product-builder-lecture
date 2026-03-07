---
name: lotto-project-manager
description: AI 로또/연금 분석 서비스의 문서 정합성 관리 및 아키텍처 가디언 스킬. 통합 엔진(Unified Engine), 컴포넌트 기반 UI, 이벤트 드리븐 상태 관리를 강제한다.
---

# Lotto Project Manager Skill (v24.3)

이 스킬은 프로젝트의 **허브 아키텍처(Hub Architecture)** 및 **비즈니스 로직 독립성**을 보장하며, 컴포넌트 재사용성과 시스템 안정성을 극대화하는 관리 표준을 정의합니다.

## 주요 워크플로우 Standard

1.  **사전 검토 (Pre-Check)**:
    *   **Document-First**: 수정 시작 전 `PRD.md`, `SDD.md`, `DATA_SCHEMA.md`를 전수 읽기하여 현재 요청의 맥락을 파악한다.
    *   **Logic Isolation Check**: 모든 알고리즘(시뮬레이션, 추천, 스코어링, 번호 풀링, 기댓값 산출)은 반드시 `unified_engine.js`(`LottoAI`)에 정의되어야 한다.

2.  **구현 원칙 (v24.3+)**:
    *   **Outlier Guard (v23.1+)**: 지표 간 상관관계 분석 시 95% 준수율을 목표로 하며, 1.8σ 이상의 극단적 이탈만 감지하여 하위 5%의 모순된 조합을 강력하게 필터링한다.
    *   **Win Probability Index (v24.0+)**: 무작위 조합 대비 통계적 우위를 배수(Multiplier)로 산출하여 사용자에게 기댓값과 신뢰도를 제공한다.
    *   **Full Automation**: 모든 지표 레이블에는 `01)`, `P01)` 등의 동적 순번을 부여하며, `indicators.js` 설정만으로 전 페이지 UI가 자동 동기화되어야 한다.
    *   **Expert Visualization**: 차트의 통계 범위는 **이중 빗금(Double-Hatching)** 패턴을 사용하여 전문가급 시인성을 확보한다.
    *   **Modular Hub**: UI 생성은 `ui_components.js`, 비즈니스 로직은 `unified_engine.js`, 전역 설정은 `indicators.js`로 역할을 엄격히 분리한다.

3.  **사후 정리 (Post-Sync)**:
    *   작업 완료 후 `GEMINI.md` 및 핵심 문서들을 실시간 업데이트하여 '설계의 최신성'을 유지한다.
    *   시스템 버전 변경 시 `node sync_version.cjs`를 실행하여 리소스 캐싱 파라미터를 일괄 동기화한다.

## 주요 도구 및 검증

*   **Vibe Sync (v22.0+)**: `node sync_version.cjs` (리소스/문서 버전 일괄 동기화)
*   **Correlation Backtest**: `python3 verify_correlation_backtest.py` (상관관계 및 아웃라이어 가드 유효성 검증)
*   **Logic Matcher**: `python3 verify_logic_match.py` (Python-JS 로직 교차 검증)
*   **Version Bump**: `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`
