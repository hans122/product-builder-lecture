# DATA_SCHEMA.md - Variable & Data Structures (v1.7)

## 1. 표준 분류 및 내비게이션 매핑
모든 UI 항목은 클릭 시 `analysis.html`의 해당 섹션으로 이동한다.

| 그룹 | 항목 | JSON Key | Target Anchor ID |
|:--- |:--- |:--- |:--- |
| **G1** | 총합, 홀짝, 고저 | `sum`, `odd_even`, `high_low` | `sum-section`, `odd-even-section`, `high-low-section` |
| **G2** | 이월, 1~2, 1~3, 이웃, 연번 | `period_1`, `period_1_2`, `period_1_3`, `neighbor`, `consecutive` | `period-1-section`, `period-window-section`, `period-window-3-section`, `neighbor-section`, `consecutive-section` |
| **G3** | 소수, 합성, 배수, 제곱, 쌍수 | `prime`, `composite`, `multiple_3`, `multiple_5`, `square`, `double` | `prime-section`, `composite-section`, `multiple-3-section`, `multiple-5-section`, `square-section`, `double-section` |
| **G4** | 3/5/15분할, 색상, 모서리, 삼각형 | `bucket_15`, `bucket_9`, `bucket_3`, `color`, `p_corner`, `p_tri` | `bucket-15-section`, `bucket-9-section`, `bucket-3-section`, `color-section`, `pattern-corner-section`, `pattern-triangle-section` |
| **G5** | 끝수합, 동끝수, AC, Span | `end_sum`, `same_end`, `ac`, `span` | `end-sum-section`, `same-end-section`, `ac-section`, `span-section` |

---

# 로또 번호 분석 및 추천 서비스 SDD (v1.7)

## 1. 내비게이션 아키텍처
- **Anchor-based Routing**: 메인 화면의 실시간 분석 카드는 `<a>` 태그로 래핑되어 있으며, 통계 화면(`analysis.html`)의 해당 섹션 ID로 다이렉트 링크됨.
- **Unified ID Policy**: `index.html`의 링크 ID와 `analysis.html`의 섹션 ID를 100% 동기화하여 유지보수성 확보.
