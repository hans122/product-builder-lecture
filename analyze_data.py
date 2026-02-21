import csv
import json
from collections import Counter

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def analyze():
    frequency = Counter()
    current_max_draw = 0
    
    # 기존 분포
    odd_even_dist = Counter()
    high_low_dist = Counter()
    consecutive_dist = Counter()
    prime_dist = Counter()
    composite_dist = Counter()
    multiple_3_dist = Counter()
    period_1_dist = Counter()
    neighbor_dist = Counter()
    sum_dist = []

    # 신규 분포 추가
    end_sum_dist = Counter()      # 일의 자리 총합
    same_end_dist = Counter()     # 같은 일의 자리 수(동끝)
    square_dist = Counter()       # 완전제곱수
    multiple_5_dist = Counter()   # 5의 배수
    double_num_dist = Counter()   # 쌍수(11,22,33,44)

    draws = []
    squares = [1, 4, 9, 16, 25, 36]
    doubles = [11, 22, 33, 44]

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

    recent_table_data = []
    prev_nums = None
    
    for draw in draws:
        draw_no = draw['no']
        nums_list = draw['nums']
        nums_set = set(nums_list)
        
        if draw_no > current_max_draw: current_max_draw = draw_no
        for n in nums_list: frequency[n] += 1
        
        # 1. 기존 항목들
        odds = len([n for n in nums_list if n % 2 != 0])
        odd_even_val = f"{odds}:{6-odds}"
        odd_even_dist[odd_even_val] += 1

        lows = len([n for n in nums_list if n <= 22])
        high_low_val = f"{lows}:{6-lows}"
        high_low_dist[high_low_val] += 1
        
        consecutive = 0
        for i in range(len(nums_list)-1):
            if nums_list[i] + 1 == nums_list[i+1]: consecutive += 1
        consecutive_dist[consecutive] += 1
        
        primes = len([n for n in nums_list if is_prime(n)])
        prime_dist[primes] += 1
        composites = len([n for n in nums_list if n > 1 and not is_prime(n)])
        composite_dist[composites] += 1
        m3s = len([n for n in nums_list if n % 3 == 0])
        multiple_3_dist[m3s] += 1
        total_sum = sum(nums_list)
        sum_dist.append(total_sum)

        period_1_val = 0
        neighbor_val = 0
        if prev_nums is not None:
            period_1_val = len(nums_set.intersection(prev_nums))
            period_1_dist[period_1_val] += 1
            neighbors = set()
            for n in prev_nums:
                if n > 1: neighbors.add(n - 1)
                if n < 45: neighbors.add(n + 1)
            neighbor_val = len(nums_set.intersection(neighbors))
            neighbor_dist[neighbor_val] += 1

        # 2. 신규 분석 항목 계산
        # 일의 자리 총합
        end_sum = sum([n % 10 for n in nums_list])
        end_sum_dist[end_sum] += 1

        # 같은 일의 자리 수 (동끝 최대 개수)
        end_digits = [n % 10 for n in nums_list]
        max_same_end = Counter(end_digits).most_common(1)[0][1]
        same_end_dist[max_same_end] += 1

        # 완전제곱수 개수
        square_count = len([n for n in nums_list if n in squares])
        square_dist[square_count] += 1

        # 5의 배수 개수
        m5_count = len([n for n in nums_list if n % 5 == 0])
        multiple_5_dist[m5_count] += 1

        # 쌍수 개수
        double_count = len([n for n in nums_list if n in doubles])
        double_num_dist[double_count] += 1
        
        # 최근 테이블 데이터 (신규 필드 포함)
        recent_table_data.append({
            "no": draw_no, "date": draw['date'], "nums": nums_list, "sum": total_sum,
            "odd_even": odd_even_val, "high_low": high_low_val, "consecutive": consecutive,
            "prime": primes, "neighbor": neighbor_val, "period_1": period_1_val,
            "end_sum": end_sum, "same_end": max_same_end, "square": square_count,
            "m5": m5_count, "double": double_count
        })
        prev_nums = nums_set

    recent_table_data.reverse()
    recent_table_data = recent_table_data[:30]

    # 총합 구간 재조정 (7개 구간)
    sum_range_dist = Counter()
    for s in sum_dist:
        if s < 100: rk = "100 미만"
        elif s < 120: rk = "100-119"
        elif s < 140: rk = "120-139"
        elif s < 160: rk = "140-159"
        elif s < 180: rk = "160-179"
        elif s < 200: rk = "180-199"
        else: rk = "200 이상"
        sum_range_dist[rk] += 1

    result = {
        "frequency": {str(i): frequency.get(i, 0) for i in range(1, 46)},
        "distributions": {
            "odd_even": dict(odd_even_dist), "high_low": dict(high_low_dist),
            "consecutive": dict(consecutive_dist), "prime": dict(prime_dist),
            "composite": dict(composite_dist), "multiple_3": dict(multiple_3_dist),
            "period_1": dict(period_1_dist), "neighbor": dict(neighbor_dist),
            "sum": dict(sum_range_dist),
            "end_sum": dict(end_sum_dist), "same_end": dict(same_end_dist),
            "square": dict(square_dist), "multiple_5": dict(multiple_5_dist),
            "double_num": dict(double_num_dist)
        },
        "total_draws": current_max_draw,
        "last_draw_numbers": draws[-1]['nums'],
        "recent_draws": recent_table_data
    }

    with open('advanced_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    print(f"Success: Analyzed with new metrics up to draw {current_max_draw}")

if __name__ == "__main__":
    analyze()
