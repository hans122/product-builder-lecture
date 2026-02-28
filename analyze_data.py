import csv
import json
from collections import Counter

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def is_composite(n):
    return n > 1 and not is_prime(n)

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
        "prime": Counter(), "composite": Counter(), "multiple_3": Counter(),
        "period_1": Counter(), "period_1_2": Counter(), "period_1_3": Counter(),
        "neighbor": Counter(), "sum": Counter(), "end_sum": Counter(), "same_end": Counter(),
        "square": Counter(), "multiple_5": Counter(), "double_num": Counter(),
        "bucket_15": Counter(), "bucket_9": Counter(), "bucket_5": Counter(), "bucket_3": Counter(),
        "color": Counter(), "pattern_corner": Counter(), "pattern_triangle": Counter(),
        "ac": Counter(), "span": Counter()
    }

    # 통계 요약을 위해 모든 지표의 원본 리스트를 관리
    raw_metrics = {k: [] for k in distributions.keys()}
    # 홀짝/고저는 별도 숫자 리스트로 관리
    raw_metrics["odd_count"] = []
    raw_metrics["low_count"] = []

    corners = {1, 2, 8, 9, 6, 7, 13, 14, 29, 30, 36, 37, 34, 35, 41, 42}
    triangle = {4, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 32}
    
    processed_data = []
    
    for i in range(len(draws)):
        draw = draws[i]
        nums_list = draw['nums']
        nums_set = set(nums_list)
        for n in nums_list: frequency[n] += 1
        
        # 지표 계산
        odds = len([n for n in nums_list if n % 2 != 0])
        raw_metrics["odd_count"].append(odds)
        lows = len([n for n in nums_list if n <= 22])
        raw_metrics["low_count"].append(lows)
        
        consecutive = 0
        for j in range(len(nums_list)-1):
            if nums_list[j] + 1 == nums_list[j+1]: consecutive += 1
        raw_metrics["consecutive"].append(consecutive)
            
        total_sum = sum(nums_list)
        raw_metrics["sum"].append(total_sum)
        
        primes = len([n for n in nums_list if is_prime(n)])
        raw_metrics["prime"].append(primes)
        
        composites = len([n for n in nums_list if is_composite(n)])
        raw_metrics["composite"].append(composites)
        
        m3s = len([n for n in nums_list if n % 3 == 0])
        raw_metrics["multiple_3"].append(m3s)
        
        p1_val = 0
        neighbor_val = 0
        if i >= 1:
            prev_1 = set(draws[i-1]['nums'])
            p1_val = len(nums_set.intersection(prev_1))
            neighbors = set()
            for n in prev_1:
                if n > 1: neighbors.add(n-1)
                if n < 45: neighbors.add(n+1)
            neighbor_val = len(nums_set.intersection(neighbors))
        raw_metrics["period_1"].append(p1_val)
        raw_metrics["neighbor"].append(neighbor_val)

        p1_2_val = len(nums_set.intersection(set(draws[max(0, i-1)]['nums']).union(set(draws[max(0, i-2)]['nums'])))) if i >= 2 else 0
        p1_3_val = len(nums_set.intersection(set(draws[max(0, i-1)]['nums']).union(set(draws[max(0, i-2)]['nums'])).union(set(draws[max(0, i-3)]['nums'])))) if i >= 3 else 0
        raw_metrics["period_1_2"].append(p1_2_val)
        raw_metrics["period_1_3"].append(p1_3_val)

        end_digits = [n % 10 for n in nums_list]
        es_val = sum(end_digits)
        raw_metrics["end_sum"].append(es_val)
        
        max_same_end = Counter(end_digits).most_common(1)[0][1]
        raw_metrics["same_end"].append(max_same_end)
        
        square_cnt = len([n for n in nums_list if n in [1,4,9,16,25,36]])
        raw_metrics["square"].append(square_cnt)
        
        m5_cnt = len([n for n in nums_list if n % 5 == 0])
        raw_metrics["multiple_5"].append(m5_cnt)
        
        double_cnt = len([n for n in nums_list if n in [11,22,33,44]])
        raw_metrics["double_num"].append(double_cnt)
        
        b15 = len(set((n-1)//15 for n in nums_list))
        b9 = len(set((n-1)//9 for n in nums_list))
        b5 = len(set((n-1)//5 for n in nums_list))
        b3 = len(set((n-1)//3 for n in nums_list))
        raw_metrics["bucket_15"].append(b15)
        raw_metrics["bucket_9"].append(b9)
        raw_metrics["bucket_5"].append(b5)
        raw_metrics["bucket_3"].append(b3)
        
        colors = set()
        for n in nums_list:
            if n <= 10: colors.add('yellow')
            elif n <= 20: colors.add('blue')
            elif n <= 30: colors.add('red')
            elif n <= 40: colors.add('gray')
            else: colors.add('green')
        color_cnt = len(colors)
        raw_metrics["color"].append(color_cnt)
        
        p_corner = len([n for n in nums_list if n in corners])
        p_tri = len([n for n in nums_list if n in triangle])
        raw_metrics["pattern_corner"].append(p_corner)
        raw_metrics["pattern_triangle"].append(p_tri)
        
        ac_val = calculate_ac(nums_list)
        raw_metrics["ac"].append(ac_val)
        
        span_val = nums_list[-1] - nums_list[0]
        raw_metrics["span"].append(span_val)

        # Counter 분포 업데이트
        distributions["odd_even"][f"{odds}:{6-odds}"] += 1
        distributions["high_low"][f"{lows}:{6-lows}"] += 1
        distributions["consecutive"][consecutive] += 1
        distributions["prime"][primes] += 1
        distributions["composite"][composites] += 1
        distributions["multiple_3"][m3s] += 1
        distributions["neighbor"][neighbor_val] += 1
        distributions["period_1"][p1_val] += 1
        distributions["period_1_2"][p1_2_val] += 1
        distributions["period_1_3"][p1_3_val] += 1
        distributions["same_end"][max_same_end] += 1
        distributions["square"][square_cnt] += 1
        distributions["multiple_5"][m5_cnt] += 1
        distributions["double_num"][double_cnt] += 1
        distributions["bucket_15"][b15] += 1
        distributions["bucket_9"][b9] += 1
        distributions["bucket_5"][b5] += 1
        distributions["bucket_3"][b3] += 1
        distributions["color"][color_cnt] += 1
        distributions["pattern_corner"][p_corner] += 1
        distributions["pattern_triangle"][p_tri] += 1
        distributions["ac"][ac_val] += 1
        distributions["span"][span_val] += 1
        distributions["end_sum"][es_val] += 1
        
        # 총합 범위
        rk = "200 이상"
        if total_sum < 100: rk = "100 미만"
        elif total_sum < 120: rk = "100-119"
        elif total_sum < 140: rk = "120-139"
        elif total_sum < 160: rk = "140-159"
        elif total_sum < 180: rk = "160-179"
        elif total_sum < 200: rk = "180-199"
        distributions["sum"][rk] += 1

        processed_data.append({
            "no": draw['no'], "date": draw['date'], "nums": nums_list, "sum": total_sum,
            "odd_even": f"{odds}:{6-odds}", "high_low": f"{lows}:{6-lows}", "consecutive": consecutive,
            "prime": primes, "composite": composites, "multiple_3": m3s,
            "period_1": p1_val, "period_1_2": p1_2_val, "period_1_3": p1_3_val,
            "neighbor": neighbor_val, "ac": ac_val, "span": span_val,
            "b15": b15, "b9": b9, "b5": b5, "b3": b3, "color": color_cnt,
            "p_corner": p_corner, "p_tri": p_tri, "end_sum": es_val, "same_end": max_same_end,
            "square": square_cnt, "m5": m5_cnt, "double": double_cnt
        })

    def get_stats(values):
        if not values: return {"mean": 0, "std": 0}
        n = len(values)
        mean = sum(values) / n
        variance = sum((x - mean) ** 2 for x in values) / n
        return {"mean": round(mean, 2), "std": round(variance ** 0.5, 2)}

    # 모든 지표에 대한 요약 생성
    stats_summary = {k: get_stats(v) for k, v in raw_metrics.items()}

    recent_20_freq = Counter()
    for d in draws[-20:]:
        for n in d['nums']: recent_20_freq[n] += 1

    result = {
        "frequency": {str(k): v for k, v in frequency.items()},
        "recent_20_frequency": {str(k): v for k, v in recent_20_freq.items()},
        "distributions": {k: dict(v) for k, v in distributions.items()},
        "stats_summary": stats_summary,
        "total_draws": len(draws),
        "last_3_draws": [d['nums'] for d in draws[-3:][::-1]],
        "recent_draws": processed_data[::-1][:30]
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"Success: Full metrics with SD up to draw {draws[-1]['no']}")

if __name__ == "__main__":
    analyze()
