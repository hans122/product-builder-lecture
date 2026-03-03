# Lotto Project Manager Skill (v8.0)

AI 로또/연금 분석 서비스의 데이터 무결성 및 아키텍처 가디언 스킬입니다.

## 🛡️ 핵심 아키텍처: 이모탈 가디언 (v8.0)
1. **0초 로딩 (Persistent Cache)**: `localStorage`를 활용하여 페이지 이동 및 재접속 시 즉시 데이터를 렌더링한다.
2. **불사신 엔진 (Error Isolation)**: 개별 지표 계산(`calc`) 오류 시 해당 항목만 격리(Isolation)하고 전체 시스템 마비를 방지한다.
3. **데이터 검증 (Schema Validator)**: JSON/CSV 로드 직후 구조적 결함을 즉시 검사하여 깨진 데이터 유입을 차단한다.
4. **지능형 동기화 (Smart Sync)**: 매일 첫 접속 시에만 서버 데이터를 갱신하여 자원을 최적화한다.

## 📊 분석 지표 표준
### 로또 (G1~G6) + [G0] 심화 시너지
- **[G0] 상관관계 분석**: 
  - `syn-bucket-sum`: 구간 편중 및 총합 부조화 감지 (오탐지율 0.16%)
  - `syn-ac-none-consec`: 극대 복잡도(AC 10) 및 연번 부재 감지 (오탐지율 8.24%)
  - `syn-endsum-sameend`: 끝수 합 및 동끝수 집중 감지 (오탐지율 1.32%)

### 연금복권 (P1~P8)
- **[P5] 자리수 역학**: 이월수 및 이웃수 이동 패턴 분석
- **[P6] 미출현 주기 (Gap)**: 자리수별 숫자 미출현 회차 히트맵 (임계점 분석)
- **[P8] 구조적 패턴**: 대칭형, 계단형, 등차수열 등 배열의 특수성 감지

## 🛠️ 구현 원칙
- **ES5 Hyper Stability**: 모든 코어 로직은 구형 WebView 및 IE11 호환을 위해 ES5 문법을 유지한다.
- **Visual Warm-up**: 데이터 로딩 찰나의 순간에는 **Skeleton UI**를 통해 체감 속도를 극대화한다.
- **SSOT**: 모든 지표 설정은 `indicators.js`를, 엔진은 `core.js`를 유일한 진실의 원천으로 삼는다.

## 🔄 버전 관리 및 배포
- 작업 완료 후 반드시 `node .gemini/skills/lotto-project-manager/scripts/bump_version.cjs`를 실행하여 문서 동기화를 수행한다.
