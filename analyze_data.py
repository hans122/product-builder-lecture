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
    # CSV 데이터 로드 (v4.3 규격: 회차, 날짜, 번호1~6, 보너스)
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
    
    # 지표 산출용 초기화
    raw_metrics = {
        "sum": [], "odd_count": [], "low_count": [], "period_1": [], "neighbor": [],
        "period_1_2": [], "period_1_3": [], "consecutive": [], "prime": [], "composite": [],
        "multiple_3": [], "multiple_5": [], "square": [], "double_num": [],
        "bucket_15": [], "bucket_9": [], "bucket_5": [], "bucket_3": [], "color": [],
        "pattern_corner": [], "pattern_triangle": [], "end_sum": [], "same_end": [], "ac": [], "span": [],
        "first_num": [], "last_num": [], "mean_gap": []
    }
    
    # distributions는 distKey 기준으로 초기화
    dist_keys = [
        "sum", "odd_even", "high_low", "period_1", "neighbor", "period_1_2", "period_1_3",
        "consecutive", "prime", "composite", "multiple_3", "multiple_5", "square", "double_num",
        "bucket_15", "bucket_9", "bucket_5", "bucket_3", "color", "pattern_corner", "pattern_triangle",
        "end_sum", "same_end", "ac", "span", "first_num", "last_num", "mean_gap"
    ]
    distributions = {k: Counter() for k in dist_keys}
    processed_data = []
    
    # 패턴용 구역 정의
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

        # 기초 계산
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
        
        # [신규] G6 지표 계산
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
        
        # 분포 및 원본 통계용 데이터 축적
        for k, v in metrics.items():
            # 실제 수치값 추출 (statKey용)
            if k == "odd_even": val_for_stat = oc
            elif k == "high_low": val_for_stat = lc
            else: val_for_stat = v

            # distKey 매핑 (JSON 표준 분포용)
            dist_k = k
            if k == "multiple_5" or k == "m5": dist_k = "multiple_5"
            elif k == "double": dist_k = "double_num"
            elif k in ["b15", "bucket_15"]: dist_k = "bucket_15"
            elif k in ["b9", "bucket_9"]: dist_k = "bucket_9"
            elif k in ["b5", "bucket_5"]: dist_k = "bucket_5"
            elif k in ["b3", "bucket_3"]: dist_k = "bucket_3"
            elif k in ["p_corner", "pattern_corner"]: dist_k = "pattern_corner"
            elif k in ["p_tri", "pattern_triangle"]: dist_k = "pattern_triangle"
            
            distributions[dist_k][v] += 1
            
            # statKey 매핑 (JSON 요약 표준용)
            stat_k = k
            if k == "odd_even": stat_k = "odd_count"
            elif k == "high_low": stat_k = "low_count"
            elif k == "multiple_5" or k == "m5": stat_k = "multiple_5"
            elif k == "double": stat_k = "double_num"
            elif k in ["b15", "bucket_15"]: stat_k = "bucket_15"
            elif k in ["b9", "bucket_9"]: stat_k = "bucket_9"
            elif k in ["b5", "bucket_5"]: stat_k = "bucket_5"
            elif k in ["b3", "bucket_3"]: stat_k = "bucket_3"
            elif k in ["p_corner", "pattern_corner"]: stat_k = "pattern_corner"
            elif k in ["p_tri", "pattern_triangle"]: stat_k = "pattern_triangle"
            
            if stat_k in raw_metrics:
                raw_metrics[stat_k].append(val_for_stat)

    # 통계 요약 계산
    stats_summary = {}
    for k, v_list in raw_metrics.items():
        if not v_list: continue
        mean = sum(v_list) / len(v_list)
        var = sum((x - mean) ** 2 for x in v_list) / len(v_list)
        stats_summary[k] = {"mean": round(mean, 2), "std": round(var ** 0.5, 2)}

    # 결과 저장
    result = {
        "total_draws": len(draws),
        "last_3_draws": [d["nums"] for d in draws[-3:][::-1]],
        "stats_summary": stats_summary,
        "distributions": {k: dict(sorted(v.items())) for k, v in distributions.items()},
        "frequency": dict(Counter([n for d in draws for n in d["nums"]])),
        "recent_20_frequency": dict(Counter([n for d in draws[-20:] for n in d["nums"]])),
        "recent_draws": processed_data[::-1][:30]
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    with open('frequency.json', 'w', encoding='utf-8') as f:
        json.dump({str(k): v for k, v in result["frequency"].items()}, f, ensure_ascii=False, indent=4)
        
    print(f"Success: Full metrics including G6 up to draw {draws[-1]['no']}")

if __name__ == "__main__":
    analyze()
