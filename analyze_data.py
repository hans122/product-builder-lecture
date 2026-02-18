import csv
import json
from collections import Counter, defaultdict

def analyze():
    numbers_list = []
    frequency = Counter()
    # 궁합수 계산을 위한 딕셔너리 (key: 숫자, value: Counter)
    companion_numbers = defaultdict(Counter)
    
    # 마지막 출현 회차 기록 (미출현 기간 계산용)
    last_appearance = {}
    current_max_draw = 0

    with open('lt645.csv', mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        
        # 최신 회차부터 순회 (No 기준 내림차순 가정)
        for row in rows:
            draw_no_str = row['No'].replace(',', '')
            draw_no = int(draw_no_str)
            if draw_no > current_max_draw:
                current_max_draw = draw_no
            
            draw_numbers = []
            for i in range(1, 7):
                num = int(row[f'당첨번호{i}'])
                draw_numbers.append(num)
                frequency[num] += 1
                
                if num not in last_appearance:
                    last_appearance[num] = draw_no

            # 궁합수 계산: 같은 회차에 나온 숫자들끼리 매칭
            for i in range(len(draw_numbers)):
                for j in range(len(draw_numbers)):
                    if i != j:
                        companion_numbers[draw_numbers[i]][draw_numbers[j]] += 1

    # 미출현 기간 계산 (현재 최신 회차 - 마지막 출현 회차)
    unappeared_period = {str(i): current_max_draw - last_appearance.get(i, 0) for i in range(1, 46)}

    # 상위 궁합수 정리 (각 숫자별 가장 많이 같이 나온 숫자 3개씩)
    compatibility = {}
    for num, companions in companion_numbers.items():
        top_companions = [str(c[0]) for c in companions.most_common(3)]
        compatibility[str(num)] = top_companions

    result = {
        "frequency": {str(i): frequency.get(i, 0) for i in range(1, 46)},
        "unappeared_period": unappeared_period,
        "compatibility": compatibility,
        "total_draws": current_max_draw
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print("Advanced stats generated!")

if __name__ == "__main__":
    analyze()
