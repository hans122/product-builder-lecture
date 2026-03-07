import json
import os

def run_correlation_backtest():
    if not os.path.exists('advanced_stats.json'):
        print("Error: advanced_stats.json not found.")
        return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    matrix = data.get('correlation_matrix', {})
    summary = data.get('stats_summary', {})
    draws = data.get('recent_draws', [])
    
    if not matrix or not summary:
        print("Error: Correlation data missing.")
        return

    print(f"--- [v22.2] 7-Way Correlation Synergy Backtest (Last {len(draws)} Draws) ---")
    
    perfect_harmony_count = 0
    total_violations = 0
    score_sum = 0
    
    # v22.2 확장 규칙 (JS 로직과 100% 동일)
    pairs = [
        ('sum', 'low_count'),    # r = -0.88
        ('span', 'mean_gap'),    # r = 1.0
        ('empty_zone', 'span'),  # r = -0.15 (약함)
        ('odd_count', 'prime'),  # r = 유의미
        ('consecutive', 'mean_gap'), 
        ('ac', 'span'),
        ('end_sum', 'sum')
    ]

    for draw in draws:
        z_scores = {}
        for key in ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "empty_zone", "prime", "consecutive"]:
            val = draw.get(key)
            if val is None: continue
            mean = summary[key]['mean']
            std = summary[key]['std']
            z_scores[key] = (val - mean) / std if std != 0 else 0

        score = 0
        violations = []
        for k1, k2 in pairs:
            if k1 not in matrix or k2 not in matrix[k1]: continue
            r = matrix[k1][k2]
            z1, z2 = z_scores.get(k1), z_scores.get(k2)
            if z1 is None or z2 is None: continue
            
            curr_rel = z1 * z2
            # v22.3 최적화 임계치 반영
            if abs(r) > 0.3:
                is_harmony = (r > 0 and curr_rel > 0) or (r < 0 and curr_rel < 0)
                
                if not is_harmony and abs(curr_rel) > 0.6:
                    violations.append(f"{k1}-{k2}")
                    score -= 15
                elif is_harmony and abs(curr_rel) > 0.3:
                    score += 8
        
        score_sum += score
        if len(violations) == 0:
            perfect_harmony_count += 1
        total_violations += len(violations)

    avg_score = score_sum / len(draws)
    perfect_rate = (perfect_harmony_count / len(draws)) * 100
    
    print(f"Average Harmony Score: {avg_score:.2f}")
    print(f"Perfect Harmony Rate (0 Violations): {perfect_rate:.1f}%")
    print(f"Avg Violations per Draw: {total_violations / len(draws):.2f}")
    
    if perfect_rate >= 75:
        print("\n✅ [RESULT] 고도화된 시너지 엔진 유효성 입증: 규칙이 2배 늘어났음에도 75% 이상의 당첨번호가 조화를 이룸.")
    else:
        print("\n⚠️ [RESULT] 규칙 최적화 필요: 실데이터와의 편차가 존재함.")

if __name__ == "__main__":
    run_correlation_backtest()
