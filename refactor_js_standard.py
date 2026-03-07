import os
import re

"""
AI Batch Refactor v1.0
- Automatically upgrades legacy JS calls to new modular standards.
- Targets: LottoUI.* -> LottoUI.Namespace.*
"""

def refactor_js():
    js_files = [f for f in os.listdir('.') if f.endswith('.js')]
    
    # 리팩토링 매핑 테이블
    replacements = {
        r'LottoUI\.renderMiniTable': 'LottoUI.Table.renderMini',
        r'LottoUI\.createCurveChart': 'LottoUI.Chart.curve',
        r'LottoUI\.renderMarkovHeatmap': 'LottoUI.Chart.markov',
        r'LottoUI\.createComboCard': 'LottoUI.Card.combo',
        r'LottoUI\.createBall': 'LottoUI.Ball.create',
        r'LottoUI\.showToast': 'LottoUI.Feedback.toast',
        r'LottoUI\.attachTooltip': 'LottoUI.Feedback.tooltip'
    }

    print("🚀 Starting Batch Refactoring...")

    for file_path in js_files:
        if file_path == 'ui_components.js' or file_path == 'core.js':
            continue # 라이브러리 본체는 제외
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        changes_in_file = 0
        
        for old, new in replacements.items():
            matches = len(re.findall(old, new_content))
            if matches > 0:
                new_content = re.sub(old, new, new_content)
                changes_in_file += matches

        if changes_in_file > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Refactored {file_path}: {changes_in_file} changes applied.")

    print("\n✨ All files have been upgraded to the latest standard.")

if __name__ == "__main__":
    refactor_js()
