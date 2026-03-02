# DATA_SCHEMA.md - Master Data & System Architecture (v6.0)

## 1. 시스템 아키텍처 (Core Engine)
본 프로젝트는 `core.js`를 중심으로 하는 중앙 집중형 로직 및 데이터 관리 체계를 따른다.

### LottoCore 모듈 구성
- **LottoConfig (indicators.js)**: 28개 지표 및 [G0] 시너지 규칙을 정의한 단일 설정 파일 (SSOT).
- **LottoUtils (core.js)**: 공통 유틸리티 및 Z-Score 판정 로직.
- **LottoSynergy (core.js)**: 설정 기반 상관관계 분석 실행 엔진.
- **LottoUI (core.js)**: 컴포넌트 기반 렌더링 엔진.
- **LottoDataManager (core.js)**: 데이터 캐싱 및 API 연동 서비스.

## 2. 지표 표준 매핑 테이블 (Master Mapping Table)
| 분류 | 지표명 | distKey (분포) | statKey (요약) | drawKey (회차) | JS ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[G0]** | 시너지 분석 | - | - | - | `SYNERGY_RULES` |
| **[G1]** | 총합 | `sum` | `sum` | `sum` | `sum` |
| | 홀짝 비율 | `odd_even` | `odd_count` | `odd_even` | `odd-even` |
| | 고저 비율 | `high_low` | `low_count` | `high_low` | `high-low` |
| **[G2]** | 직전 1회차 매칭 | `period_1` | `period_1` | `period_1` | `period_1` |
| | 이웃수 | `neighbor` | `neighbor` | `neighbor` | `neighbor` |
| | 1~2회전 윈도우 | `period_1_2` | `period_1_2` | `period_1_2` | `period_1_2` |
| | 1~3회전 윈도우 | `period_1_3` | `period_1_3` | `period_1_3` | `period_1_3` |
| | 연속번호 쌍 | `consecutive` | `consecutive` | `consecutive` | `consecutive` |
| **[G3]** | 소수 포함 | `prime` | `prime` | `prime` | `prime` |
| | 합성수 포함 | `composite` | `composite` | `composite` | `composite` |
| | 3배수 포함 | `multiple_3` | `multiple_3` | `multiple_3` | `multiple-3` |
| | 5배수 포함 | `multiple_5` | `multiple_5` | `m5` | `multiple-5` |
| | 제곱수 포함 | `square` | `square` | `square` | `square` |
| | 쌍수 포함 | `double_num` | `double_num` | `double` | `double` |
| **[G4]** | 3분할 점유 | `bucket_15` | `bucket_15` | `b15` | `bucket-15` |
| | 5분할 점유 | `bucket_9` | `bucket_9` | `b9` | `bucket-9` |
| | 9분할 점유 | `bucket_5` | `bucket_5` | `b5` | `bucket-5` |
| | 15분할 점유 | `bucket_3` | `bucket_3` | `b3` | `bucket-3` |
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

## 3. 시각화 및 UX 정책 (v6.0)
- **Expert Table System**: 가로로 긴 표는 45도 대각선 헤더 및 틀 고정(Sticky)을 필수 적용한다.
- **Grid Layout**: 예측 번호 풀은 10열 그리드를 기본으로 정밀 정렬한다.
- **Performance Grading**: 성과 지표는 S/A/B/C 등급제로 정량화하여 표시한다.
- **Real Paper Experience**: 번호 선택 용지는 실제 로또 용지 질감과 가독성 높은 강조(Red/Blue Solid) 효과를 제공한다.
- **Responsive Symmetry**: 통계 카드는 전 해상도에서 차트(유연)와 미니 표(고정)의 좌우 밸런스를 유지한다.

## 4. 자동 업데이트 파이프라인
- **update_latest.py**: 매주 최신 당첨 번호 자동 수집 및 통계 재분석 실행.
- **백테스트 무결성**: 과거 시뮬레이션 시 미래 데이터 차단(Time-Slice) 로직 준수.
