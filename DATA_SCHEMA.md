# DATA_SCHEMA.md - Master Data & System Architecture (v7.7)

## 1. 시스템 아키텍처 (Core Engine)
본 프로젝트는 `core.js`를 중심으로 하는 중앙 집중형 로직 및 데이터 관리 체계를 따른다. 로또와 연금의 지표 혼선을 방지하기 위해 **GL(Lotto)** 및 **GP(Pension)** 접두사를 필수 사용한다.

### LottoCore 모듈 구성
- **LottoConfig (indicators.js)**: 28개 로또 지표(GL) 및 [GL0] 시너지 규칙을 정의한 SSOT.
- **LottoUtils (core.js)**: 공통 유틸리티 및 Z-Score 판정 로직.
- **LottoSynergy (core.js)**: GL 지표 기반 상관관계 분석 실행 엔진.
- **LottoUI (core.js)**: 컴포넌트 기반 렌더링 엔진.
- **LottoDataManager (core.js)**: 데이터 캐싱(v10.0+) 및 API 연동 서비스.

## 2. 로또 지표 표준 매핑 테이블 (Lotto Master Mapping)
| 분류 | 지표명 | distKey (분포) | statKey (요약) | drawKey (회차) | JS ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[GL0]** | 복잡도 및 패턴 검증 | - | - | - | `SYNERGY_RULES` |
| **[GL1]** | 총합 | `sum` | `sum` | `sum` | `sum` |
| | 홀짝 비율 | `odd_even` | `odd_count` | `odd_even` | `odd-even` |
| | 고저 비율 | `high_low` | `low_count` | `high_low` | `high-low` |
| **[GL2]** | 직전 1회차 매칭 | `period_1` | `period_1` | `period_1` | `period_1` |
| | 이웃수 | `neighbor` | `neighbor` | `neighbor` | `neighbor` |
| | 1~2회전 윈도우 | `period_1_2` | `period_1_2` | `period_1_2` | `period_1_2` |
| | 1~3회전 윈도우 | `period_1_3` | `period_1_3` | `period_1_3` | `period_1_3` |
| | 연속번호 쌍 | `consecutive` | `consecutive` | `consecutive` | `consecutive` |
| **[GL3]** | 소수 포함 | `prime` | `prime` | `prime` | `prime` |
| | 합성수 포함 | `composite` | `composite` | `composite` | `composite` |
| | 3배수 포함 | `multiple_3` | `multiple_3` | `multiple_3` | `multiple-3` |
| | 5배수 포함 | `multiple_5` | `multiple_5` | `m5` | `multiple-5` |
| | 제곱수 포함 | `square` | `square` | `square` | `square` |
| | 쌍수 포함 | `double_num` | `double_num` | `double` | `double` |
| **[GL4]** | 3분할 점유 | `bucket_15` | `bucket_15` | `b15` | `bucket-15` |
| | 5분할 점유 | `bucket_9` | `bucket_9` | `b9` | `bucket-9` |
| | 9분할 점유 | `bucket_5` | `bucket_5` | `b5` | `bucket-5` |
| | 15분할 점유 | `bucket_3` | `bucket_3` | `b3` | `bucket-3` |
| | 포함 색상수 | `color` | `color` | `color` | `color` |
| | 모서리 패턴 | `pattern_corner` | `pattern_corner` | `p_corner` | `pattern-corner` |
| | 삼각형 패턴 | `pattern_triangle` | `pattern_triangle` | `p_tri` | `pattern-triangle` |
| **[GL5]** | 끝수합 | `end_sum` | `end_sum` | `end_sum` | `end-sum` |
| | 동끝수 | `same_end` | `same_end` | `same_end` | `same-end` |
| | AC값 | `ac` | `ac` | `ac` | `ac` |
| | Span(간격) | `span` | `span` | `span` | `span` |
| **[GL6]** | 평균 간격 | `mean_gap` | `mean_gap` | `mean_gap` | `first-num` |

## 3. 연금복권 지표 매핑 (Pension Master Mapping)
| 분류 | 지표명 | 설명 | 데이터 키 | JS ID |
| :--- | :--- | :--- | :--- | :--- |
| **[GP1]** | 자리수 빈도 | 6개 자리별 0~9 출현 횟수 | `pos_freq` | `p-pos-freq` |
| **[GP2]** | 반복 패턴 | 동일 숫자 연속 출현 (더블, 트리플 등) | `repeat_cnt` | `p-repeat` |
| | 연속 패턴 | 순차적 숫자 출현 (123, 789 등) | `seq_len` | `p-sequence` |
| **[GP3]** | 조별 분포 | 1~5조 출현 횟수 | `group_dist` | `p-group` |
| **[GP4]** | 수치 균형 | 6자리 숫자 합계 및 홀짝 비율 | `p_sum`, `p_oe` | `p-balance` |
| **[GP5]** | 자리수별 이월/이웃 | 각 자리 숫자의 직전 회차 대비 변화 (이월, 이웃) | `pos_dynamics` | `p-pos-dyn` |
| **[GP6]** | 미출현 주기 (Gap) | 각 자리별 0~9 숫자가 마지막으로 나온 지 지난 회차 수 | `digit_gap` | `p-digit-gap` |
| **[GP7]** | 합계 분포 곡선 | 6자리 숫자 합계(0~54)의 통계적 분포 및 골든 존 | `sum_curve` | `p-sum-curve` |
| **[GP8]** | 구조적 패턴 | 계단형(123), 대칭형(123321), 등차 등 특수 배열 감지 | `struct_pattern` | `p-struct` |
| **[GP9]** | 역방향 체인 | 1의 자리부터 10의 자리로 이어지는 전이 확률 분석 | `chain_prob` | `p-chain` |
| **[GP10]** | 끝수 집중도 | 당첨 시작점인 1의 자리 숫자의 출현 강도 가중치 | `ending_weight` | `p-end-focus` |
| **[GP13]** | 출현 타임라인 | 최근 15회차 번호 이동 및 이월 시각화 추적 | `flow_timeline` | `p-flow` |

## 4. 시각화 및 UX 정책 (v7.0)
- **Performance Grading**: 성과 지표는 S/A/B/C 등급제로 정량화하여 표시한다.
- **Reverse-First Strategy**: 연금복권 분석은 반드시 1의 자리(일 단위)부터 역순으로 시각화한다.
- **Anchor-Based AI**: 첫 번째 번호를 고정하고 나머지 조합을 생성하는 앵커 모델을 우선 적용한다.
- **Grid Precision**: 모든 번호 풀은 10열 정밀 그리드를 준수한다.

## 5. 자동 업데이트 파이프라인
- **update_latest.py**: 매주 최신 당첨 번호 자동 수집 및 통계 재분석 실행.
- **analyze_data.py**: 로또(advanced_stats.json) 및 연금(pension_stats.json) 통합 분석 엔진.
- **백테스트 무결성**: 과거 시뮬레이션 시 미래 데이터 차단(Time-Slice) 로직 준수.

## 6. Pension Stats Schema (pension_stats.json)
| Key | Type | Description |
| :--- | :--- | :--- |
| `total_draws` | Number | 전체 분석 회차 수 |
| `pos_freq` | Array[6][10] | 각 자리수별 0~9 출현 빈도 |
| `digit_gap` | Array[6][10] | 각 자리수별 0~9 미출현 주기 |
| `markov_matrix` | Array[10][10] | 전 회차 숫자 대비 다음 회차 숫자 전이 행렬 |
| `group_dist` | Object | 조별 당첨 빈도 분포 |
| `recent_draws` | Array[30] | 최근 30회차 상세 데이터 (no, date, group, nums) |
