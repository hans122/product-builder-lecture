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
    
    # 22대 지표 집계용
    metric_keys = [
        "sum", "odd_count", "low_count", "period_1", "period_2", "period_3", "neighbor",
        "consecutive", "prime", "composite", "multiple_3", "multiple_4", "square", "double_num", "mirror",
        "bucket_15", "bucket_9", "bucket_7", "bucket_5", "p9", "empty_zone", "color",
        "pattern_corner", "pattern_center", "end_sum", "same_end", "ac", "span", "mean_gap"
    ]
    
    raw_metrics = {k: [] for k in metric_keys}
    distributions = {k: Counter() for k in metric_keys}
    processed_data = []
    
    corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42]
    triangle_center = [17,18,19,24,25,26,31,32,33]
    mirrors = [12,21,13,31,14,41,23,32,24,42,34,43]

    for i, draw in enumerate(draws):
        nums_list = draw["nums"]
        prev_1 = set(draws[i-1]["nums"]) if i > 0 else set()
        prev_2 = set(draws[i-2]["nums"]) if i > 1 else set()
        prev_3 = set(draws[i-3]["nums"]) if i > 2 else set()
        
        neighbors = set()
        for n in prev_1:
            if n > 1: neighbors.add(n-1)
            if n < 45: neighbors.add(n+1)

        # 지표 연산
        oc = len([n for n in nums_list if n % 2 != 0])
        lc = len([n for n in nums_list if n <= 22])
        p1 = len([n for n in nums_list if n in prev_1])
        p2 = len([n for n in nums_list if n in prev_2])
        p3 = len([n for n in nums_list if n in prev_3])
        nb = len([n for n in nums_list if n in neighbors])
        cons = sum(1 for j in range(5) if nums_list[j]+1 == nums_list[j+1])
        prime = len([n for n in nums_list if is_prime(n)])
        comp = len([n for n in nums_list if is_composite(n)])
        m3 = len([n for n in nums_list if n % 3 == 0])
        m4 = len([n for n in nums_list if n % 4 == 0])
        sq = len([n for n in nums_list if n in [1,4,9,16,25,36]])
        db = len([n for n in nums_list if n in [11,22,33,44]])
        mr = len([n for n in nums_list if n in mirrors])
        
        b15 = len(set((n-1)//15 for n in nums_list))
        b9 = len(set((n-1)//9 for n in nums_list))
        b7 = len(set((n-1)//7 for n in nums_list))
        b5 = len(set((n-1)//5 for n in nums_list))
        p9 = len(set((n-1)%9 for n in nums_list))
        
        zones = [0,0,0,0,0]
        for n in nums_list: zones[min(4, (n-1)//10)] += 1
        ez = zones.count(0)
        
        colors = set()
        for n in nums_list: colors.add((n-1)//10)
        
        pc = len([n for n in nums_list if n in corners])
        pcn = len([n for n in nums_list if n in triangle_center])
        es = sum(n % 10 for n in nums_list)
        ends = [n % 10 for n in nums_list]
        se = max(Counter(ends).values())
        ac = calculate_ac(nums_list)
        span = nums_list[-1] - nums_list[0]
        m_gap = round(span / 5, 1)

        m = {
            "sum": sum(nums_list), "odd_count": oc, "low_count": lc,
            "period_1": p1, "period_2": p2, "period_3": p3, "neighbor": nb,
            "consecutive": cons, "prime": prime, "composite": comp,
            "multiple_3": m3, "multiple_4": m4, "square": sq, "double_num": db, "mirror": mr,
            "bucket_15": b15, "bucket_9": b9, "bucket_7": b7, "bucket_5": b5, "p9": p9,
            "empty_zone": ez, "color": len(colors),
            "pattern_corner": pc, "pattern_center": pcn, "end_sum": es, "same_end": se,
            "ac": ac, "span": span, "mean_gap": m_gap
        }
        
        processed_data.append({"no": draw["no"], "date": draw["date"], "nums": nums_list, **m})
        for k, v in m.items():
            if k in raw_metrics: raw_metrics[k].append(v)
            if k in distributions: distributions[k][v] += 1

    # stats_summary 계산 루프 종료 후 실행
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

    # [AI] 회귀 시점 분석 (Regression Timing)
    regression_signals = {}
    for k, v_list in raw_metrics.items():
        if not v_list: continue
        stat = stats_summary[k]
        # v22.0: ±1*std (68% 구간)로 Safe Zone 좁혀 민감도 강화
        safe_min, safe_max = stat["mean"] - 1*stat["std"], stat["mean"] + 1*stat["std"]
        
        streak = 0
        for val in v_list[::-1]: # 최신 회차부터 역순으로 조사
            # Safe Zone을 벗어난 회차가 지속될수록 회귀 에너지가 상승함
            if val < safe_min or val > safe_max: streak += 1
            else: break
            
        # 지표명을 화면 표시용으로 변환
        label = k.replace('_', ' ').title()
        # 3회 연속 이탈 시 에너지가 99%에 근접하도록 가중치 상향
        regression_signals[label] = {"streak": streak, "energy": min(100, streak * 33)}

    # [AI] 지표 간 상관관계 분석 (Pearson Correlation Coefficient)
    # 분석 대상 핵심 지표 정의
    corr_keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count"]
    correlation_matrix = {}
    
    # 평균 및 표준편차 사전 계산 (이미 stats_summary에 있음)
    # 공분산 및 상관계수 계산
    for k1 in corr_keys:
        correlation_matrix[k1] = {}
        for k2 in corr_keys:
            if k1 == k2:
                correlation_matrix[k1][k2] = 1.0
                continue
            
            # 두 지표의 데이터 리스트 가져오기 (길이는 동일해야 함)
            data1 = raw_metrics[k1]
            data2 = raw_metrics[k2]
            n = len(data1)
            
            mean1 = stats_summary[k1]["mean"]
            mean2 = stats_summary[k2]["mean"]
            std1 = stats_summary[k1]["std"]
            std2 = stats_summary[k2]["std"]
            
            if std1 == 0 or std2 == 0:
                correlation_matrix[k1][k2] = 0
                continue

            # 공분산(Covariance) 계산: E[(X-meanX)(Y-meanY)]
            covariance = sum((data1[i] - mean1) * (data2[i] - mean2) for i in range(n)) / n
            
            # 상관계수(r) = Cov(X,Y) / (stdX * stdY)
            r = covariance / (std1 * std2)
            correlation_matrix[k1][k2] = round(r, 2)

    result = {
        "total_draws": len(draws),
        "last_3_draws": [d["nums"] for d in draws[-3:][::-1]],
        "stats_summary": stats_summary,
        "distributions": {k: dict(sorted(v.items())) for k, v in distributions.items()},
        "frequency": dict(Counter([n for d in draws for n in d["nums"]])),
        "markov_ending_matrix": markov_ending,
        "regression_signals": regression_signals,
        "correlation_matrix": correlation_matrix, # [NEW] 상관계수 매트릭스 추가
        "recent_draws": processed_data[::-1][:100]
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"✅ Lotto Analysis Complete: {len(draws)} draws.")

def analyze_pension():
    draws = []
    if not os.path.exists('pt720.csv'): return
    with open('pt720.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if not row: continue
            nums_str = str(row[3]).zfill(6)
            draws.append({"no": int(row[0]), "date": row[1], "group": int(row[2]), "nums": [int(d) for d in nums_str]})
    draws.sort(key=lambda x: x['no'])
    
    pos_freq = [[0]*10 for _ in range(6)]
    markov = [[0]*10 for _ in range(10)]
    
    metrics = {"sum": [], "odd": [], "low": [], "prime": [], "sequence": [], "maxOccur": [], "carry": [], "neighbor": []}
    distributions = {k: Counter() for k in metrics.keys()}

    for i, draw in enumerate(draws):
        nums = draw["nums"]
        prev = draws[i-1]["nums"] if i > 0 else None
        for p in range(6): pos_freq[p][nums[p]] += 1
        if i < len(draws)-1:
            nxt = draws[i+1]["nums"]
            for p in range(6): markov[nums[p]][nxt[p]] += 1

        s = sum(nums)
        od = len([n for n in nums if n % 2 != 0])
        lo = len([n for n in nums if n <= 4])
        pr = len([n for n in nums if n in [2,3,5,7]])
        sq = sum(1 for j in range(5) if abs(nums[j]-nums[j+1])==1)
        mo = max(Counter(nums).values())
        ca = sum(1 for j in range(6) if prev and nums[j]==prev[j])
        nb = sum(1 for j in range(6) if prev and any(abs(nums[j]-p)==1 for p in prev))

        m = {"sum": s, "odd": od, "low": lo, "prime": pr, "sequence": sq, "maxOccur": mo, "carry": ca, "neighbor": nb}
        for k, v in m.items():
            metrics[k].append(v)
            distributions[k][v] += 1

    stats_summary = {}
    for k, v_list in metrics.items():
        mean = sum(v_list)/len(v_list)
        var = sum((x-mean)**2 for x in v_list)/len(v_list)
        stats_summary[k] = {"mean": round(mean, 2), "std": round(var**0.5, 2)}

    result = {
        "total_draws": len(draws),
        "pos_freq": pos_freq,
        "markov_matrix": markov,
        "stats_summary": stats_summary,
        "distributions": {k: dict(sorted(v.items())) for k, v in distributions.items()},
        "recent_draws": draws[::-1][:100]
    }
    with open('pension_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"✅ Pension Analysis Complete: {len(draws)} draws.")

if __name__ == "__main__":
    analyze_lotto()
    analyze_pension()
