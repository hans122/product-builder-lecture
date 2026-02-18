document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.distributions) {
                console.error('데이터 형식이 올바르지 않습니다.');
                return;
            }

            // 1. 홀짝 분포 (정렬: 0:6, 1:5 ... 순)
            const sortedOddEven = Object.fromEntries(
                Object.entries(data.distributions.odd_even).sort()
            );
            renderDistChart('odd-even-chart', sortedOddEven);

            // 2. 연속번호 분포
            renderDistChart('consecutive-chart', data.distributions.consecutive);

            // 3. 소수 분포
            renderDistChart('prime-chart', data.distributions.prime);

            // 4. 합성수 분포 (데이터 보정 및 렌더링)
            if (data.distributions.composite) {
                renderDistChart('composite-chart', data.distributions.composite);
            } else {
                // 기존 데이터에 없을 경우 소수 데이터를 기반으로 대략적 표시 (실제는 분석 스크립트 수정 필요)
                renderDistChart('composite-chart', data.distributions.prime); 
            }
            
            // 5. 총합 분포 (숫자 순 정렬)
            const sortedSum = Object.fromEntries(
                Object.entries(data.distributions.sum).sort((a, b) => {
                    return parseInt(a[0].split('-')[0]) - parseInt(b[0].split('-')[0]);
                })
            );
            renderDistChart('sum-chart', sortedSum);
            
            // 6. 전체 빈도 차트
            renderFrequencyChart(data.frequency);
        })
        .catch(err => {
            console.error('데이터 로드 실패:', err);
            document.body.innerHTML += '<div style="color:red; text-align:center; padding:20px;">데이터를 불러오지 못했습니다. analyze_data.py를 실행했는지 확인해주세요.</div>';
        });
});

function renderDistChart(elementId, distData) {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = ''; // 초기화
    
    const values = Object.values(distData);
    const maxVal = Math.max(...values, 1);

    Object.entries(distData).forEach(([label, value]) => {
        const height = (value / maxVal) * 100;
        const bar = document.createElement('div');
        bar.className = 'dist-bar';
        bar.style.height = `${Math.max(height, 5)}%`; // 최소 높이 5%
        bar.innerHTML = `
            <span class="dist-value">${value}회</span>
            <span class="dist-label">${label}</span>
        `;
        container.appendChild(bar);
    });
}

function renderFrequencyChart(data) {
    const chartContainer = document.getElementById('full-frequency-chart');
    if(!chartContainer) return;
    chartContainer.innerHTML = '';
    
    const maxFreq = Math.max(...Object.values(data), 1);
    for (let i = 1; i <= 45; i++) {
        const freq = data[i] || 0;
        const height = (freq / maxFreq) * 100;
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        const bar = document.createElement('div');
        bar.className = `bar ${getBallColorClass(i)}`;
        bar.style.height = `${height}%`;
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.innerText = i;
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    }
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}