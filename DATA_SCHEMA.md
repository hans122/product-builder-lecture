# DATA_SCHEMA.md - Variable & Data Structures (v1.2)

이 문서는 `advanced_stats.json`의 최종 구조를 정의합니다.

## 1. `advanced_stats.json` (Root Object)
| Key | Type | Description |
|:--- |:--- |:---|
| `frequency` | Object | { "1": count, ... } - 번호별 누적 출현 빈도 |
| `distributions` | Object | 항목별 통계 분포 데이터 (차트용) |
| `total_draws` | Number | 전체 회차 수 |
| `last_3_draws` | Array[Array] | [ [1회전], [2회전], [3회전] ] - 직전 3회차 당첨번호 |
| `recent_draws` | Array[Object] | 최근 30회차 상세 분석 리스트 (히스토리용) |

## 2. `distributions` 상세 (Chart Data)
- **Carry-over**: `period_1` (1회전), `period_1_2` (1~2회전), `period_1_3` (1~3회전)
- **Basic**: `odd_even` (3:3), `high_low` (2:4), `sum` (120-139)
- **Special Nums**: `prime` (소수), `composite` (합성수), `multiple_3` (3배수), `multiple_5` (5배수), `square` (제곱수), `double_num` (쌍수)
- **Buckets**: `bucket_15` (3분할), `bucket_9` (5분할), `bucket_5` (9분할), `bucket_3` (15분할)
- **Patterns**: `color` (색상수), `pattern_corner` (모서리), `pattern_triangle` (삼각형), `ac` (AC값), `span` (간격)

## 3. `recent_draws` 객체 필드
JS에서 히스토리 표를 그릴 때 사용하는 필드명입니다.
- `no`, `date`, `nums`, `sum`, `odd_even`, `high_low`
- `period_1`, `period_1_2`, `period_1_3` (윈도우 매칭 개수)
- `prime`, `composite`, `multiple_3` (개수)
- `b15`, `b9`, `b5`, `b3` (점유 구간 수)
- `ac`, `span`, `color`, `p_corner`, `p_tri`
- `square`, `m5`, `double`
