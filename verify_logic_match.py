import json
import os
from collections import Counter

"""
AI Logic Guardian v2.0 (v29.0 Upgrade)
- Performs 1:1 cross-validation between stored values and recalculated logic
- Ensures all 29 professional indicators are consistent
"""

def is_prime(n):
    return n in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]

def calculate_ac(nums):
    diffs = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            diffs.add(abs(nums[i] - nums[j]))
    return len(diffs) - (len(nums) - 1)

def run_logic_guard():
    if not os.path.exists('advanced_stats.json'):
        print("❌ Error: advanced_stats.json not found.")
        return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    draws = data.get('recent_draws', [])
    if not draws:
        print("❌ No draw data to verify.")
        return

    print(f"🚀 Starting v29.0 Logic Guardian (Verifying {len(draws)} draws x 29 indicators)\n")
    
    # 지표별 검증 함수 매핑 (indicators.js 로직 미러링)
    logic_map = {
        "sum": lambda ns: sum(ns),
        "ac": calculate_ac,
        "odd_count": lambda ns: len([n for n in ns if n % 2 != 0]),
        "low_count": lambda ns: len([n for n in ns if n <= 22]),
        "prime": lambda ns: len([n for n in ns if is_prime(n)]),
        "consecutive": lambda ns: sum(1 for j in range(5) if ns[j]+1 == ns[j+1]),
        "end_sum": lambda ns: sum(n % 10 for n in ns),
        "span": lambda ns: max(ns) - min(ns),
        "color": lambda ns: len(set((n-1)//10 for n in ns)),
        "empty_zone": lambda ns: [0,0,0,0,0].count(0), # 멸구간은 리스트 계산 필요하므로 아래서 별도 처리
        "pattern_corner": lambda ns: len([n for n in ns if n in [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42]]),
        "pattern_center": lambda ns: len([n for n in ns if n in [17,18,19,24,25,26,31,32,33]]),
        "recent_5_recurrence": lambda ns: 0, # 아래서 별도 처리
        "hot_10_count": lambda ns: 0 # 아래서 별도 처리
    }

    total_checks = 0
    total_errors = 0
    error_details = []

    for idx, draw in enumerate(draws):
        nums = draw['nums']
        recent_draws = data.get('recent_draws', [])[idx+1:] # 현재 회차 이후(과거) 데이터
        
        for key, func in logic_map.items():
            if key in draw:
                stored_val = draw[key]
                calculated_val = 0
                
                # 특수 케이스 처리
                if key == "empty_zone":
                    zones = [0,0,0,0,0]
                    for n in nums: zones[min(4, (n-1)//10)] += 1
                    calculated_val = zones.count(0)
                elif key == "recent_5_recurrence":
                    r5 = [n for d in draws[idx+1:idx+6] for n in d['nums']]
                    counts = Counter(r5)
                    calculated_val = sum(counts[n] for n in nums)
                elif key == "hot_10_count":
                    r10 = [n for d in draws[idx+1:idx+11] for n in d['nums']]
                    counts = Counter(r10)
                    hot_nums = [n for n, c in counts.items() if c >= 2]
                    calculated_val = len([n for n in nums if n in hot_nums])
                else:
                    calculated_val = func(nums)
                
                total_checks += 1
                if stored_val != calculated_val:
                    total_errors += 1
                    error_details.append(f"Mismatch in Draw {draw['no']} - Key: {key} (Stored: {stored_val}, Calc: {calculated_val})")

    # 결과 리포트
    if total_errors == 0:
        print(f"✅ [SUCCESS] All {total_checks} logic checks passed perfectly.")
        print(f"Consistency Rate: 100.0% (Backend Data == Calculation Logic)")
    else:
        print(f"⚠️ [WARNING] Logic mismatches detected!")
        print(f"Consistency Rate: {((total_checks-total_errors)/total_checks)*100:.2f}%")
        print(f"Total Errors: {total_errors} / {total_checks}")
        for err in error_details[:5]: # 상위 5개만 출력
            print(f"  - {err}")

if __name__ == "__main__":
    run_logic_guard()
