# DATA_SCHEMA.md - Master Data & System Architecture (v5.0)

## 1. 시스템 아키텍처 (Core Engine)
본 프로젝트는 `core.js`를 중심으로 하는 중앙 집중형 로직 및 데이터 관리 체계를 따른다.

### LottoCore 모듈 구성
- **LottoConfig**: 25개 전 지표의 명칭, 키값, 계산 로직(calc)을 정의한 단일 소스(SSOT).
- **LottoUtils**: 공통 유틸리티(isPrime, getBallColorClass, getZStatus 등) 및 에러 로깅 서비스.
- **LottoUI**: 컴포넌트 기반 렌더링 엔진(createBall, createAnalysisItem, showSkeleton).
- **LottoDataManager**: 데이터 페칭 및 캐싱 서비스.

## 2. 지표 표준 매핑 테이블
| 분류 | 지표명 | distKey (JSON 분포) | statKey (JSON 요약) | drawKey (JSON 회차) | JS ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[G1~G5]** | (생략) | (v4.4 규격 유지) | (v4.4 규격 유지) | (v4.4 규격 유지) | (하이픈 표준) |

## 3. 시각화 및 UX 정책 (v5.0)
- **반올림 표준**: 모든 통계 지점은 `Math.round()`를 적용한다.
- **이중 빗금**: 세이프 존(-45° 파랑), 옵티멀 존(45° 녹색) 적용.
- **스켈레톤 로딩**: 데이터 수신 전 `.skeleton-grid` 애니메이션 표시 필수.
- **상단 배지 제거**: 차트 상단 텍스트를 제거하고 하단 라벨로 정보 통합.

## 4. 자동 업데이트 파이프라인
- **update_latest.py**: 매주 최신 당첨 번호 자동 수집 스크립트.
- **Data Flow**: 크롤링 -> lt645.csv 갱신 -> analyze_data.py 실행 -> JSON/Frequency 동기화.

## 5. 클라이언트 데이터 (LocalStorage)
- `lastGeneratedNumbers`: 전 페이지 분석의 기준이 되는 마스터 번호 세트.
