# DATA_SCHEMA.md - Master Data & System Architecture (v5.1)

## 1. 시스템 아키텍처 (Core Engine)
본 프로젝트는 `core.js`를 중심으로 하는 중앙 집중형 로직 및 데이터 관리 체계를 따른다.

### LottoCore 모듈 구성
- **LottoConfig**: 모든 지표의 단일 소스(SSOT).
- **LottoUtils**: 공통 유틸리티 및 Z-Score 판정 로직.
- **LottoUI**: 컴포넌트 기반 렌더링 엔진.
- **LottoDataManager**: 데이터 캐싱 서비스.

## 2. 지표 표준 매핑 테이블 (Master Mapping Table)
| 분류 | 지표명 | distKey (분포) | statKey (요약) | drawKey (회차) | JS ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[G1]** | 총합 | `sum` | `sum` | `sum` | `sum` |
| | 홀짝 비율 | `odd_even` | `odd_count` | `odd_even` | `odd-even` |
| | 고저 비율 | `high_low` | `low_count` | `high_low` | `high-low` |
| **[G2]** | 직전 1회차 매칭 | `period_1` | `period_1` | `period_1` | `period_1` |
| | 이웃수 | `neighbor` | `neighbor` | `neighbor` | `neighbor` |
| | 연속번호 쌍 | `consecutive` | `consecutive` | `consecutive` | `consecutive` |
| **[G3]** | 소수 포함 | `prime` | `prime` | `prime` | `prime` |
| | 합성수 포함 | `composite` | `composite` | `composite` | `composite` |
| | 3배수 포함 | `multiple_3` | `multiple_3` | `multiple_3` | `multiple-3` |
| | 5배수 포함 | `multiple_5` | `multiple_5` | `m5` | `multiple-5` |
| | 쌍수 포함 | `double_num` | `double_num` | `double` | `double` |
| **[G4]** | 3분할 점유 | `bucket_15` | `bucket_15` | `b15` | `bucket-15` |
| | 5분할 점유 | `bucket_9" | `bucket_9` | `b9` | `bucket-9` |
| | 포함 색상수 | `color` | `color` | `color` | `color` |
| | 모서리 패턴 | `pattern_corner` | `pattern_corner` | `p_corner` | `pattern-corner` |
| | 삼각형 패턴 | `pattern_triangle` | `pattern_triangle` | `p_tri` | `pattern-triangle` |
| **[G5]** | 끝수합 | `end_sum` | `end_sum` | `end_sum` | `end-sum` |
| | 동끝수 | `same_end` | `same_end` | `same_end` | `same-end` |
| | AC값 | `ac` | `ac` | `ac` | `ac` |
| | Span(간격) | `span` | `span` | `span` | `span` |
| **[G6]** | 첫 수 범위 | `first_num` | `first_num` | `first_num` | `first-num` |
| | 끝 수 범위 | `last_num` | `last_num` | `last_num` | `last-num` |
| | 평균 간격 | `mean_gap` | `mean_gap` | `mean_gap` | `mean-gap` |

## 3. 시각화 및 UX 정책 (v5.1)
- **반올림 표준**: 모든 통계 지점은 `Math.round()`를 적용한다.
- **이중 빗금**: 세이프 존(-45° 파랑), 옵티멀 존(45° 녹색) 적용.
- **차트 레이아웃**: 높이 200px, 하단 여백 40px, X축 가이드 라인 포함.
- **상단 배지 제거**: 차트 상단 텍스트를 제거하고 하단 라벨로 정보 통합.

## 4. 자동 업데이트 파이프라인
- **update_latest.py**: 매주 최신 당첨 번호 자동 수집 및 통계 재분석 실행.
