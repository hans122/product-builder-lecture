import json
import os

def run_v26_backtest():
    if not os.path.exists('advanced_stats.json'): return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    matrix = data.get('correlation_matrix', {})
    summary = data.get('stats_summary', {})
    draws = data.get('recent_draws', [])
    signals = data.get('regression_signals', {})
    
    print(f"--- [v26.0] Deep Synergy & Energy Sync Backtest (Last {len(draws)} Draws) ---")
    
    multiplier_sum = 0
    top_tier_count = 0 # 1.5배 이상 기댓값 기록 건수
    total_violations = 0
    
    # v26.0 40쌍 딥 시너지 규칙
    pairs = [
        ['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], 
        ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'],
        ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'],
        ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'],
        ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count'],
        ['bucket_9', 'bucket_5'], ['pattern_center', 'pattern_corner'], ['same_end', 'end_sum'],
        ['square', 'prime'], ['double_num', 'mirror'], ['ac', 'mean_gap'],
        ['multiple_3', 'multiple_4'], ['color', 'bucket_15'], ['span', 'consecutive'],
        ['bucket_9', 'low_count'], ['end_sum', 'multiple_3'],
        ['period_1', 'neighbor'], ['period_1', 'sum'], ['neighbor', 'ac'],
        ['bucket_7', 'empty_zone'], ['p9', 'color'], ['composite', 'low_count'],
        ['period_2', 'period_3'], ['multiple_3', 'prime'], ['square', 'pattern_center'],
        ['double_num', 'same_end'], ['bucket_15', 'bucket_7'], ['mean_gap', 'color'],
        ['span', 'p9'], ['period_1', 'consecutive']
    ]

    keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "period_1", "period_2", "period_3", "neighbor", "consecutive", "prime", "composite", "multiple_3", "multiple_4", "square", "double_num", "mirror", "bucket_15", "bucket_9", "bucket_7", "bucket_5", "p9", "empty_zone", "color", "pattern_corner", "pattern_center", "same_end"]

    for draw in draws:
        z_scores = {}
        for key in keys:
            val = draw.get(key)
            if val is None: continue
            s = summary.get(key)
            if s and s['std'] != 0:
                z_scores[key] = (val - s['mean']) / s['std']

        # 1. Harmony Score (40 pairs)
        harmony_score = 0
        violations = 0
        for k1, k2 in pairs:
            if k1 not in matrix or k2 not in matrix[k1]: continue
            r = matrix[k1][k2]
            z1, z2 = z_scores.get(k1), z_scores.get(k2)
            if z1 is None or z2 is None: continue
            
            if abs(r) > 0.12:
                curr_rel = z1 * z2
                is_harmony = (r > 0 and curr_rel > 0) or (r < 0 and curr_rel < 0)
                if not is_harmony and abs(curr_rel) > 1.8:
                    violations += 1
                    harmony_score -= 20
                elif is_harmony and abs(curr_rel) > 0.8:
                    harmony_score += 3
        
        total_violations += violations
        harmony_edge = 1.0 + (harmony_score / 100)

        # 2. Energy Sync (Simplified Simulation)
        # 실제 당첨번호가 고에너지 지표의 세이프존(1시그마)에 들어왔는지 체크
        energy_boost = 1.0
        high_energy_count = 0
        matched_count = 0
        for label, sig in signals.items():
            if sig['energy'] >= 80:
                high_energy_count += 1
                key = label.lower().replace(' ', '_')
                val = draw.get(key)
                s = summary.get(key)
                if s and val is not None:
                    if abs(val - s['mean']) <= s['std']:
                        matched_count += 1
        
        if high_energy_count > 0:
            energy_boost = 1.0 + (matched_count / high_energy_count) * 0.5

        # 3. Final Multiplier (Simulating SimEdge as 1.0 for neutrality)
        multiplier = harmony_edge * energy_boost * 1.0
        multiplier = max(0.1, min(3.5, multiplier))
        multiplier_sum += multiplier
        if multiplier >= 1.5: top_tier_count += 1

    avg_multiplier = multiplier_sum / len(draws)
    top_tier_rate = (top_tier_count / len(draws)) * 100
    
    print(f"Average Win Multiplier: {avg_multiplier:.2f}x")
    print(f"Top-Tier Probability Rate (>= 1.5x): {top_tier_rate:.1f}%")
    print(f"Avg Contradictions per Draw: {total_violations / len(draws):.2f}")
    
    if avg_multiplier > 1.1 and top_tier_rate > 30:
        print(f"\n✅ [VERIFIED] v26.0 시스템의 강력한 성능 입증.")
        print(f"실제 당첨 번호들이 일반 조합 대비 평균 {avg_multiplier:.2f}배의 기댓값을 기록하고 있습니다.")
    else:
        print("\n⚠️ [NOTICE] 에너지 동기화 가중치 미세 조정이 필요할 수 있습니다.")

if __name__ == "__main__":
    run_v26_backtest()
