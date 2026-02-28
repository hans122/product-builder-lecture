import json

def calculate_zones():
    with open('frequency.json', 'r') as f:
        freq_data = json.load(f)
    
    # 정렬: 빈도수가 높은 순서대로 (빈도수, 번호)
    sorted_freq = sorted(freq_data.items(), key=lambda x: x[1], reverse=True)
    
    total_numbers = 45
    # 상위 20% (9개), 상위 50% (23개), 상위 80% (36개)
    gold_limit = 9
    silver_limit = 23
    normal_limit = 36
    
    gold_zone = [int(num) for num, freq in sorted_freq[:gold_limit]]
    silver_zone = [int(num) for num, freq in sorted_freq[gold_limit:silver_limit]]
    normal_zone = [int(num) for num, freq in sorted_freq[silver_limit:normal_limit]]
    cold_zone = [int(num) for num, freq in sorted_freq[normal_limit:]]
    
    # 실제 빈도 비중 계산
    total_hits = sum(freq_data.values())
    gold_hits = sum(freq_data[str(n)] for n in gold_zone)
    silver_hits = sum(freq_data[str(n)] for n in silver_zone)
    
    print(f"전체 출현 횟수: {total_hits}")
    print(f"--- 영역 구분 (파레토 80:20 기준 적용) ---")
    print(f"1. 골드존 (상위 20% - 9개 번호): {sorted(gold_zone)}")
    print(f"   - 비중: {gold_hits/total_hits*100:.2f}% (9개 번호가 전체의 약 20% 이상 차지)")
    print(f"2. 실버존 (다음 30% - 14개 번호): {sorted(silver_zone)}")
    print(f"   - 비중: {silver_hits/total_hits*100:.2f}%")
    print(f"3. 일반존 (다음 30% - 13개 번호): {sorted(normal_zone)}")
    print(f"4. 콜드존 (하위 20% - 9개 번호): {sorted(cold_zone)}")

if __name__ == "__main__":
    calculate_zones()
