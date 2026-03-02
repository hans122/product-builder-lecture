let statsData = null;

const INDICATOR_CONFIG = [
    { id: 'sum', label: '합계', statKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
    { id: 'odd-even', label: '홀수', statKey: 'odd_count', calc: (nums) => {
        const odds = nums.filter(n => n % 2 !== 0).length;
        return `${odds}:${6 - odds}`;
    }},
    { id: 'high-low', label: '저번호', statKey: 'low_count', calc: (nums) => {
        const lows = nums.filter(n => n <= 22).length;
        return `${lows}:${6 - lows}`;
    }},
    { id: 'period_1', label: '이월수', statKey: 'period_1', calc: (nums, data) => nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length + '개' },
    { id: 'neighbor', label: '이웃수', statKey: 'neighbor', calc: (nums, data) => {
        const neighbors = new Set();
        data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
        return nums.filter(n => neighbors.has(n)).length + '개';
    }},
    { id: 'ac', label: 'AC값', statKey: 'ac', calc: (nums) => calculate_ac(nums) }
];

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) { return num > 1 && !isPrime(num); }

function calculate_ac(nums) {
    const diffs = new Set();
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) { diffs.add(Math.abs(nums[i] - nums[j])); }
    }
    return diffs.size - (nums.length - 1);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow'; if (num <= 20) return 'blue';
    if (num <= 30) return 'red'; if (num <= 40) return 'gray'; return 'green';
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            if (data.last_3_draws && data.last_3_draws.length > 0) {
                const infoContainer = document.getElementById('last-draw-info');
                const ballContainer = document.getElementById('last-draw-balls');
                if (infoContainer && ballContainer) {
                    infoContainer.style.display = 'flex';
                    ballContainer.innerHTML = '';
                    data.last_3_draws[0].forEach(num => {
                        const ball = document.createElement('div');
                        ball.classList.add('ball', 'mini', getBallColorClass(num));
                        ball.innerText = num;
                        ballContainer.appendChild(ball);
                    });
                }
            }
            
            // [연동 핵심] 조합 분석에서 선택된 번호가 있다면 메인 그리드에 즉시 표시
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) {
                const numbers = JSON.parse(savedNumbers);
                analyzeNumbers(numbers);
            }
        })
        .catch(err => console.error('Stats load failed:', err));
});

function analyzeNumbers(numbers) {
    if (!statsData) { setTimeout(() => analyzeNumbers(numbers), 100); return; }
    const summary = statsData.stats_summary || {};

    const getZStatus = (val, stat) => {
        if (!stat || stat.std === 0) return 'safe';
        const numVal = typeof val === 'string' ? parseFloat(val.split(':')[0]) : val;
        const z = Math.abs(numVal - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    };

    INDICATOR_CONFIG.forEach(cfg => {
        const element = document.getElementById(cfg.id);
        if (!element) return;
        
        const value = cfg.calc(numbers, statsData);
        const status = getZStatus(value, summary[cfg.statKey]);
        updateAnalysisItem(element, value, status, cfg.label, summary[cfg.statKey]);
    });
}

function updateAnalysisItem(element, text, status, label, stat) {
    if (!element) return;
    element.innerText = text;
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.className = 'analysis-item ' + status;
        
        // 메인 페이지에서도 툴팁이 작동하도록 유도
        const optMin = Math.max(0, Math.round(stat.mean - stat.std));
        const optMax = Math.round(stat.mean + stat.std);
        const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
        const safeMax = Math.round(stat.mean + 2 * stat.std);
        
        // 부모가 링크(a) 형태라면 툴팁 속성 부여
        const link = element.closest('a') || parent;
        link.setAttribute('data-tip', `[${label}] 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})`);
        link.classList.add('analysis-item-link');
    }
}

// 불필요한 번호 생성 및 공유 로직 삭제 (사용자 요청)
function getZones(data) { return null; }
function getRandomFrom(array, count) { return []; }
