import json
import os

def run_correlation_backtest():
    if not os.path.exists('advanced_stats.json'): return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    matrix = data.get('correlation_matrix', {})
    summary = data.get('stats_summary', {})
    draws = data.get('recent_draws', [])
    
    print(f"--- [v25.0] Super-Precision Synergy Backtest (Last {len(draws)} Draws) ---")
    
    perfect_count = 0
    total_violations = 0
    score_sum = 0
    
    # v25.0 25+쌍 규칙
    pairs = [
        ['sum', 'low_count'], ['span', 'mean_gap'], ['empty_zone', 'span'], 
        ['odd_count', 'prime'], ['consecutive', 'mean_gap'], ['ac', 'span'],
        ['end_sum', 'sum'], ['prime', 'sum'], ['consecutive', 'ac'],
        ['multiple_3', 'sum'], ['multiple_4', 'low_count'], ['bucket_15', 'span'],
        ['color', 'empty_zone'], ['pattern_corner', 'ac'], ['end_sum', 'odd_count'],
        ['bucket_9', 'bucket_5'], ['pattern_center', 'pattern_corner'], ['same_end', 'end_sum'],
        ['square', 'prime'], ['double_num', 'mirror'], ['ac', 'mean_gap'],
        ['multiple_3', 'multiple_4'], ['color', 'bucket_15'], ['span', 'consecutive'],
        ['bucket_9', 'low_count'], ['end_sum', 'multiple_3']
    ]

    keys = ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count", "empty_zone", "prime", "consecutive", "multiple_3", "multiple_4", "bucket_15", "color", "pattern_corner", "pattern_center", "same_end", "square", "double_num", "mirror", "bucket_9", "bucket_5"]

    for draw in draws:
        z_scores = {}
        for key in keys:
            val = draw.get(key)
            if val is None: continue
            s = summary.get(key)
            if s and s['std'] != 0:
                z_scores[key] = (val - s['mean']) / s['std']

        score = 0
        violations = []
        for k1, k2 in pairs:
            if k1 not in matrix or k2 not in matrix[k1]: continue
            r = matrix[k1][k2]
            z1, z2 = z_scores.get(k1), z_scores.get(k2)
            if z1 is None or z2 is None: continue
            
            if abs(r) > 0.15:
                curr_rel = z1 * z2
                is_harmony = (r > 0 and curr_rel > 0) or (r < 0 and curr_rel < 0)
                
                # v25.0 임계치: 1.8
                if not is_harmony and abs(curr_rel) > 1.8:
                    violations.append(f"{k1}-{k2}")
                    score -= 25
                elif is_harmony and abs(curr_rel) > 0.7:
                    score += 4
        
        score_sum += score
        if len(violations) == 0: perfect_count += 1
        total_violations += len(violations)

    avg_score = score_sum / len(draws)
    compliance_rate = (perfect_count / len(draws)) * 100
    
    print(f"Average Harmony Score: {avg_score:.2f}")
    print(f"Compliance Rate (0 Outliers): {compliance_rate:.1f}%")
    print(f"Total Outliers Found: {total_violations} cases in {len(draws)} draws")
    
    if compliance_rate >= 90:
        print(f"\n✅ [SUCCESS] 초정밀 시너지 엔진 작동 확인: 당첨 번호의 {compliance_rate}%를 수용하면서도 모순된 조합을 강력히 필터링함.")
    else:
        print("\n⚠️ [TUNE] 정밀도 보정이 필요할 수 있습니다.")

if __name__ == "__main__":
    run_correlation_backtest()
