
import requests
import csv
import os
import time
from datetime import datetime

def get_pension_data(draw_no, retry_count=3):
    """동행복권 API를 통해 연금복권 데이터를 가져옵니다. 지연 시 재시도를 수행합니다."""
    url = f"https://www.dhlottery.co.kr/common.do?method=get720Number&drwNo={draw_no}"
    
    for attempt in range(retry_count):
        try:
            response = requests.get(url, timeout=15)
            data = response.json()
            
            if data.get('returnValue') == 'success':
                # 데이터 유효성 검사 (조: 1-5, 번호: 6자리)
                group = data.get('p720PrwinNo')
                nums = [data.get(f'drwtNo{i}') for i in range(1, 7)]
                
                if group and all(n is not None for n in nums):
                    date = data['drwNoDate']
                    return {
                        'drawNo': draw_no,
                        'date': date.replace('-', '.'),
                        'group': group,
                        'nums': "".join(map(str, nums))
                    }
            
            print(f"Draw {draw_no} not ready yet. Attempt {attempt + 1}/{retry_count}")
            if attempt < retry_count - 1:
                time.sleep(10) # 10초 대기 후 재시도
                
        except Exception as e:
            print(f"Error fetching draw {draw_no}: {e}")
            time.sleep(5)
            
    return None

def update_pension_csv():
    file_path = 'pt720.csv'
    
    # 1. 기존 데이터 읽기
    existing_draws = set()
    rows = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            try:
                header = next(reader)
                for row in reader:
                    if row:
                        existing_draws.add(int(row[0]))
                        rows.append(row)
            except StopIteration: pass
    
    last_draw = max(existing_draws) if existing_draws else 0
    next_draw = last_draw + 1
    
    print(f"[{datetime.now()}] Current last draw: {last_draw}. Checking for next draws...")

    # 2. 새로운 데이터 수집 (지연 대응 포함)
    new_rows = []
    while True:
        data = get_pension_data(next_draw)
        if data:
            print(f"Successfully fetched new draw: {next_draw}")
            new_rows.append([data['drawNo'], data['date'], data['group'], data['nums']])
            next_draw += 1
        else:
            # 목요일 저녁인데 데이터가 안 나오는 경우에 대한 로그
            if datetime.now().weekday() == 3 and datetime.now().hour >= 19:
                print(f"Warning: Draw {next_draw} is expected but not yet available on API.")
            break
    
    if not new_rows:
        print("No new updates to apply.")
        return

    # 3. 파일 쓰기 (최신순 유지)
    all_rows = new_rows[::-1] + rows
    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['drawNo', 'date', 'group', 'nums'])
        writer.writerows(all_rows)
    
    print(f"Final Report: {len(new_rows)} new draws added. Last draw is now {next_draw - 1}")

if __name__ == "__main__":
    update_pension_csv()
