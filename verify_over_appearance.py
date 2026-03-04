
import csv

def verify_over_appearance():
    draws = []
    with open('lt645.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            draws.append(set([int(x) for x in row[2:8]]))
    
    # 최신순 -> 과거순
    total_rounds = len(draws)
    cases_5_4 = 0 # 5회 중 4회 이상
    cases_10_6 = 0 # 10회 중 6회 이상
    
    # 슬라이딩 윈도우 검사
    for i in range(total_rounds - 10):
        # 1. 최근 5회차 검사
        window_5 = draws[i:i+5]
        # 2. 최근 10회차 검사
        window_10 = draws[i:i+10]
        
        for num in range(1, 46):
            # 5회 중 출현 횟수
            count_5 = sum(1 for d in window_5 if num in d)
            if count_5 >= 4:
                cases_5_4 += 1
                # print(f"[CASE 5-4] Num {num} at Draw {total_rounds-i}")
            
            # 10회 중 출현 횟수
            count_10 = sum(1 for d in window_10 if num in d)
            if count_10 >= 6:
                cases_10_6 += 1

    print("--- 🛡️ Over-appearance Suppression Analysis ---")
    print(f"Total Rounds Checked: {total_rounds}")
    print(f"[Rule 1] 5회 중 4회 이상 출현 사례: {cases_5_4}회 (확률: {cases_5_4/total_rounds*100:.4f}%)")
    print(f"[Rule 2] 10회 중 6회 이상 출현 사례: {cases_10_6}회 (확률: {cases_10_6/total_rounds*100:.4f}%)")
    print("----------------------------------------------")

if __name__ == "__main__":
    verify_over_appearance()
