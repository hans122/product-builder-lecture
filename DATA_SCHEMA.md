# DATA_SCHEMA.md - Variable & Data Structures

이 문서는 `advanced_stats.json`의 구조와 프론트엔드에서 사용하는 핵심 객체 인터페이스를 정의합니다.

## 1. `advanced_stats.json` (Root Object)
| Key | Type | Description |
|:--- |:--- |:---|
| `frequency` | Object | { "1": count, ..., "45": count } - 번호별 누적 출현 빈도 |
| `distributions` | Object | 항목별 통계 분포 데이터 (차트용) |
| `total_draws` | Number | 전체 회차 수 (확률 계산의 분모) |
| `last_3_draws` | Array[Array] | [ [6개번호], [6개번호], [6개번호] ] - 직전 1, 2, 3회차 번호 |
| `recent_draws` | Array[Object] | 최근 30회차 상세 분석 리스트 (히스토리용) |

## 2. `distributions` 상세 (Chart Data)
모든 분포 데이터는 `label: count` 형태의 Object입니다.
- `odd_even`: "홀:짝" (ex: "3:3")
- `high_low`: "고:저" (ex: "2:4")
- `period_1`: 직전 1회차 매칭 개수 (0~6)
- `period_1_2`: 직전 1~2회차 합집합 매칭 개수 (0~12)
- `period_1_3`: 직전 1~3회차 합집합 매칭 개수 (0~18)
- `sum`: 총합 구간 (ex: "120-139")
- `bucket_15`: 3분할(15개씩) 점유 구간 수 (1~3)
- `bucket_9`: 5분할(9개씩) 점유 구간 수 (1~5)
- `bucket_5`: 9분할(5개씩) 점유 구간 수 (1~6)
- `bucket_3`: 15분할(3개씩) 점유 구간 수 (1~6)
- `color`: 출현 색상 가짓수 (1~5)
- `ac`: AC값 (0~10)
- `span`: 최대 간격 (0~44)

## 3. `recent_draws` 객체 (Draw Detail)
| Key | Type | Example |
|:--- |:--- |:---|
| `no` | Number | 1105 |
| `date` | String | "2024-02-03" |
| `nums` | Array | [1, 2, 3, 4, 5, 6] |
| `sum` | Number | 21 |
| `odd_even` | String | "3:3" |
| `high_low` | String | "6:0" |
| `period_1` | Number | 1 (직전 1회차 매칭) |
| `period_1_2` | Number | 2 (직전 1~2회차 매칭) |
| `period_1_3` | Number | 3 (직전 1~3회차 매칭) |
| `ac` | Number | 8 |
| `b15` | Number | 3 (JS 내부 매핑된 bucket_15 카운트) |
| `color` | Number | 4 |

## 4. Frontend Mapping Rules
- **구간 매핑**: Python 데이터 필드명과 JS UI ID를 1:1 매칭한다.
- **Null Safety**: 데이터가 없을 경우 기본값(0 또는 '-')을 할당한다.
- **Naming Convention**: 
    - Python: `snake_case` (period_1_2)
    - JavaScript: `camelCase` (isOptimal) / `kebab-case` (period-1-2-chart)
