# DATA_SCHEMA.md - Variable & Data Structures (v1.5)

## 1. `advanced_stats.json` 구조
| Key | Type | Description |
|:--- |:--- |:---|
| `frequency` | Object | { "1": count, ... } - 번호별 누적 출현 빈도 |
| `distributions` | Object | 항목별 역대 통계 분포 (차트용) |
| `total_draws` | Number | 전체 회차 수 |
| `last_3_draws` | Array[Array] | 최근 3개 회차 번호 리스트 |
| `recent_draws` | Array[Object] | 최근 30회차 상세 분석 (히스토리용) |

## 2. 미니 테이블 ID 매핑 규칙 (analysis.html)
JS(`renderMiniTables`)가 데이터를 주입하는 대상 ID 목록입니다.
- `odd-even-mini-body`: 홀짝 비율
- `high-low-mini-body`: 고저 비율
- `multiple-3-mini-body`: 3의 배수 개수
- `prime-mini-body`: 소수 개수
- `period-1-mini-body`: 이월수 개수
- `period-1-2-mini-body`: 1~2회전 매칭
- `period-1-3-mini-body`: 1~3회전 매칭
- `bucket-15-mini-body`: 3분할(15개씩) 점유
- `bucket-3-mini-body`: 15분할(3개씩) 점유

## 3. 실시간 분석 필드 (main.js)
번호 생성 시 즉시 계산되는 ID 목록입니다.
- `square-count`: 완전제곱수 (1,4,9,16,25,36)
- `double-count`: 쌍수 (11,22,33,44)
- `pattern-corner-count`: 모서리 패턴
- `pattern-triangle-count`: 삼각형 패턴
- `color-count`: 5색 분할 점유수
