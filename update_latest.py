import requests
import csv
import os
from datetime import datetime

def update_latest_lotto():
    # 1. lt645.csv에서 마지막 회차 확인
    latest_draw_no = 0
    if os.path.exists('lt645.csv'):
        with open('lt645.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader) # skip header
            latest_draw_no = int(next(reader)[0])
    
    target_draw_no = latest_draw_no + 1
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={target_draw_no}"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if data.get("returnValue") == "success":
            draw_date = data["drwNoDate"]
            nums = [data[f"drwtNo{i}"] for i in range(1, 7)]
            bonus = data["bnusNo"]
            
            # 2. lt645.csv 상단에 추가 (임시 파일 생성 후 병합)
            with open('lt645.csv', 'r', encoding='utf-8') as f:
                content = f.readlines()
            
            new_row = f"{target_draw_no},'{draw_date.replace('-', '.')}',{','.join(map(str, nums))},{bonus}
"
            content.insert(1, new_row)
            
            with open('lt645.csv', 'w', encoding='utf-8') as f:
                f.writelines(content)
                
            print(f"✅ {target_draw_no}회 업데이트 성공: {nums} + {bonus}")
            return True
        else:
            print(f"❌ {target_draw_no}회 데이터가 아직 없습니다.")
            return False
            
    except Exception as e:
        print(f"⚠️ 업데이트 중 오류 발생: {e}")
        return False

if __name__ == "__main__":
    if update_latest_lotto():
        # 데이터 업데이트 성공 시 통계 분석 스크립트 실행
        os.system('python3 analyze_data.py')
        os.system('python3 calculate_pareto_zones.py')
