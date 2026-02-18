import csv
import json
from collections import Counter

# CSV 파일 읽기
numbers = []
with open('lt645.csv', mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # 각 행에서 당첨번호 1~6을 추출하여 숫자로 변환
        for i in range(1, 7):
            key = f'당첨번호{i}'
            if key in row:
                numbers.append(int(row[key]))

# 각 숫자의 빈도 계산 (1~45)
frequency = Counter(numbers)
# 모든 숫자(1-45)에 대해 데이터가 있도록 보장
full_frequency = {str(i): frequency.get(i, 0) for i in range(1, 46)}

# 결과를 JSON 파일로 저장
with open('frequency.json', 'w', encoding='utf-8') as f:
    json.dump(full_frequency, f, ensure_ascii=False, indent=4)

print("Frequency data generated!")
