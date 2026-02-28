# DATA_SCHEMA.md - Variable & Data Structures (v1.6)

## 1. 표준 분류 체계 (G1~G5) 및 UI ID 매핑
모든 화면은 아래의 그룹 순서와 데이터 키를 표준으로 사용한다.

| 그룹 | 항목 | JSON Key | Main/Analysis ID | Guide ID |
|:--- |:--- |:--- |:--- |:--- |
| **G1. 기본 균형** | 총합, 홀짝, 고저 | `sum`, `odd_even`, `high_low` | `total-sum`, `odd-even-ratio` | `sum-stat-box`, `oe-stat-list` |
| **G2. 회차 상관** | 이월매칭(1~3), 이웃수, 연번 | `period_1_3`, `neighbor`, `consecutive` | `period-1-count`, `p1-cum-3` | `carry-neighbor-stat`, `consecutive-stat` |
| **G3. 특수 번호** | 소수, 합성수, 3/5배수, 제곱, 쌍수 | `prime`, `composite`, `multiple_3`, `square` | `prime-count`, `square-count` | `combined-special-stat` |
| **G4. 구간/패턴** | 3/5/9/15분할, 색상, 모서리/삼각형 | `bucket_15`, `bucket_3`, `color`, `pattern_corner` | `bucket-15-count`, `color-count` | `bucket-stat`, `pattern-stat` |
| **G5. 전문 지표** | 끝수합, 동끝수, AC값, Span | `end_sum`, `same_end`, `ac`, `span` | `end-sum-value`, `ac-value` | `end-digit-stat` |

## 2. 가이드 전용 로직 (guide.js)
- **Top 3 추출**: 홀짝/고저 등 범주형 데이터는 상위 3개 항목만 퍼센트(%)와 함께 노출.
- **확률 합산**: 소수(2~3개), 제곱수(1~2개) 등 특정 구간 확률을 합산하여 텍스트 주입.
- **캐시 방지**: `fetch` 시 쿼리 스트링으로 타임스탬프(`?v=Date.now()`) 필수 사용.
