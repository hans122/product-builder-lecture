import os
import subprocess
import sys
import re
import csv
from datetime import datetime, timedelta

"""
AI Data Smart-Sync Hub v3.0 (v32.3)
- SMART: Only updates data if > 7 days old
- SMART: Only runs analysis if data changed or engine modified
- ALWAYS: Version Bump & Vibe Sync (for UI reflection)
"""

# 핵심 엔진 파일 리스트 (수정 감지용)
ENGINE_FILES = [
    'analyze_data.py', 
    'unified_engine.js', 
    'indicators.js', 
    'lotto_utils.js',
    'analysis_engine.js',
    'unified_engine.js'
]

def run_step(name, command):
    print(f"--- [STEP] {name} ---")
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

def check_lotto_date_needs_update():
    """CSV의 최신 날짜를 확인하여 7일 이상 지났는지 판별"""
    try:
        if not os.path.exists('lt645.csv'): return True
        with open('lt645.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader) # 헤더 스킵
            latest_row = next(reader) # 2행 (최신 데이터)
            # '2026.02.28' 형태에서 따옴표 제거 후 파싱
            date_str = latest_row[1].replace("'", "")
            last_date = datetime.strptime(date_str, '%Y.%m.DD')
            
            # 7일 + 12시간 여유 (토요일 밤 당첨 확인용)
            if datetime.now() - last_date > timedelta(days=7, hours=12):
                print(f"📅 Last data is from {date_str}. Time for an update!")
                return True
            return False
    except Exception as e:
        print(f"⚠️ Date check failed ({e}), defaulting to update.")
        return True

def check_engine_modified():
    """엔진 파일들이 분석 결과물(advanced_stats.json)보다 최신인지 확인"""
    try:
        stats_file = 'advanced_stats.json'
        if not os.path.exists(stats_file): return True
        
        stats_mtime = os.path.getmtime(stats_file)
        for f in ENGINE_FILES:
            if os.path.exists(f) and os.path.getmtime(f) > stats_mtime:
                print(f"🛠️ Engine file '{f}' was modified. Re-analysis needed.")
                return True
        return False
    except:
        return True

def bump_version():
    print("--- [STEP] Auto Version Bump ---")
    try:
        with open('core.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.search(r"SYSTEM_VERSION:\s*'([\d.]+)'", content)
        if not match:
            print("❌ Could not find SYSTEM_VERSION in core.js")
            return False
        
        current_version = match.group(1)
        v_parts = current_version.split('.')
        v_parts[-1] = str(int(v_parts[-1]) + 1)
        new_version = '.'.join(v_parts)
        
        new_content = re.sub(r"SYSTEM_VERSION:\s*'[\d.]+'", f"SYSTEM_VERSION: '{new_version}'", content)
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
    print(f"🚀 AI Smart-Sync Start: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")

    # 1. 데이터 업데이트 여부 확인
    needs_data = check_lotto_date_needs_update()
    
    # 2. 분석 필요 여부 확인 (데이터가 새롭거나 엔진이 바뀌었을 때)
    needs_analysis = needs_data or check_engine_modified()

    # 3. 데이터 업데이트 실행
    if needs_data:
        if not run_step("Lotto Update", "update_latest.py"): return
        if not run_step("Pension Update", "update_pension.py"): return
    else:
        print("⏭️ Data is up-to-date. Skipping download.")

    # 4. 분석 및 검증 실행
    if needs_analysis:
        if not run_step("Deep Analysis", "analyze_data.py"): return
        if not run_step("Logic Verification", "verify_logic_match.py"): return
        # [v32.90] JS 무결성 검사 추가
        if not run_step("JS Integrity Check", "verify_js_integrity.py"): return
    else:
        print("⏭️ No logic or data changes. Skipping deep analysis.")

    # 5. 버전 및 리소스 동기화 (항상 실행)
    # 평소에는(needs_analysis가 아닐 때도) 가벼운 JS 검사는 수행하여 안전성 확보
    if not needs_analysis:
        if not run_step("JS Fast Check", "verify_js_integrity.py"): return

    if not bump_version(): return
    if not run_step("Vibe Sync", "node sync_version.cjs"): return

    duration = datetime.now() - start_time
    mode = "FULL" if needs_analysis else "FAST"
    print(f"\n✨ [ALL DONE] System updated in {mode} mode! (Time: {duration.total_seconds():.1f}s)")

if __name__ == "__main__":
    main()
