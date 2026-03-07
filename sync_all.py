import os
import subprocess
import sys
from datetime import datetime

"""
AI Data Auto-Sync Hub v1.0 (v29.0)
1. Update Lotto 6/45 Data (lt645.csv)
2. Update Pension 720+ Data (pt720.csv)
3. Run Deep Analysis (generate advanced_stats.json)
4. Verify Logic Integrity
"""

def run_step(name, command):
    print(f"\n--- [STEP] {name} ---")
    try:
        # Use sys.executable to ensure we use the same python version
        result = subprocess.run([sys.executable] + command.split(), capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} Success.")
            print(result.stdout.strip())
            return True
        else:
            print(f"❌ {name} Failed.")
            print(result.stderr.strip())
            return False
    except Exception as e:
        print(f"💥 Error running {name}: {str(e)}")
        return False

def main():
    start_time = datetime.now()
    print(f"🚀 AI Unified Sync Start: {start_time}")

    steps = [
        ("Lotto Update", "update_latest.py"),
        ("Pension Update", "update_pension.py"),
        ("Deep Analysis", "analyze_data.py"),
        ("Logic Verification", "verify_logic_match.py")
    ]

    success_all = True
    for name, cmd in steps:
        if not run_step(name, cmd):
            success_all = False
            break

    end_time = datetime.now()
    duration = end_time - start_time
    
    if success_all:
        print(f"\n✨ All systems synchronized perfectly! (Time: {duration.total_seconds():.1f}s)")
    else:
        print("\n⚠️ Sync failed during one of the steps. Check logs.")

if __name__ == "__main__":
    main()
