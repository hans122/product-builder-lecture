# 로또 번호 분석 및 추천 서비스 SDD (v1.3)

## 1. 데이터 파이프라인 개요
- **Python(`analyze_data.py`)**: `lt645.csv`를 순회하며 통계 연산 수행. 
    - 윈도우 기반 비교(`set union`) 로직 적용.
    - 구간 분할 매핑(`(n-1)//size`) 로직 적용.
- **JSON(`advanced_stats.json`)**: 전처리된 모든 통계의 원천 데이터 저장.
- **JavaScript**: `fetch` API를 통해 데이터를 로드하고 실시간 분석 및 DOM 렌더링 수행.

## 2. 핵심 알고리즘 설계
### 2.1. Window-based Carry-over Analysis
사용자의 설명에 따른 정확한 이월 범위 계산법:
- `Period 1`: 현재 번호 ∩ 직전 회차
- `Period 1~2`: 현재 번호 ∩ (직전 회차 ∪ 전전 회차)
- `Period 1~3`: 현재 번호 ∩ (직전 1+2+3회차 합집합)

### 2.2. 다중 구간 분할 (Bucket Mapping)
- `bucket_15` (3분할): `size=15` (1-15, 16-30, 31-45)
- `bucket_9` (5분할): `size=9` (1-9, 10-18, 19-27, 28-36, 37-45)
- `bucket_5` (9분할): `size=5` (1-5, ..., 41-45)
- `bucket_3` (15분할): `size=3` (1-3, ..., 43-45)

## 3. 화면별 구현 상세
- **메인화면**: `main.js`에서 생성된 번호를 `last_3_draws`와 대조하여 실시간 매칭 개수 및 등급(Optimal/Normal/Warning) 산출.
- **통계화면**: `analysis.js`에서 `renderDistChart`를 재사용하여 백분율(%)이 포함된 막대 차트 자동 생성.
- **히스토리**: `history.js`에서 각 회차별 실제 매칭 개수(윈도우 기반)를 숫자로 바인딩.
