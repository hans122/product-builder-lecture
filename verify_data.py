import json
import os

"""
AI Data Verifier v1.0
- Validates advanced_stats.json and pension_stats.json schema
- Ensures key data points for charts and analysis
"""

def verify_lotto_data():
    path = 'advanced_stats.json'
    if not os.path.exists(path):
        print(f"❌ {path} missing!")
        return False
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    required_keys = ['total_draws', 'last_3_draws', 'stats_summary', 'distributions', 'frequency']
    for key in required_keys:
        if key not in data:
            print(f"❌ Lotto Error: '{key}' missing from {path}")
            return False
            
    # Check if stats_summary has core GL indicators
    gl_indicators = ['sum', 'odd_count', 'low_count', 'ac', 'span']
    for ind in gl_indicators:
        if ind not in data['stats_summary']:
            print(f"❌ Lotto Error: Indicator '{ind}' missing from stats_summary")
            return False
            
    print(f"✅ Lotto Data OK ({data['total_draws']} draws verified)")
    return True

def verify_pension_data():
    path = 'pension_stats.json'
    if not os.path.exists(path):
        print(f"❌ {path} missing!")
        return False
        
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    required_keys = ['total_draws', 'pos_freq', 'digit_gap', 'markov_matrix', 'recent_draws']
    for key in required_keys:
        if key not in data:
            print(f"❌ Pension Error: '{key}' missing from {path}")
            return False
            
    print(f"✅ Pension Data OK ({data['total_draws']} draws verified)")
    return True

if __name__ == "__main__":
    print("\n🔍 Validating Data Integrity for Vibe Coding...\n")
    lotto_ok = verify_lotto_data()
    pension_ok = verify_pension_data()
    
    if lotto_ok and pension_ok:
        print("\n✨ All Data Systems Operational. You are ready to Vibe!\n")
    else:
        print("\n⚠️ Data integrity issues found. Please run 'analyze_data.py' to rebuild.\n")
        exit(1)
