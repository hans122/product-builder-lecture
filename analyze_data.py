import csv
import json
from collections import Counter, defaultdict

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def analyze():
    frequency = Counter()
    last_appearance = {}
    current_max_draw = 0
    
    # 역대 분포 데이터
    odd_even_dist = Counter()
    consecutive_dist = Counter()
    prime_dist = Counter()
    sum_dist = [] # 총합은 숫자가 다양하므로 리스트로 수집

    with open('lt645.csv', mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        
        for row in rows:
            draw_no = int(row['No'].replace(',', ''))
            if draw_no > current_max_draw: current_max_draw = draw_no
            
            nums = sorted([int(row[f'당첨번호{i}']) for i in range(1, 7)])
            
            # 빈도 및 마지막 출현
            for n in nums:
                frequency[n] += 1
                if n not in last_appearance: last_appearance[n] = draw_no
            
            # 홀짝 분포
            odds = len([n for n in nums if n % 2 != 0])
            odd_even_dist[f"{odds}:{6-odds}"] += 1
            
            # 연속번호 분포
            consecutive = 0
            for i in range(len(nums)-1):
                if nums[i] + 1 == nums[i+1]: consecutive += 1
            consecutive_dist[consecutive] += 1
            
            # 소수 분포
            primes = len([n for n in nums if is_prime(n)])
            prime_dist[primes] += 1
            
            # 총합
            sum_dist.append(sum(nums))

    # 총합 범위별 분포 (예: 100-110, 110-120 ...)
    sum_range_dist = Counter()
    for s in sum_dist:
        range_key = (s // 10) * 10
        sum_range_dist[f"{range_key}-{range_key+9}"] += 1

    result = {
        "frequency": {str(i): frequency.get(i, 0) for i in range(1, 46)},
        "unappeared_period": {str(i): current_max_draw - last_appearance.get(i, 0) for i in range(1, 46)},
        "distributions": {
            "odd_even": dict(odd_even_dist),
            "consecutive": dict(consecutive_dist),
            "prime": dict(prime_dist),
            "sum": dict(sum_range_dist)
        },
        "total_draws": current_max_draw
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print("Advanced stats with distributions generated!")

if __name__ == "__main__":
    analyze()
