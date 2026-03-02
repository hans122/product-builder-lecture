# DATA_SCHEMA.md - Master Data Mapping (v4.0)

## 1. 지표 표준 매핑 테이블 (Master Mapping Table)
모든 개발(Python, JS, HTML)은 아래 표의 키값을 엄격히 준수한다.

| 분류 | 지표명 | distKey (JSON 분포) | statKey (JSON 요약) | drawKey (JSON 회차) | JS ID (Indicator ID) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[G1]** | 총합 | `sum` | `sum` | `sum` | `sum` |
| | 홀짝 비율 | `odd_even` | `odd_count` | `odd_even` | `odd-even` |
| | 고저 비율 | `high_low` | `low_count` | `high_low` | `high-low` |
| **[G2]** | 직전 1회차 매칭 | `period_1` | `period_1` | `period_1` | `period_1` |
| | 이웃수 | `neighbor` | `neighbor` | `neighbor` | `neighbor` |
| | 1~2회전 매칭 | `period_1_2` | `period_1_2` | `period_1_2` | `period_1_2` |
| | 1~3회전 매칭 | `period_1_3` | `period_1_3` | `period_1_3` | `period_1_3` |
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

## 2. 클라이언트 사이드 데이터 (LocalStorage)
- `combination_saved_picks`: 사용자가 직접 선택하거나 자동 생성한 번호 상태 백업.
- `lastGeneratedNumbers`: 모든 분석의 기준이 되는 가장 최근에 생성/선택된 6개 번호.

## 3. 통계 계산 유틸리티 규격
- **평균(mean)**: 전체 회차의 지표 합계 / 총 회차.
- **표준편차(std)**: 데이터의 산포도.
- **옵티멀 존**: mean ± 1σ (빗금 패턴).
- **세이프 존**: mean ± 2σ (파란색 배경).
- **위험 구간**: mean ± 2σ 초과 (라벨 회색).
