# DATA_SCHEMA.md - Variable & Data Structures (v1.3)

이 문서는 `advanced_stats.json`의 최종 구조를 정의하며, 프론트엔드 개발의 기준이 됩니다.

## 1. `advanced_stats.json` 구조
| Key | Type | Description |
|:--- |:--- |:---|
| `frequency` | Object | { "1": count, ... } - 번호별(1-45) 누적 출현 빈도 |
| `distributions` | Object | 항목별 역대 통계 분포 (차트용) |
| `total_draws` | Number | 전체 회차 수 (확률 계산의 분모) |
| `last_3_draws` | Array[Array] | [ [1회전], [2회전], [3회전] ] - 최근 3개 회차 번호 |
| `recent_draws` | Array[Object] | 최근 30회차 상세 분석 데이터 (히스토리용) |

## 2. `distributions` 상세 필드
모든 데이터는 `{ "라벨": 횟수 }` 형식입니다.
- **회차 매칭 (Window)**: `period_1` (1회전), `period_1_2` (1~2회전), `period_1_3` (1~3회전)
- **기본 비율**: `odd_even` (홀:짝), `high_low` (고:저), `sum` (총합 구간)
- **특수 번호군**: `prime` (소수), `composite` (합성수), `multiple_3` (3배수), `multiple_5` (5배수), `square` (제곱수), `double_num` (쌍수)
- **구간 분할**: `bucket_15` (3분할), `bucket_9` (5분할), `bucket_5` (9분할), `bucket_3` (15분할)
- **패턴/전문**: `color` (색상수), `pattern_corner` (모서리), `pattern_triangle` (삼각형), `ac` (AC값), `span` (간격), `end_sum` (끝수합), `same_end` (동끝수)

## 3. `recent_draws` 객체 필드 (JS Mapping)
| Key | Logic Source | UI Target |
|:--- |:--- |:---|
| `period_1_2`, `period_1_3` | Union of past draws | 히스토리 1~2, 1~3 컬럼 |
| `b15`, `b9`, `b5`, `b3` | math.floor mappings | 구간 분석 미니 테이블 |
| `p_corner`, `p_tri` | pattern sets matching | 패턴 분석 미니 테이블 |
| `m3`, `square`, `m5`, `double` | modulo / set matching | 특수수 분석 미니 테이블 |
