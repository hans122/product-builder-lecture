# DATA_SCHEMA.md - Variable & Data Structures (v1.4)

이 문서는 `advanced_stats.json`의 최종 구조를 정의하며, 모든 프론트엔드 분석 로직의 기준이 됩니다.

## 1. `advanced_stats.json` 구조
| Key | Type | Description |
|:--- |:--- |:---|
| `frequency` | Object | { "1": count, ... } - 번호별(1-45) 누적 출현 빈도 |
| `distributions` | Object | 항목별 역대 통계 분포 데이터 |
| `total_draws` | Number | 전체 회차 수 (확률 계산의 분모) |
| `last_3_draws` | Array[Array] | [ [1회전], [2회전], [3회전] ] - 최근 3개 회차 당첨번호 |
| `recent_draws` | Array[Object] | 최근 30회차 상세 분석 데이터 (히스토리 및 미니 테이블용) |

## 2. `distributions` 및 `recent_draws` 핵심 필드명
| Field (JSON) | Description | Mapping (UI ID) |
|:--- |:--- |:---|
| `period_1_2` | 1~2회전 윈도우 매칭 | `period-1-2-chart` / `period-1-2-mini-body` |
| `period_1_3` | 1~3회전 윈도우 매칭 | `period-1-3-chart` / `period-1-3-mini-body` |
| `bucket_15` | 3분할 점유 (15개씩) | `bucket-15-chart` / `bucket-15-mini-body` |
| `bucket_3` | 15분할 점유 (3개씩) | `bucket-3-chart` / `bucket-3-mini-body` |
| `multiple_3` | 3의 배수 포함 개수 | `multiple-3-chart` / `multiple-3-mini-body` |
| `composite` | 합성수 포함 개수 | `composite-mini-body` |

## 3. UI 렌더링 규칙
- **Chart**: `renderDistChart` 함수를 통해 백분율(%)과 횟수를 병기한다.
- **Table**: `renderMiniTables` 함수를 통해 최근 6회차 데이터를 맵핑하며, 데이터 부재 시 `-`를 할당한다.
