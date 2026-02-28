import csv
import json
from collections import Counter

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def calculate_ac(nums):
    diffs = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            diffs.add(abs(nums[i] - nums[j]))
    return len(diffs) - (len(nums) - 1)

def analyze():
    draws = []
    with open('lt645.csv', mode='r', encoding='utf-8') as file:
        reader = csv.reader(file)
        header = next(reader)
        col_indices = {name: i for i, name in enumerate(header)}
        for row in reader:
            if not row: continue
            draw_no = int(row[col_indices['회차']])
            nums = sorted([int(row[col_indices[f'당첨번호{i}']]) for i in range(1, 7)])
            draws.append({'no': draw_no, 'nums': nums, 'date': row[col_indices['추첨일']].strip("'")})

    draws.sort(key=lambda x: x['no'])
    
    frequency = Counter()
    distributions = {
        "odd_even": Counter(), "high_low": Counter(), "consecutive": Counter(),
        "prime": Counter(), "period_1": Counter(), "period_1_2": Counter(), "period_1_3": Counter(),
        "neighbor": Counter(), "sum": Counter(), "end_sum": Counter(), "same_end": Counter(),
        "square": Counter(), "multiple_5": Counter(), "double_num": Counter(),
        "bucket_3": Counter(), "bucket_5": Counter(), "bucket_9": Counter(), "bucket_15": Counter(),
        "color": Counter(), "pattern_corner": Counter(), "pattern_triangle": Counter(),
        "ac": Counter(), "span": Counter()
    }

    corners = {1, 2, 8, 9, 6, 7, 13, 14, 29, 30, 36, 37, 34, 35, 41, 42}
    triangle = {4, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 32}
    
    processed_data = []
    
    for i in range(len(draws)):
        draw = draws[i]
        nums_list = draw['nums']
        nums_set = set(nums_list)
        for n in nums_list: frequency[n] += 1
        
        # 기본 지표
        odds = len([n for n in nums_list if n % 2 != 0])
        oe_val = f"{odds}:{6-odds}"
        lows = len([n for n in nums_list if n <= 22])
        hl_val = f"{lows}:{6-lows}"
        
        consecutive = 0
        for j in range(len(nums_list)-1):
            if nums_list[j] + 1 == nums_list[j+1]: consecutive += 1
            
        total_sum = sum(nums_list)
        primes = len([n for n in nums_list if is_prime(n)])
        
        # --- [핵심] 이월 및 윈도우 기반 비교 (1~2, 1~3) ---
        p1_val = 0
        p1_2_val = 0
        p1_3_val = 0
        neighbor_val = 0
        
        if i >= 1:
            prev_1 = set(draws[i-1]['nums'])
            p1_val = len(nums_set.intersection(prev_1))
            distributions["period_1"][p1_val] += 1
            
            # 이웃수 (직전 회차 기준 ±1)
            neighbors = set()
            for n in prev_1:
                if n > 1: neighbors.add(n-1)
                if n < 45: neighbors.add(n+1)
            neighbor_val = len(nums_set.intersection(neighbors))
            
        if i >= 2:
            prev_1_2 = set(draws[i-1]['nums']).union(set(draws[i-2]['nums']))
            p1_2_val = len(nums_set.intersection(prev_1_2))
            distributions["period_1_2"][p1_2_val] += 1
            
        if i >= 3:
            prev_1_3 = set(draws[i-1]['nums']).union(set(draws[i-2]['nums'])).union(set(draws[i-3]['nums']))
            p1_3_val = len(nums_set.intersection(prev_1_3))
            distributions["period_1_3"][p1_3_val] += 1

        # 나머지 지표들
        end_digits = [n % 10 for n in nums_list]
        es_val = sum(end_digits)
        max_same_end = Counter(end_digits).most_common(1)[0][1]
        
        # 구간 및 색상
        b3 = len(set((n-1)//15 for n in nums_list))
        b5 = len(set((n-1)//9 for n in nums_list))
        b9 = len(set((n-1)//5 for n in nums_list))
        b15 = len(set((n-1)//3 for n in nums_list))
        
        colors = set()
        for n in nums_list:
            if n <= 10: colors.add('yellow')
            elif n <= 20: colors.add('blue')
            elif n <= 30: colors.add('red')
            elif n <= 40: colors.add('gray')
            else: colors.add('green')
        color_cnt = len(colors)
        
        p_corner = len([n for n in nums_list if n in corners])
        p_tri = len([n for n in nums_list if n in triangle])
        ac_val = calculate_ac(nums_list)
        span_val = nums_list[-1] - nums_list[0]

        # 분포 데이터 업데이트
        distributions["odd_even"][oe_val] += 1
        distributions["high_low"][hl_val] += 1
        distributions["consecutive"][consecutive] += 1
        distributions["prime"][primes] += 1
        distributions["neighbor"][neighbor_val] += 1
        distributions["same_end"][max_same_end] += 1
        distributions["bucket_3"][b3] += 1
        distributions["bucket_5"][b5] += 1
        distributions["bucket_9"][b9] += 1
        distributions["bucket_15"][b15] += 1
        distributions["color"][color_cnt] += 1
        distributions["pattern_corner"][p_corner] += 1
        distributions["pattern_triangle"][p_tri] += 1
        distributions["ac"][ac_val] += 1
        distributions["span"][span_val] += 1
        
        # 총합 범위
        if total_sum < 100: rk = "100 미만"
        elif total_sum < 120: rk = "100-119"
        elif total_sum < 140: rk = "120-139"
        elif total_sum < 160: rk = "140-159"
        elif total_sum < 180: rk = "160-179"
        elif total_sum < 200: rk = "180-199"
        else: rk = "200 이상"
        distributions["sum"][rk] += 1

        processed_data.append({
            "no": draw['no'], "date": draw['date'], "nums": nums_list, "sum": total_sum,
            "odd_even": oe_val, "high_low": hl_val, "consecutive": consecutive,
            "prime": primes, "period_1": p1_val, "period_1_2": p1_2_val, "period_1_3": p1_3_val,
            "neighbor": neighbor_val, "ac": ac_val, "span": span_val,
            "b3": b3, "b5": b5, "b9": b9, "b15": b15, "color": color_cnt,
            "p_corner": p_corner, "p_tri": p_tri, "end_sum": es_val, "same_end": max_same_end
        })

    recent_table = processed_data[::-1][:30]
    
    result = {
        "frequency": {str(k): v for k, v in frequency.items()},
        "distributions": {k: dict(v) for k, v in distributions.items()},
        "total_draws": len(draws),
        "last_3_draws": [d['nums'] for d in draws[-3:][::-1]], # 직전 3회차 번호 리스트
        "recent_draws": recent_table
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"Success: Updated stats with window-based carry-over (1~2, 1~3) up to draw {draws[-1]['no']}")

if __name__ == "__main__":
    analyze()
