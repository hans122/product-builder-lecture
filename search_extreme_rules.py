import csv

def find_extreme_appearance_rules():
    draws = []
    with open('lt645.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            draws.append(set([int(x) for x in row[2:8]]))
    
    total_rounds = len(draws)
    
    # 탐색할 조건 리스트 (기간, 최소 횟수)
    test_conditions = [
        (3, 3),   # 3회 중 3회 (연속 3주)
        (5, 4),   # 5회 중 4회
        (7, 5),   # 7회 중 5회
        (10, 6),  # 10회 중 6회
        (15, 7),  # 15회 중 7회
        (20, 8)   # 20회 중 8회
    ]

    print("--- 🔬 Extreme Over-appearance Grid Search ---")
    print(f"Dataset: 1 to {total_rounds} Rounds\n")
    print(f"{'Condition (Period, Hits)':<25} | {'Count':<10} | {'Probability':<12}")
    print("-" * 55)

    for period, threshold in test_conditions:
        cases = 0
        for i in range(total_rounds - period):
            window = draws[i:i+period]
            for num in range(1, 46):
                count = sum(1 for d in window if num in d)
                if count >= threshold:
                    cases += 1
        
        prob = (cases / total_rounds) * 100
        print(f"Last {period} draws, {threshold}+ hits | {cases:<10} | {prob:.4f}%")
    
    # 보너스 탐색: 최장 연속 출현 기록
    max_streak = 0
    for num in range(1, 46):
        current_streak = 0
        for d in draws:
            if num in d:
                current_streak += 1
                if current_streak > max_streak: max_streak = current_streak
            else:
                current_streak = 0
    
    print("-" * 55)
    print(f"🚀 역대 최장 연속 출현 기록: {max_streak}회 연속")
    print("----------------------------------------------")

if __name__ == "__main__":
    find_extreme_appearance_rules()
