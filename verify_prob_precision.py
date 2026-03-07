import json
import os
import random

def calculate_ac(nums):
    diffs = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            diffs.add(abs(nums[i] - nums[j]))
    return len(diffs) - (len(nums) - 1)

def run_precision_backtest():
    if not os.path.exists('advanced_stats.json'): return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    matrix = data.get('correlation_matrix', {})
    summary = data.get('stats_summary', {})
    actual_draws = data.get('recent_draws', [])[:100]
    signals = data.get('regression_signals', {})
    
    # 40쌍 상관관계 규칙 (v26.0+ 기준)
    pairs = [
        ['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], 
        ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'],
        ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'],
        ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'],
        ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count']
    ]

    def get_multiplier(nums, is_actual=True):
        # 1. Z-Scores 계산
        z = {}
        for key in summary:
            if key in ["sum", "ac", "odd_count", "low_count", "end_sum", "span", "mean_gap", "empty_zone", "prime", "consecutive"]:
                # 실제 값 계산 (단순화를 위해 합계, AC 등 기본 위주)
                val = sum(nums) if key == 'sum' else (calculate_ac(nums) if key == 'ac' else 0)
                # 실제 백테스트에서는 draw 객체에 이미 계산된 값을 사용하거나 여기서 계산
                if is_actual:
                    val = next((d[key] for d in actual_draws if d['nums'] == nums), val)
                
                s = summary[key]
                z[key] = (val - s['mean']) / s['std'] if s['std'] != 0 else 0

        # 2. Harmony Score
        h_score = 0
        for k1, k2 in pairs:
            if k1 in z and k2 in z and k1 in matrix and k2 in matrix[k1]:
                r = matrix[k1][k2]
                curr_rel = z[k1] * z[k2]
                if abs(r) > 0.15:
                    if (r > 0 and curr_rel > 0) or (r < 0 and curr_rel < 0):
                        if abs(curr_rel) > 0.8: h_score += 3
                    elif abs(curr_rel) > 1.8: h_score -= 20
        
        # 3. Energy Sync (Simplified)
        energy_boost = 1.0
        # ... (생략 가능, 조화도 점수가 핵심)
        
        return 1.0 + (h_score / 100)

    print(f"--- [v29.5] Probability Precision Backtest (N=100) ---")
    
    actual_mults = [get_multiplier(d['nums'], True) for d in actual_draws]
    
    # 무작위 조합 100개 생성 및 계산
    random_mults = []
    for _ in range(100):
        rnd_nums = sorted(random.sample(range(1, 46), 6))
        random_mults.append(get_multiplier(rnd_nums, False))

    avg_actual = sum(actual_mults) / len(actual_mults)
    avg_random = sum(random_mults) / len(random_mults)
    
    edge = (avg_actual / avg_random - 1) * 100
    
    print(f"Avg Multiplier (Actual Draws): {avg_actual:.3f}x")
    print(f"Avg Multiplier (Random Combo): {avg_random:.3f}x")
    print(f"\n📊 Statistical Edge: {edge:+.2f}%")
    
    high_tier_actual = len([m for m in actual_mults if m >= 1.1])
    print(f"Top-Tier Recall (Actual Draws >= 1.1x): {high_tier_actual}%")

    if edge > 5:
        print("\n✅ [RESULT] 엔진 유효성 입증: 실제 당첨 번호가 무작위 번호보다 통계적으로 우월한 기댓값을 기록함.")
    else:
        print("\n⚠️ [RESULT] 엔진 보정 필요: 무작위 조합과의 변별력이 낮습니다.")

if __name__ == "__main__":
    run_precision_backtest()
