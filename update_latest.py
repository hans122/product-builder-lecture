import requests
import csv
import os
import time

def update_latest_lotto():
    # 1. lt645.csv에서 현재 마지막 회차 확인
    latest_draw_no = 0
    if os.path.exists('lt645.csv'):
        with open('lt645.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            first_row = next(reader)
            latest_draw_no = int(first_row[0])
    
    target_draw_no = latest_draw_no + 1
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={target_draw_no}"
    
    print(f"🔍 {target_draw_no}회차 데이터 업데이트 확인 중...")
    
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            print(f"⚠️ API 서버 응답 오류 (Status: {response.status_code})")
            return False
            
        data = response.json()
        
        # 2. API 데이터 준비 여부 확인
        if data.get("returnValue") == "success":
            draw_date = data["drwNoDate"]
            nums = [data[f"drwtNo{i}"] for i in range(1, 7)]
            bonus = data["bnusNo"]
            
            # 3. 데이터 중복 추가 방지 (안전 장치)
            if int(data["drwNo"]) <= latest_draw_no:
                print(f"ℹ️ {latest_draw_no}회차는 이미 최신 상태입니다.")
                return False

            # 4. lt645.csv 상단에 새 회차 삽입
            with open('lt645.csv', 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # 새 데이터 행 생성 (v4.3 규격 준수)
            new_row = f"{target_draw_no},'{draw_date.replace('-', '.')}',{','.join(map(str, nums))},{bonus}\n"
            lines.insert(1, new_row)
            
            with open('lt645.csv', 'w', encoding='utf-8') as f:
                f.writelines(lines)
                
            print(f"✅ {target_draw_no}회 업데이트 성공! ({draw_date})")
            return True
        else:
            # 추첨 전이거나 데이터 생성 중인 경우
            print(f"⏳ {target_draw_no}회 데이터가 아직 API에 등록되지 않았습니다. (추첨 지연 또는 데이터 생성 중)")
            return False
            
    except Exception as e:
        print(f"⚠️ 네트워크 또는 스크립트 오류: {e}")
        return False

if __name__ == "__main__":
    # 실행 시도
    success = update_latest_lotto()
    
    if success:
        # 데이터 업데이트가 성공했을 때만 후속 분석 프로세스 가동
        print("📊 데이터 갱신 감지: 전체 통계 재분석을 시작합니다...")
        os.system('python3 analyze_data.py')
        os.system('python3 calculate_pareto_zones.py')
        print("🚀 모든 분석 데이터 동기화 완료!")
    else:
        print("📭 업데이트 사항이 없습니다. 분석을 건너뜁니다.")
