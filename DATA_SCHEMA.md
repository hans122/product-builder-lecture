# DATA_SCHEMA.md - Variable & Data Structures (v1.5)

이 문서는 통계 항목의 **5대 표준 분류**와 데이터 키 매핑을 정의합니다.

## 1. 표준 분류 체계 (Categorization)
모든 화면은 아래 순서와 그룹명을 준수한다.

### G1. 기본 균형 (Basic Balance)
- `sum`, `odd_even`, `high_low`

### G2. 회차 상관관계 (Correlation)
- `period_1` (직전 1회차), `period_1_2` (1~2회전), `period_1_3` (1~3회전), `neighbor`, `consecutive`

### G3. 특수 번호군 (Special Numbers)
- `prime`, `composite`, `multiple_3`, `multiple_5`, `square`, `double_num`

### G4. 구간 및 패턴 (Sections & Patterns)
- `bucket_15` (3분할), `bucket_9` (5분할), `bucket_5` (9분할), `bucket_3` (15분할), `color`, `pattern_corner`, `pattern_triangle`

### G5. 끝수 및 전문지표 (Advanced Metrics)
- `end_sum`, `same_end`, `ac`, `span`

## 2. JSON Root 구조
- `frequency`: 번호별 빈도
- `distributions`: 위 5대 그룹 데이터 (Object)
- `last_3_draws`: 최근 3회차 번호 (Array)
- `recent_draws`: 히스토리용 상세 데이터 (Array)
