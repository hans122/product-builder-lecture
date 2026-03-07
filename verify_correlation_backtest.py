import json
import os

def run_correlation_backtest():
    if not os.path.exists('advanced_stats.json'):
        print("Error: advanced_stats.json not found.")
        return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.json_load(f)
    
    matrix = data.get('correlation_matrix', {})
    summary = data.get('stats_summary', {})
    draws = data.get('recent_draws', []) # 최근 100회차만 우선 검증 (JSON 구조상)
    
    if not matrix or not summary:
        print("Error: Correlation data missing.")
        return

    print(f"--- Correlation Harmony Backtest (Last {len(draws)} Draws) ---")
    
    success_count = 0
    total_violations = 0
    score_sum = 0
    
    # 핵심 상관관계 쌍 (JS 로직과 동일)
    pairs = [
        ('sum', 'low_count'), # r = -0.88
        ('ac', 'sum'),        # r = -0.03 (약하지만 검증)
        ('span', 'mean_gap')  # r = 1.0 (강한 상관)
    ]

    for draw in draws:
        nums = draw['nums']
        z_scores = {}
        
        # 1. Z-Score 계산
        for key in ["sum", "ac", "end_sum", "span", "mean_gap", "odd_count", "low_count"]:
            val = draw.get(key)
            if val is None: continue
            mean = summary[key]['mean']
            std = summary[key]['std']
            z_scores[key] = (val - mean) / std

        # 2. 하모니 체크
        score = 0
        violations = []
        for k1, k2 in pairs:
            r = matrix[k1][k2]
            z1, z2 = z_scores.get(k1), z_scores.get(k2)
            if z1 is None or z2 is None: continue
            
            curr_rel = z1 * z2
            # 역사적 경향성(r)과 현재 조합의 관계(curr_rel) 부호 비교
            is_harmony = (r > 0 and curr_rel > 0) or (r < 0 and curr_rel < 0)
            
            if not is_harmony and abs(curr_rel) > 0.5:
                violations.append(f"{k1}-{k2}")
            else:
                score += 10
        
        score_sum += score
        if len(violations) == 0:
            success_count += 1
        else:
            total_violations += len(violations)

    avg_score = score_sum / len(draws)
    success_rate = (success_count / len(draws)) * 100
    
    print(f"Average Harmony Score: {avg_score:.2f}")
    print(f"Full Harmony Rate (0 Violations): {success_rate:.1f}%")
    print(f"Total Contradictions Found: {total_violations} cases in {len(draws)} draws")
    
    if success_rate > 85:
        print("\n✅ [RESULT] 상관관계 로직 유효성 입증: 실제 당첨 번호의 85% 이상이 규칙을 준수함.")
    else:
        print("\n⚠️ [RESULT] 로직 튜닝 필요: 실제 당첨 번호와의 정합성이 낮음.")

if __name__ == "__main__":
    # JSON 로드 시 에러 방지 (import json_load 오타 수정 포함)
    import json as json_lib
    def patch_json():
        if not hasattr(json_lib, 'json_load'): json_lib.json_load = json_lib.load
    patch_json()
    run_correlation_backtest()
