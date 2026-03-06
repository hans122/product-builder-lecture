import json
import os

"""
AI Data Verifier v1.2 (Deep Sanitizing)
- Validates JSON schema & key logic consistency
- Checks for number ranges, duplicates, and draw continuity
- Prevents 'Script error' caused by dirty data
"""

def verify_lotto_data():
    path = 'advanced_stats.json'
    if not os.path.exists(path):
        print(f"❌ {path} missing!")
        return False
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"❌ {path} is corrupted (Invalid JSON)!")
        return False
    
    # 1. 필수 키 검사
    required_keys = ['total_draws', 'last_3_draws', 'stats_summary', 'distributions', 'frequency']
    for key in required_keys:
        if key not in data:
            print(f"❌ Lotto Error: Key '{key}' missing")
            return False
            
    # 2. 데이터 무결성 심층 검사 (Sanitizing)
    draws = data.get('recent_draws', [])
    if not draws:
        print("⚠️ Warning: 'recent_draws' is empty.")
    else:
        # 회차 연속성 확인
        last_no = draws[0]['no']
        for i, d in enumerate(draws[1:]):
            if d['no'] != last_no - 1:
                print(f"⚠️ Warning: Continuity break detected at draw {d['no']} (Expected {last_no - 1})")
            last_no = d['no']
            
            # 숫자 유효성 (1~45, 6개, 중복없음)
            nums = d.get('nums', [])
            if len(nums) != 6:
                print(f"❌ Lotto Error: Invalid number count at draw {d['no']}: {len(nums)}")
                return False
            if not all(1 <= n <= 45 for n in nums):
                print(f"❌ Lotto Error: Number out of range at draw {d['no']}: {nums}")
                return False
            if len(set(nums)) != 6:
                print(f"❌ Lotto Error: Duplicate numbers at draw {d['no']}: {nums}")
                return False

    print(f"✅ Lotto Data Integrity Verified ({data['total_draws']} draws)")
    return True

def verify_pension_data():
    path = 'pension_stats.json'
    if not os.path.exists(path):
        print(f"❌ {path} missing!")
        return False
        
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"❌ {path} is corrupted (Invalid JSON)!")
        return False
        
    required_keys = ['total_draws', 'pos_freq', 'digit_gap', 'markov_matrix', 'recent_draws']
    for key in required_keys:
        if key not in data:
            print(f"❌ Pension Error: Key '{key}' missing")
            return False
            
    # 연금복권 심층 검사
    draws = data.get('recent_draws', [])
    if draws:
        for d in draws:
            nums = d.get('nums', [])
            if len(nums) != 6:
                print(f"❌ Pension Error: Invalid number count at draw {d['no']}: {len(nums)}")
                return False
            if not all(0 <= n <= 9 for n in nums):
                print(f"❌ Pension Error: Number out of range at draw {d['no']}: {nums}")
                return False
            if not (1 <= d.get('group', 0) <= 5):
                print(f"❌ Pension Error: Invalid group at draw {d['no']}: {d.get('group')}")
                return False

    print(f"✅ Pension Data Integrity Verified ({data['total_draws']} draws)")
    return True

if __name__ == "__main__":
    print("\n🔍 AI Data Guardian Running...\n")
    lotto_ok = verify_lotto_data()
    pension_ok = verify_pension_data()
    
    if lotto_ok and pension_ok:
        print("\n✨ All Systems Go. Data is Clean & Safe.\n")
    else:
        print("\n🚫 Data corruption detected. System Halt.\n")
        exit(1)
