import json
import os
import math

def calculate_ac(nums):
    diffs = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            diffs.add(abs(nums[i] - nums[j]))
    return len(diffs) - (len(nums) - 1)

def analyze_winning_scores():
    if not os.path.exists('advanced_stats.json'):
        print("❌ advanced_stats.json file not found.")
        return

    with open('advanced_stats.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    summary = data.get('stats_summary', {})
    actual_draws = data.get('recent_draws', [])[:100]
    
    scores = []
    
    for draw in actual_draws:
        nums = draw['nums']
        
        # 1. 기본 지표 적합도 (95% 존 통과 여부)
        total_penalty = 0
        for key in ["sum", "ac", "odd_count", "low_count", "end_sum", "span", "mean_gap", "empty_zone", "prime", "consecutive"]:
            if key in draw and key in summary:
                val = draw[key]
                s = summary[key]
                # Z-Score 계산
                z = (val - s['mean']) / s['std'] if s['std'] != 0 else 0
                
                # μ±2.0σ (95% 존) 이탈 시 감점
                if abs(z) > 2.0:
                    total_penalty += 15
                elif abs(z) > 1.5:
                    total_penalty += 5

        # 2. 100점 만점 환산 (기본 100점 시작)
        score = 100 - total_penalty
        score = max(0, min(100, score))
        scores.append(score)

    # 3. 분포 분석
    distribution = {
        "90-100 (S)": len([s for s in scores if s >= 90]),
        "80-89 (A)": len([s for s in scores if 80 <= s < 90]),
        "75-79 (B+)": len([s for s in scores if 75 <= s < 80]),
        "70-74 (B)": len([s for s in scores if 70 <= s < 75]),
        "Below 70 (C)": len([s for s in scores if s < 70])
    }

    print("\n--- 📊 역대 당첨번호(최근 100회) 시너지 점수 분포 분석 ---")
    for grade, count in distribution.items():
        percentage = (count / len(scores)) * 100
        bar = "█" * (count // 2)
        print(f"{grade:12}: {count:2}회 ({percentage:4.1f}%) {bar}")
    
    avg_score = sum(scores) / len(scores)
    print(f"\n✅ 평균 시너지 점수: {avg_score:.1f}점")
    
    if avg_score < 80:
        print("\n💡 결론: 실제 당첨 번호의 평균이 80점 미만입니다. 80점 기준은 너무 높을 수 있습니다.")
    else:
        print("\n💡 결론: 실제 당첨 번호들이 80점 이상에 집중되어 있습니다. 현재 기준이 적절합니다.")

if __name__ == "__main__":
    analyze_winning_scores()
