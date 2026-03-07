# DATA_SCHEMA.md - Master Data & System Architecture (v22.21)

## 1. 시스템 아키텍처 (Modular Engine)
본 프로젝트는 도메인별 관심사 분리(SoC)를 위해 모듈화된 엔진 구조를 따른다. 모든 지표 및 로직은 **GL(Lotto)** 및 **GP(Pension)** 접두사를 통해 엄격히 구분된다.

### 시스템 레이어 구성
- **Core (core.js)**: 공통 데이터 인프라 및 유틸리티.
- **UI (ui_components.js)**: 컴포넌트 렌더링 및 시각화 엔진.
- **Pension Logic (pension_utils.js)**: 연금복권 특화 분석 알고리즘.
- **Prediction (prediction.js)**: AI 예측 및 백테스트 알고리즘.

## 2. 로또 지표 표준 매핑 테이블 (Lotto Master Mapping)
| 분류 | 지표명 | distKey | statKey | drawKey | JS ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[GL0]** | 복잡도 패턴 | - | - | - | `SYNERGY_RULES` |
| **[GL1]** | 총합 | `sum` | `sum` | `sum` | `sum` |
| | 홀짝/고저 | `odd_even` | `odd_count` | `oe` | `odd-even` |
| **[GL2]** | 상관관계 | `period_1` | `neighbor` | `p1` | `period_1` |
| **[GL3]** | 수적 속성 | `prime` | `composite` | `p/c` | `prime` |
| **[GL4]** | 공간 배치 | `bucket_15` | `color` | `b15` | `bucket-15` |
| **[GL5]** | 정밀 통계 | `end_sum` | `ac` | `esum` | `end-sum` |
| **[GL6]** | 심층 지표 | `mean_gap` | `regression` | `gap` | `mean-gap` |

## 3. 연금복권 지표 매핑 (Pension Master Mapping)
| 분류 | 지표명 | 설명 | 데이터 키 | JS ID |
| :--- | :--- | :--- | :--- | :--- |
| **[GP1]** | 연속성 | 6자리 내 연속 번호 유무 | `sequence` | `sequence` |
| **[GP2]** | 중복성 | 직전 회차 또는 내부 중복 | `repeat` | `repeat` |
| **[GP4]** | 합계/균형 | 6자리 숫자 합계(Golden Zone) | `sum` | `sum` |
| **[GP5]** | 상관관계 | 자리수 이월 및 이웃수 | `dynamics` | `carry-pos` |
| **[GP14]** | 마르코프 | 숫자 간 전이 확률 행렬 | `markov` | `markov-heatmap` |

## 4. 시각화 및 UI 가이드라인 (v22.21)
- **Grid Standard**: 예측 풀 10열 그리드, 히스토리 40px 열 너비 준수.
- **Table Dimension**: 회차(55px) / 번호(230px) / 결과(80px) 고정 및 중앙 정렬.
- **SVG Axis**: X축 라벨 2단 구성 (수치 / %). y좌표: 수치(182), %(195).
- **Skeleton**: `pulse` 애니메이션 (1.5s infinite) 적용.

## 5. JSON 데이터 구조 (advanced_stats.json / pension_stats.json)
- **stats_summary**: 각 지표별 `mean`, `std`, `min`, `max` 포함 (Z-Score 계산용).
- **recent_draws**: 최근 100회차 이상의 상세 당첨 정보 (no, nums, group 등).
- **distribution**: 각 지표별 역대 출현 빈도 분포 데이터 (Curve Chart용).
- **regression_scores**: 번호별 회차 간 에너지 및 출현 임박도 점수.
