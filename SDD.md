# 로또 번호 분석 및 추천 서비스 SDD (v1.2)

## 1. 데이터 파이프라인
- **Extraction**: Python `analyze_data.py`가 CSV를 읽어 분석.
- **Window Matching Logic**: 
    - `period_1`: `set(current) & set(draws[-1])`
    - `period_1_2`: `set(current) & (set(draws[-1]) | set(draws[-2]))`
    - `period_1_3`: `set(current) & (set(draws[-1]) | set(draws[-2]) | set(draws[-3]))`
- **Output**: `advanced_stats.json`

## 2. 주요 비즈니스 로직
### 2.1. 실시간 등급 판정 (Grading)
- `main.js`와 `combination.js`에서 각 지표별 `optimal` 점수 부여.
- 최종 점수 기반 A~D 등급 산출.

### 2.2. 통계 렌더링
- `renderDistChart` 함수를 일원화하여 모든 분포 차트 시각화.
- 확률(%) 계산 로직을 JS에 내장하여 차트 상단에 표시.

## 3. 화면별 데이터 활용
- **메인**: `last_3_draws[0]`을 사용하여 직전 당첨번호 시각화 및 실시간 윈도우 매칭 계산.
- **통계**: `distributions` 객체의 전 필드를 순회하며 차트 및 미니 테이블 생성.
- **정밀분석**: `statsData.last_3_draws`를 활용하여 사용자 선택 번호의 과거 회차 간 매칭률 분석.
