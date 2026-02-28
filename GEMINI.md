# GEMINI.md - Project Context & Rules

## 1. Project Identity
- **Name**: 로또 번호 분석 및 추천 시스템 (ProductBuilder-Wook1)
- **Type**: Data-Driven Static Web Application
- **Core Value**: 역대 당첨 데이터(`lt645.csv`)를 Python으로 전처리하여, JS 기반의 웹 프론트엔드에서 심도 있는 통계와 추천을 제공.

## 2. Technical Stack & Constraints
- **Backend**: 없음 (Serverless). Python 스크립트가 빌드 타임에 JSON 데이터를 생성.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+). Framework 사용 금지.
- **Data Pipeline**: `analyze_data.py` -> `advanced_stats.json` -> Frontend (`fetch`).
- **Persistence**: `LocalStorage`를 사용하여 최근 생성 번호 유지.

## 3. Core Business Logic (DO NOT HALLUCINATE)
### 3.1. Carry-over (이월) Definitions **[CRITICAL]**
단순 누적 확률이 아닌, **Time-Window 매칭** 방식을 사용한다.
- **이월 (Period 1)**: `Current Draw` ∩ `Last 1 Draw` (Count)
- **1~2회전 (Period 1~2)**: `Current Draw` ∩ (`Last 1` ∪ `Last 2`) (Count)
- **1~3회전 (Period 1~3)**: `Current Draw` ∩ (`Last 1` ∪ `Last 2` ∪ `Last 3`) (Count)
- **Visualization**: 차트에서는 횟수와 확률(%)을 병기하고, 표에서는 실제 매칭 개수(Integer)를 표시.

### 3.2. Bucket Analysis (구간 분할)
- **3-Division**: 1-15, 16-30, 31-45 (15 numbers each)
- **5-Division**: 1-9, 10-18, ... (9 numbers each)
- **9-Division**: 1-5, 6-10, ... (5 numbers each)
- **15-Division**: 1-3, 4-6, ... (3 numbers each)

### 3.3. Color Mapping
- **Yellow**: 1-10
- **Blue**: 11-20
- **Red**: 21-30
- **Gray**: 31-40
- **Green**: 41-45

## 4. File Structure & Responsibilities
- `analyze_data.py`: **Single Source of Truth** for statistics. Must generate `period_1_2`, `period_1_3`, `composite`, `square`, `multiple_5`, `double_num` keys.
- `advanced_stats.json`: Uses `last_3_draws` (Array of Arrays) for past context.
- `main.js`: Main dashboard logic. Uses `statsData.last_3_draws[0]` for P1 matching.
- `combination.js`: Detailed grading. Must handle window matching (1~3 draws) for scoring.

## 5. Coding Conventions
- **Styling**: `style.css` is the only styling source. Use Flexbox/Grid. Keep it responsive (Mobile-first).
- **Chart Rendering**: Use `renderDistChart` in `analysis.js`. Always separate data processing from rendering.
- **Safety**: Never expose keys. Never use external CDNs for logic (except Google Fonts/AdSense as configured).
