import os
import re
import sys

"""
JS Integrity Guardian v1.0
- Scans all JS files for syntax errors and deprecated calls.
- Ensures LottoUI namespace consistency.
"""

def check_js_files():
    js_files = [f for f in os.listdir('.') if f.endswith('.js')]
    errors = 0
    warnings = 0

    legacy_patterns = {
        r'LottoUI\.renderMiniTable': 'LottoUI.Table.renderMini',
        r'LottoUI\.createCurveChart': 'LottoUI.Chart.curve',
        r'LottoUI\.renderMarkovHeatmap': 'LottoUI.Chart.markov',
        r'LottoUI\.createComboCard': 'LottoUI.Card.combo',
        r'LottoUI\.createBall': 'LottoUI.Ball.create',
        r'LottoUI\.showToast': 'LottoUI.Feedback.toast',
        r'LottoUI\.attachTooltip': 'LottoUI.Feedback.tooltip'
    }

    print("🚀 Starting JS Integrity Check...")

    for file_path in js_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')

            # 1. 문법 체크 (기본적인 괄호 짝 검사)
            if content.count('{') != content.count('}'):
                print(f"❌ [ERROR] Braces mismatch in {file_path}")
                errors += 1
            
            # 2. 구버전 호출 체크
            for pattern, replacement in legacy_patterns.items():
                matches = re.finditer(pattern, content)
                for match in matches:
                    line_no = content[:match.start()].count('\n') + 1
                    print(f"⚠️ [WARN] {file_path}:{line_no} - Deprecated call found: {match.group()}. Suggest using: {replacement}")
                    warnings += 1

    print(f"\n✅ Scan Complete: {errors} Errors, {warnings} Warnings.")
    return errors == 0

if __name__ == "__main__":
    if not check_js_files():
        sys.exit(1)
    sys.exit(0)
