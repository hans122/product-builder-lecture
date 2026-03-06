import csv
import json
import os
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

def analyze_lotto():
    draws = []
    if not os.path.exists('lt645.csv'): return
    
    with open('lt645.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row: continue
            nums = [int(x) for x in row[2:8]]
            draws.append({
                "no": int(row[0]),
                "date": row[1].strip("'"),
                "nums": sorted(nums)
            })

    draws.sort(key=lambda x: x['no'])
    
    raw_metrics = {
        "sum": [], "odd_count": [], "low_count": [], "period_1": [], "neighbor": [],
        "period_1_2": [], "period_1_3": [], "consecutive": [], "prime": [], "composite": [],
        "multiple_3": [], "multiple_5": [], "square": [], "double_num": [],
        "bucket_15": [], "bucket_9": [], "bucket_5": [], "bucket_3": [], "color": [],
        "pattern_corner": [], "pattern_triangle": [], "end_sum": [], "same_end": [], "ac": [], "span": [],
        "first_num": [], "last_num": [], "mean_gap": []
    }
    
    dist_keys = [
        "sum", "odd_even", "high_low", "period_1", "neighbor", "period_1_2", "period_1_3",
        "consecutive", "prime", "composite", "multiple_3", "multiple_5", "square", "double_num",
        "bucket_15", "bucket_9", "bucket_5", "bucket_3", "color", "pattern_corner", "pattern_triangle",
        "end_sum", "same_end", "ac", "span", "first_num", "last_num", "mean_gap"
    ]
    distributions = {k: Counter() for k in dist_keys}
    processed_data = []
    
    corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42]
    triangle = [4,10,11,12,16,17,18,19,20,24,25,26,32]

    for i, draw in enumerate(draws):
        nums_list = draw["nums"]
        prev_nums = set(draws[i-1]["nums"]) if i > 0 else set()
        prev_2 = (set(draws[i-1]["nums"]) | set(draws[i-2]["nums"])) if i > 1 else prev_nums
        prev_3 = (set(draws[i-1]["nums"]) | set(draws[i-2]["nums"]) | set(draws[i-3]["nums"])) if i > 2 else prev_2
        
        neighbors = set()
        for n in prev_nums:
            if n > 1: neighbors.add(n-1)
            if n < 45: neighbors.add(n+1)

        s = sum(nums_list)
        oc = len([n for n in nums_list if n % 2 != 0])
        lc = len([n for n in nums_list if n <= 22])
        p1 = len([n for n in nums_list if n in prev_nums])
        nb = len([n for n in nums_list if n in neighbors])
        p12 = len([n for n in nums_list if n in prev_2])
        p13 = len([n for n in nums_list if n in prev_3])
        cons = sum(1 for j in range(5) if nums_list[j]+1 == nums_list[j+1])
        prime = len([n for n in nums_list if is_prime(n)])
        comp = len([n for n in nums_list if is_composite(n)])
        m3 = len([n for n in nums_list if n % 3 == 0])
        m5 = len([n for n in nums_list if n % 5 == 0])
        sq = len([n for n in nums_list if n in [1,4,9,16,25,36]])
        db = len([n for n in nums_list if n in [11,22,33,44]])
        b15 = len(set((n-1)//15 for n in nums_list))
        b9 = len(set((n-1)//9 for n in nums_list))
        b5 = len(set((n-1)//5 for n in nums_list))
        b3 = len(set((n-1)//3 for n in nums_list))
        
        colors = set()
        for n in nums_list:
            if n <= 10: colors.add("Y")
            elif n <= 20: colors.add("B")
            elif n <= 30: colors.add("R")
            elif n <= 40: colors.add("G")
            else: colors.add("GR")
        
        p_corner = len([n for n in nums_list if n in corners])
        p_tri = len([n for n in nums_list if n in triangle])
        es = sum(n % 10 for n in nums_list)
        ends = [n % 10 for n in nums_list]
        se = max(Counter(ends).values())
        ac = calculate_ac(nums_list)
        span = nums_list[-1] - nums_list[0]
        f_num = nums_list[0]
        l_num = nums_list[-1]
        m_gap = round(span / 5, 1)

        metrics = {
            "sum": s, "odd_even": f"{oc}:{6-oc}", "high_low": f"{lc}:{6-lc}",
            "period_1": p1, "neighbor": nb, "period_1_2": p12, "period_1_3": p13,
            "consecutive": cons, "prime": prime, "composite": comp,
            "multiple_3": m3, "m5": m5, "square": sq, "double": db,
            "b15": b15, "b9": b9, "b5": b5, "b3": b3, "color": len(colors),
            "p_corner": p_corner, "p_tri": p_tri, "end_sum": es, "same_end": se,
            "ac": ac, "span": span,
            "first_num": f_num, "last_num": l_num, "mean_gap": m_gap
        }
        
        processed_data.append({"no": draw["no"], "date": draw["date"], "nums": nums_list, **metrics})
        
        for k, v in metrics.items():
            val_for_stat = oc if k == "odd_even" else (lc if k == "high_low" else v)
            dist_k = k
            if k in ["multiple_5", "m5"]: dist_k = "multiple_5"
            elif k == "double": dist_k = "double_num"
            elif k in ["b15", "b9", "b5", "b3"]: dist_k = f"bucket_{k[1:]}"
            elif k in ["p_corner", "p_tri"]: dist_k = "pattern_corner" if k == "p_corner" else "pattern_triangle"
            
            distributions[dist_k][v] += 1
            
            stat_k = k
            if k == "odd_even": stat_k = "odd_count"
            elif k == "high_low": stat_k = "low_count"
            elif k in ["multiple_5", "m5"]: stat_k = "multiple_5"
            elif k == "double": stat_k = "double_num"
            elif k in ["b15", "b9", "b5", "b3"]: stat_k = f"bucket_{k[1:]}"
            elif k in ["p_corner", "p_tri"]: stat_k = "pattern_corner" if k == "p_corner" else "pattern_triangle"
            
            if stat_k in raw_metrics: raw_metrics[stat_k].append(val_for_stat)

    stats_summary = {}
    for k, v_list in raw_metrics.items():
        if not v_list: continue
        mean = sum(v_list) / len(v_list)
        var = sum((x - mean) ** 2 for x in v_list) / len(v_list)
        stats_summary[k] = {"mean": round(mean, 2), "std": round(var ** 0.5, 2)}

    markov_ending = [[0]*10 for _ in range(10)]
    for i in range(len(draws) - 1):
        curr_ends = set([n % 10 for n in draws[i]["nums"]])
        next_ends = set([n % 10 for n in draws[i+1]["nums"]])
        for c in curr_ends:
            for n in next_ends: markov_ending[c][n] += 1

    result = {
        "total_draws": len(draws),
        "last_3_draws": [d["nums"] for d in draws[-3:][::-1]],
        "stats_summary": stats_summary,
        "distributions": {k: dict(sorted(v.items())) for k, v in distributions.items()},
        "frequency": dict(Counter([n for d in draws for n in d["nums"]])),
        "recent_20_frequency": dict(Counter([n for d in draws[-20:] for n in d["nums"]])),
        "markov_ending_matrix": markov_ending,
        "recent_draws": processed_data[::-1][:30]
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    with open('frequency.json', 'w', encoding='utf-8') as f:
        json.dump({str(k): v for k, v in result["frequency"].items()}, f, ensure_ascii=False, indent=4)
    
    print(f"Success: Lotto metrics updated up to draw {draws[-1]['no']}")

def analyze_pension():
    draws = []
    if not os.path.exists('pt720.csv'): return
    
    with open('pt720.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row: continue
            # 회차, 추첨일, 조, 당첨번호
            nums_str = str(row[3]).zfill(6)
            draws.append({
                "no": int(row[0]),
                "date": row[1],
                "group": int(row[2]),
                "nums": [int(d) for d in nums_str]
            })

    draws.sort(key=lambda x: x['no'])
    
    # 1. 자리수별 빈도 및 Gap
    pos_freq = [[0]*10 for _ in range(6)]
    digit_gap = [[0]*10 for _ in range(6)]
    markov = [[0]*10 for _ in range(10)]
    group_dist = Counter()
    
    for i, draw in enumerate(draws):
        nums = draw["nums"]
        group_dist[draw["group"]] += 1
        
        for p in range(6):
            val = nums[p]
            pos_freq[p][val] += 1
            # Gap 계산
            for n in range(10):
                if val == n: digit_gap[p][n] = 0
                else: digit_gap[p][n] += 1
        
        # 마르코프 전이 (자리별 흐름 통합)
        if i < len(draws) - 1:
            next_nums = draws[i+1]["nums"]
            for pos in range(6):
                markov[nums[pos]][next_nums[pos]] += 1

    result = {
        "total_draws": len(draws),
        "pos_freq": pos_freq,
        "digit_gap": digit_gap,
        "markov_matrix": markov,
        "group_dist": dict(sorted(group_dist.items())),
        "recent_draws": draws[::-1][:30]
    }

    with open('pension_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print(f"Success: Pension metrics updated up to draw {draws[-1]['no']}")

if __name__ == "__main__":
    analyze_lotto()
    analyze_pension()
