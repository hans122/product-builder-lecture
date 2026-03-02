# DATA_SCHEMA.md - Master Data Mapping (v4.3)

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

## 2. 시각화 정책 (Visualization Policy v4.3)
- **수치 계산**: 모든 통계 지점은 `Math.round()` 반올림을 표준으로 삼는다.
- **6대 통계 지점**: [최소, 미니 세이프, 미니 옵티멀, 맥스 옵티멀, 맥스 세이프, 최대]를 추적한다. (평균은 배지/라벨에서 제외)
- **상단 배지**: 값(Value)만 표시하며, 등급별 색상을 적용한다 (글자 라벨 생략).
- **하단 라벨**: 배지와 1:1 동기화된 [값 + 단위]를 표시하며 색상을 일치시킨다.
- **우선순위 로직**: 지점이 겹칠 경우 `옵티멀(초록) > 세이프(파랑) > 일반(회색)` 순으로 색상을 결정한다.

## 3. 클라이언트 사이드 데이터 (LocalStorage)
- `combination_saved_picks`: 사용자의 번호 선택 상태 백업.
- `lastGeneratedNumbers`: 분석 기준이 되는 가장 최근 번호 세트.
