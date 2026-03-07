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
        reader = csv.reader(f); next(reader)
        for row in reader:
            if not row: continue
            nums = [int(x) for x in row[2:8]]
            draws.append({"no": int(row[0]), "date": row[1].strip("'"), "nums": sorted(nums)})
    draws.sort(key=lambda x: x['no'])
    metric_keys = ["sum", "odd_count", "low_count", "period_1", "period_2", "period_3", "neighbor", "consecutive", "prime", "composite", "multiple_3", "multiple_4", "square", "double_num", "mirror", "bucket_15", "bucket_9", "bucket_7", "bucket_5", "p9", "empty_zone", "color", "pattern_corner", "pattern_center", "end_sum", "same_end", "ac", "span", "mean_gap", "individual_streak", "over_appearance", "recent_5_recurrence", "hot_10_count", "cold_20_count", "avg_recurrence_interval"]
    raw_metrics = {k: [] for k in metric_keys}; distributions = {k: Counter() for k in metric_keys}; processed_data = []
    corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42]; tri_c = [17,18,19,24,25,26,31,32,33]; mirs = [12,21,13,31,14,41,23,32,24,42,34,43]
    last_seen = {n: 0 for n in range(1, 46)}
    for i, draw in enumerate(draws):
        nums_list = draw["nums"]; curr_no = draw["no"]
        prev_1 = set(draws[i-1]["nums"]) if i > 0 else set(); prev_2 = set(draws[i-2]["nums"]) if i > 1 else set(); prev_3 = set(draws[i-3]["nums"]) if i > 2 else set()
        streak_2 = prev_1.intersection(prev_2); ind_s = len([n for n in nums_list if n in streak_2])
        r5_draws = draws[max(0, i-5):i]; over_app, r5_rec = 0, 0
        if r5_draws:
            all_r5 = [n for d in r5_draws for n in d["nums"]]; c5 = Counter(all_r5)
            over_app = len([n for n in nums_list if c5[n] >= 3]); r5_rec = sum(c5[n] for n in nums_list)
        r10_draws = draws[max(0, i-10):i]; h10 = 0
        if r10_draws:
            all_r10 = [n for d in r10_draws for n in d["nums"]]; c10 = Counter(all_r10)
            h10 = len([n for n in nums_list if c10[n] >= 2])
        r20_draws = draws[max(0, i-20):i]; c20 = 0
        if r20_draws:
            r20_s = set([n for d in r20_draws for n in d["nums"]]); c20 = len([n for n in nums_list if n not in r20_s])
        ints = []; 
        for n in nums_list: 
            ls = last_seen[n]; ints.append(30 if ls==0 else curr_no-ls)
        avg_int = round(sum(ints)/6, 1)
        for n in nums_list: last_seen[n] = curr_no
        oc = len([n for n in nums_list if n%2!=0]); lc = len([n for n in nums_list if n<=22])
        cons = sum(1 for j in range(5) if nums_list[j]+1 == nums_list[j+1])
        prime = len([n for n in nums_list if is_prime(n)])
        m = {"sum": sum(nums_list), "odd_count": oc, "low_count": lc, "period_1": len([n for n in nums_list if n in prev_1]), "period_2": len([n for n in nums_list if i>1 and n in draws[i-2]["nums"]]), "period_3": len([n for n in nums_list if i>2 and n in draws[i-3]["nums"]]), "neighbor": len([n for n in nums_list if any(abs(n-px)==1 for px in (draws[i-1]["nums"] if i>0 else []))]), "consecutive": cons, "prime": prime, "composite": len([n for n in nums_list if is_composite(n)]), "multiple_3": len([n for n in nums_list if n%3==0]), "multiple_4": len([n for n in nums_list if n%4==0]), "square": len([n for n in nums_list if n in [1,4,9,16,25,36]]), "double_num": len([n for n in nums_list if n in [11,22,33,44]]), "mirror": len([n for n in nums_list if n in mirs]), "bucket_15": len(set((n-1)//15 for n in nums_list)), "bucket_9": len(set((n-1)//9 for n in nums_list)), "bucket_7": len(set((n-1)//7 for n in nums_list)), "bucket_5": len(set((n-1)//5 for n in nums_list)), "p9": len(set((n-1)%9 for n in nums_list)), "empty_zone": [0,0,0,0,0].count(0), "color": len(set((n-1)//10 for n in nums_list)), "pattern_corner": len([n for n in nums_list if n in corners]), "pattern_center": len([n for n in nums_list if n in tri_c]), "end_sum": sum(n%10 for n in nums_list), "same_end": max(Counter([n%10 for n in nums_list]).values()), "ac": calculate_ac(nums_list), "span": nums_list[-1]-nums_list[0], "mean_gap": round((nums_list[-1]-nums_list[0])/5, 1), "individual_streak": ind_s, "over_appearance": over_app, "recent_5_recurrence": r5_rec, "hot_10_count": h10, "cold_20_count": c20, "avg_recurrence_interval": avg_int}
        processed_data.append({"no": draw["no"], "date": draw["date"], "nums": nums_list, **m})
        for k, v in m.items():
            if k in raw_metrics: raw_metrics[k].append(v)
            if k != 'avg_recurrence_interval' and k in distributions: distributions[k][v] += 1
    stats_s = {}
    for k, v_list in raw_metrics.items():
        if not v_list: continue
        avg = sum(v_list)/len(v_list); var = sum((x-avg)**2 for x in v_list)/len(v_list)
        stats_s[k] = {"mean": round(avg, 2), "std": round(var**0.5, 2)}
    m_end = [[0]*10 for _ in range(10)]
    for i in range(len(draws)-1):
        for c in set([n%10 for n in draws[i]["nums"]]):
            for n in set([n%10 for n in draws[i+1]["nums"]]): m_end[c][n]+=1
    res = {"total_draws": len(draws), "last_3_draws": [d["nums"] for d in draws[-3:][::-1]], "stats_summary": stats_s, "distributions": {k: dict(sorted(v.items())) for k, v in distributions.items()}, "frequency": dict(Counter([n for d in draws for n in d["nums"]])), "markov_ending_matrix": m_end, "recent_draws": processed_data[::-1][:100]}
    with open('advanced_stats.json', 'w', encoding='utf-8') as f: json.dump(res, f, ensure_ascii=False, indent=4)
    print(f"✅ Lotto Analysis Complete (v32.0): {len(draws)} draws.")

def analyze_pension():
    draws = []
    if not os.path.exists('pt720.csv'): return
    with open('pt720.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f); next(reader)
        for row in reader:
            if not row: continue
            ns = [int(d) for d in str(row[3]).zfill(6)]
            draws.append({"no": int(row[0]), "date": row[1], "group": int(row[2]), "nums": ns})
    draws.sort(key=lambda x: x['no'])
    
    # v36.0 연금 시계열 지표 집계
    metric_keys = ["sum", "odd", "low", "prime", "sequence", "maxOccur", "carry", "neighbor", "recent_5_recurrence", "hot_10_count", "avg_interval"]
    raw_mets = {k: [] for k in metric_keys}; dists = {k: Counter() for k in metric_keys}
    
    # 자리수별 마지막 출현 추적 (0~5번 자리, 0~9번 숫자)
    last_seen_pos = [[0]*10 for _ in range(6)]

    for i, draw in enumerate(draws):
        nums = draw["nums"]; curr_no = draw["no"]
        prev = draws[i-1]["nums"] if i > 0 else None
        
        # 5회기/10회기 분석을 위한 데이터 슬라이싱
        r5_draws = draws[max(0, i-5):i]
        r10_draws = draws[max(0, i-10):i]
        
        r5_rec = 0
        if r5_draws:
            for p in range(6):
                c5 = Counter([d["nums"][p] for d in r5_draws])
                r5_rec += c5[nums[p]]
        
        h10 = 0
        if r10_draws:
            for p in range(6):
                c10 = Counter([d["nums"][p] for d in r10_draws])
                if c10[nums[p]] >= 2: h10 += 1
        
        ints = []
        for p in range(6):
            ls = last_seen_pos[p][nums[p]]
            ints.append(25 if ls==0 else curr_no-ls)
            last_seen_pos[p][nums[p]] = curr_no
        avg_int = round(sum(ints)/6, 1)

        m = {
            "sum": sum(nums), "odd": len([n for n in nums if n%2!=0]), "low": len([n for n in nums if n<=4]),
            "prime": len([n for n in nums if n in [2,3,5,7]]), "sequence": sum(1 for j in range(5) if abs(nums[j]-nums[j+1])==1),
            "maxOccur": max(Counter(nums).values()), "carry": sum(1 for j in range(6) if prev and nums[j]==prev[j]),
            "neighbor": sum(1 for j in range(6) if prev and any(abs(nums[j]-px)==1 for px in prev)),
            "recent_5_recurrence": r5_rec, "hot_10_count": h10, "avg_interval": avg_int
        }
        for k, v in m.items():
            raw_mets[k].append(v)
            if k != 'avg_interval': dists[k][v] += 1

    stats_s = {}
    for k, v_list in raw_mets.items():
        avg = sum(v_list)/len(v_list); var = sum((x-avg)**2 for x in v_list)/len(v_list)
        stats_s[k] = {"mean": round(avg, 2), "std": round(var**0.5, 2)}
    
    res = {
        "total_draws": len(draws), "stats_summary": stats_s, 
        "distributions": {k: dict(sorted(v.items())) for k, v in dists.items()},
        "recent_draws": draws[::-1][:100]
    }
    with open('pension_stats.json', 'w', encoding='utf-8') as f: json.dump(res, f, ensure_ascii=False, indent=4)
    print(f"✅ Pension Analysis Complete (v36.0): {len(draws)} draws.")

if __name__ == "__main__":
    analyze_lotto()
    analyze_pension()
