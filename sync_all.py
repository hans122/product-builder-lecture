import os
import subprocess
import sys
import re
from datetime import datetime

"""
AI Data Auto-Sync Hub v2.0 (v32.2)
1. Update Lotto & Pension Data
2. Run Deep Analysis
3. Verify Logic Integrity
4. Auto Version Bump (core.js)
5. Vibe Sync (HTML Resources)
"""

def run_step(name, command):
    print(f"\n--- [STEP] {name} ---")
    try:
        cmd = [sys.executable] + command.split() if command.endswith(".py") else command.split()
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} Success.")
            if result.stdout: print(result.stdout.strip())
            return True
        else:
            print(f"❌ {name} Failed.")
            print(result.stderr.strip())
            return False
    except Exception as e:
        print(f"💥 Error running {name}: {str(e)}")
        return False

def bump_version():
    print("\n--- [STEP] Auto Version Bump ---")
    try:
        with open('core.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # SYSTEM_VERSION: 'X.X' 패턴 찾기
        match = re.search(r"SYSTEM_VERSION:\s*'([\d.]+)'", content)
        if not match:
            print("❌ Could not find SYSTEM_VERSION in core.js")
            return False
        
        current_version = match.group(1)
        v_parts = current_version.split('.')
        # 마지막자리 버전업 (e.g., 32.1 -> 32.2)
        v_parts[-1] = str(int(v_parts[-1]) + 1)
        new_version = '.'.join(v_parts)
        
        new_content = re.sub(r"SYSTEM_VERSION:\s*'[\d.]+'", f"SYSTEM_VERSION: '{new_version}'", content)
        # 릴리즈 날짜도 오늘로 갱신 (RELEASE_DATE 필드가 있을 경우)
        today = datetime.now().strftime('%Y-%m-%d')
        new_content = re.sub(r"RELEASE_DATE:\s*'[\d-]+'", f"RELEASE_DATE: '{today}'", new_content)
        
        with open('core.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"🚀 Version Bumped: v{current_version} -> v{new_version}")
        return True
    except Exception as e:
        print(f"💥 Error during Version Bump: {str(e)}")
        return False

def main():
    start_time = datetime.now()
    print(f"🚀 AI Unified Sync Start: {start_time}")

    # 1~3단계: 데이터 및 분석
    steps = [
        ("Lotto Update", "update_latest.py"),
        ("Pension Update", "update_pension.py"),
        ("Deep Analysis", "analyze_data.py"),
        ("Logic Verification", "verify_logic_match.py")
    ]

    for name, cmd in steps:
        if not run_step(name, cmd): return

    # 4단계: 버전 자동 업그레이드
    if not bump_version(): return

    # 5단계: 리소스 파라미터 동기화
    if not run_step("Vibe Sync", "node sync_version.cjs"): return

    duration = datetime.now() - start_time
    print(f"\n✨ [ALL DONE] System is now fully updated and synchronized! (Time: {duration.total_seconds():.1f}s)")

if __name__ == "__main__":
    main()
