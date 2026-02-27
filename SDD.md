# 소프트웨어 설계 정의서 (SDD)

## 1. 시스템 아키텍처 (System Architecture)
- **프론트엔드 중심 웹 애플리케이션:** 서버 사이드 로직 없이 클라이언트 브라우저에서 대부분의 로직(분석, 생성)을 처리하는 정적 웹 서비스 구조.
- **데이터 처리 파이프라인:** Python 스크립트(`analyze_data.py`)를 통해 원본 CSV 데이터를 분석하여 정적 JSON 파일로 변환하고, 이를 프론트엔드에서 로드하여 사용.

## 2. 기술 스택 (Tech Stack)
- **HTML5/CSS3:** 반응형 레이아웃 및 볼(Ball) 디자인, 시각적 효과 구현.
- **JavaScript (Vanilla JS):** 번호 생성, 실시간 분석 알고리즘, 데이터 페칭 및 렌더링.
- **Python:** 로또 당첨 내역 데이터(CSV) 전처리 및 통계 JSON 생성.
- **JSON:** 통계 데이터 및 빈도 분석 결과 저장소.
- **LocalStorage:** 최근 생성된 번호 및 사용자 설정 저장.

## 3. 데이터 모델 및 파일 구조 (Data Model & File Structure)
### 3.1. 핵심 데이터 파일
- `lt645.csv`: 역대 당첨 번호 원본 데이터.
- `advanced_stats.json`: 홀짝 분포, 고저 분포, 총합 등 사전 계산된 통계 지표.
- `frequency.json`: 1~45 각 번호의 전체 출현 빈도 데이터.
- `history.js/history.html`: 사용자가 생성한 번호 기록 관리.

### 3.2. 주요 JavaScript 모듈
- `main.js`: 메인 페이지의 번호 생성 및 실시간 분석 로직.
- `analysis.js`: 통계 데이터 시각화 및 차트/표 렌더링 로직.
- `combination.js`: 정밀 분석 및 필터링 시스템 로직.

## 4. 주요 알고리즘 (Core Algorithms)
### 4.1. AC값 (Arithmetic Complexity)
- **산식:** `diffs.size - (nums.length - 1)`
- **의미:** 번호 간 차이값의 다양성을 측정하여 번호가 얼마나 산술적으로 복잡하게 배열되었는지 확인 (보통 7 이상을 권장).

### 4.2. 패턴 매칭 (Visual Pattern)
- **모서리 패턴:** 45칸 그리드(7x7 유사 배열)에서 외곽 모서리에 위치한 번호들의 출현 개수 분석.
- **삼각형 패턴:** 그리드의 중앙과 특정 꼭짓점을 연결하는 삼각형 영역 내 번호 분포 분석.

### 4.3. 확률 최적화 필터 (Optimal Ranges)
- **총합(Sum):** 120 ~ 180 사이의 번호를 '최적(Optimal)'으로 판단.
- **홀짝/고저 비율:** 2:4, 3:3, 4:2 비율을 '최적(Optimal)'으로 판단.

## 5. UI/UX 설계 (UI/UX Design)
- **Ball Styling:** 번호 범위별 색상 구분 (1-10: 노랑, 11-20: 파랑, 21-30: 빨강, 31-40: 회색, 41-45: 초록).
- **Sticky Header:** 상단 네비게이션 고정으로 페이지 간 이동 편의성 제공.
- **Interactive Feedback:** 클릭 가능한 분석 항목을 통해 상세 통계 페이지로 연결.

## 6. 배포 및 업데이트 (Deployment & Updates)
- 정적 웹 호스팅(예: Firebase Hosting, Netlify, GitHub Pages)에 최적화.
- 당첨 번호 업데이트 시 `analyze_data.py` 실행 후 JSON 파일 최신화 및 배포.
