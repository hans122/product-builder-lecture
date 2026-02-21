import csv
import json
from collections import Counter

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def analyze():
    frequency = Counter()
    last_appearance = {}
    current_max_draw = 0
    
    odd_even_dist = Counter()
    consecutive_dist = Counter()
    prime_dist = Counter()
    composite_dist = Counter() # 합성수 추가
    multiple_3_dist = Counter() # 3배수 추가
    period_1_dist = Counter()
    sum_dist = []

    draws = []

    with open('lt645.csv', mode='r', encoding='utf-8') as file:
        reader = csv.reader(file)
        header = next(reader)
        col_indices = {name: i for i, name in enumerate(header)}
        
        for row in reader:
            if not row: continue
            draw_no = int(row[col_indices['회차']])
            nums = sorted([int(row[col_indices[f'당첨번호{i}']]) for i in range(1, 7)])
            draws.append({'no': draw_no, 'nums': set(nums)})

    draws.sort(key=lambda x: x['no'])

    prev_nums = None
    for draw in draws:
        draw_no = draw['no']
        nums_list = sorted(list(draw['nums']))
        nums_set = draw['nums']
        
        if draw_no > current_max_draw: current_max_draw = draw_no
        
        for n in nums_list:
            frequency[n] += 1
            last_appearance[n] = draw_no
        
        odds = len([n for n in nums_list if n % 2 != 0])
        odd_even_dist[f"{odds}:{6-odds}"] += 1
        
        consecutive = 0
        for i in range(len(nums_list)-1):
            if nums_list[i] + 1 == nums_list[i+1]: consecutive += 1
        consecutive_dist[consecutive] += 1
        
        primes = len([n for n in nums_list if is_prime(n)])
        prime_dist[primes] += 1

        # 합성수 계산 (1과 소수를 제외한 수)
        composites = len([n for n in nums_list if n > 1 and not is_prime(n)])
        composite_dist[composites] += 1
        
        # 3배수 계산
        m3s = len([n for n in nums_list if n % 3 == 0])
        multiple_3_dist[m3s] += 1
        
        sum_dist.append(sum(nums_list))

        if prev_nums is not None:
            common = len(nums_set.intersection(prev_nums))
            period_1_dist[common] += 1
        
        prev_nums = nums_set

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
            "composite": dict(composite_dist), # 합성수 데이터 포함
            "multiple_3": dict(multiple_3_dist), # 3배수 데이터 포함
            "period_1": dict(period_1_dist),
            "sum": dict(sum_range_dist)
        },
        "total_draws": current_max_draw,
        "last_draw_numbers": sorted(list(draws[-1]['nums']))
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"Success: Analyzed up to draw {current_max_draw}")

if __name__ == "__main__":
    analyze()
