import requests
import csv
import os
import sys

# 프로젝트 루트 경로 설정 (가상 환경 대응)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'lt645.csv')

def update_latest_lotto():
    latest_draw_no = 0
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader) # skip header
                first_row = next(reader)
                latest_draw_no = int(first_row[0])
        except (StopIteration, ValueError, IndexError):
            print("⚠️ CSV 파일 형식이 비정상입니다.")
            return False
    
    target_draw_no = latest_draw_no + 1
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={target_draw_no}"
    
    print(f"🔍 {target_draw_no}회차 데이터 자동 수집 시작...")
    
    try:
        response = requests.get(url, timeout=20)
        if response.status_code != 200:
            print(f"⚠️ API 응답 오류: {response.status_code}")
            return False
            
        data = response.json()
        
        if data.get("returnValue") == "success" and int(data.get("drwNo", 0)) == target_draw_no:
            draw_date = data["drwNoDate"]
            nums = [data[f"drwtNo{i}"] for i in range(1, 7)]
            bonus = data["bnusNo"]
            
            with open(CSV_PATH, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_row = f"{target_draw_no},'{draw_date.replace('-', '.')}',{','.join(map(str, nums))},{bonus}\n"
            lines.insert(1, new_row) # 헤더 바로 아래 삽입
            
            with open(CSV_PATH, 'w', encoding='utf-8') as f:
                f.writelines(lines)
                
            print(f"✅ {target_draw_no}회 업데이트 성공! ({draw_date})")
            return True
        else:
            print(f"⏳ {target_draw_no}회 데이터 미등록 상태.")
            return False
            
    except Exception as e:
        print(f"⚠️ 시스템 오류 발생: {e}")
        return False

if __name__ == "__main__":
    if update_latest_lotto():
        print("📊 데이터 갱신 감지: 전체 통계 엔진 가동...")
        # 절대 경로로 스크립트 실행
        os.system(f'python3 {os.path.join(BASE_DIR, "analyze_data.py")}')
        os.system(f'python3 {os.path.join(BASE_DIR, "calculate_pareto_zones.py")}')
        print("🚀 [GitHub Actions] 데이터 및 통계 파일 갱신 완료!")
    else:
        print("📭 업데이트 없음. 프로세스를 종료합니다.")
        # GitHub Actions 결과 전달 (성공으로 처리하여 워크플로우는 정상 종료)
        sys.exit(0)
