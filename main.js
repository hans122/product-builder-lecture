let statsData = null;

const INDICATOR_CONFIG = [
    { id: 'total-sum', label: '합계', statKey: 'sum', calc: (nums) => nums.reduce((a, b) => a + b, 0) },
    { id: 'odd-even-ratio', label: '홀수', statKey: 'odd_count', calc: (nums) => {
        const odds = nums.filter(n => n % 2 !== 0).length;
        return `${odds}:${6 - odds}`;
    }},
    { id: 'high-low-ratio', label: '저번호', statKey: 'low_count', calc: (nums) => {
        const lows = nums.filter(n => n <= 22).length;
        return `${lows}:${6 - lows}`;
    }},
    { id: 'period-1-count', label: '이월수', statKey: 'period_1', calc: (nums, data) => nums.filter(n => new Set(data.last_3_draws[0]).has(n)).length + '개' },
    { id: 'neighbor-count', label: '이웃수', statKey: 'neighbor', calc: (nums, data) => {
        const neighbors = new Set();
        data.last_3_draws[0].forEach(n => { if (n > 1) neighbors.add(n - 1); if (n < 45) neighbors.add(n + 1); });
        return nums.filter(n => neighbors.has(n)).length + '개';
    }},
    { id: 'p1-cum-2', selector: '#p1-cum-2 .value', label: '1~2회전', statKey: 'period_1_2', calc: (nums, data) => nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[])]).has(n)).length + '개' },
    { id: 'p1-cum-3', selector: '#p1-cum-3 .value', label: '1~3회전', statKey: 'period_1_3', calc: (nums, data) => nums.filter(n => new Set([...data.last_3_draws[0], ...(data.last_3_draws[1]||[]), ...(data.last_3_draws[2]||[])]).has(n)).length + '개' },
    { id: 'consecutive-count', label: '연번', statKey: 'consecutive', calc: (nums) => {
        let cnt = 0; for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) cnt++;
        return cnt + '쌍';
    }},
    { id: 'prime-count', label: '소수', statKey: 'prime', calc: (nums) => nums.filter(isPrime).length + '개' },
    { id: 'composite-count', label: '합성수', statKey: 'composite', calc: (nums) => nums.filter(isComposite).length + '개' },
    { id: 'multiple-3-count', label: '3배수', statKey: 'multiple_3', calc: (nums) => nums.filter(n => n % 3 === 0).length + '개' },
    { id: 'multiple-5-count', label: '5배수', statKey: 'multiple_5', calc: (nums) => nums.filter(n => n % 5 === 0).length + '개' },
    { id: 'square-count', label: '제곱수', statKey: 'square', calc: (nums) => nums.filter(n => [1,4,9,16,25,36].includes(n)).length + '개' },
    { id: 'double-count', label: '쌍수', statKey: 'double_num', calc: (nums) => nums.filter(n => [11,22,33,44].includes(n)).length + '개' },
    { id: 'bucket-15-count', label: '3분할', statKey: 'bucket_15', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/15))).size + '구간' },
    { id: 'bucket-9-count', label: '5분할', statKey: 'bucket_9', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/9))).size + '구간' },
    { id: 'bucket-5-count', label: '9분할', statKey: 'bucket_5', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/5))).size + '구간' },
    { id: 'bucket-3-count', label: '15분할', statKey: 'bucket_3', calc: (nums) => new Set(nums.map(n => Math.floor((n-1)/3))).size + '구간' },
    { id: 'color-count', label: '색상수', statKey: 'color', calc: (nums) => new Set(nums.map(getBallColorClass)).size + '색' },
    { id: 'pattern-corner-count', label: '모서리', statKey: 'pattern_corner', calc: (nums) => {
        const corners = [1,2,8,9,6,7,13,14,29,30,36,37,34,35,41,42];
        return nums.filter(n => corners.includes(n)).length + '개';
    }},
    { id: 'pattern-triangle-count', label: '삼각형', statKey: 'pattern_triangle', calc: (nums) => {
        const triangle = [4,10,11,12,16,17,18,19,20,24,25,26,32];
        return nums.filter(n => triangle.includes(n)).length + '개';
    }},
    { id: 'end-sum-value', label: '끝수합', statKey: 'end_sum', calc: (nums) => nums.reduce((a, b) => a + (b % 10), 0) },
    { id: 'same-end-count', label: '동끝수', statKey: 'same_end', calc: (nums) => {
        const ends = nums.map(n => n % 10);
        return Math.max(...Object.values(ends.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {}))) + '개';
    }},
    { id: 'ac-value', label: 'AC값', statKey: 'ac', calc: (nums) => calculate_ac(nums) },
    { id: 'span-value', label: 'Span', statKey: 'span', calc: (nums) => nums[5] - nums[0] }
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
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) renderNumbers(JSON.parse(savedNumbers), false);
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

    // [데이터 기반 자동화 루프]
    INDICATOR_CONFIG.forEach(cfg => {
        const element = cfg.selector ? document.querySelector(cfg.selector) : document.getElementById(cfg.id);
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
        const link = element.closest('.analysis-item-link');
        if (link && stat) {
            const optMin = Math.max(0, Math.round(stat.mean - stat.std));
            const optMax = Math.round(stat.mean + stat.std);
            const safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            const safeMax = Math.round(stat.mean + 2 * stat.std);
            link.setAttribute('data-tip', `[${label}] 권장 세이프: ${safeMin}~${safeMax} (옵티멀: ${optMin}~${optMax})`);
        }
    }
}

function renderNumbers(numbers, useAnimation = true) {
    const lottoContainer = document.getElementById('lotto-container');
    if (!lottoContainer) return;
    lottoContainer.innerHTML = ''; 
    numbers.forEach((num, index) => {
        const createBall = () => {
            const ball = document.createElement('div');
            ball.className = 'ball ' + getBallColorClass(num);
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            if (index === 5) { analyzeNumbers(numbers); showSharePrompt(numbers); }
        };
        if (useAnimation) setTimeout(createBall, index * 100);
        else createBall();
    });
}

function showSharePrompt(numbers) {
    const shareSection = document.getElementById('share-prompt-section');
    const copyBtn = document.getElementById('copy-share-btn');
    if (!shareSection || !copyBtn) return;
    shareSection.style.display = 'block';
    const newBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newBtn, copyBtn);
    newBtn.addEventListener('click', function() {
        const templates = [
            `이번 주 1등 예감! ✨ 제가 뽑은 행운의 번호는 [ ${numbers.join(', ')} ] 입니다. 다들 기운 받아가세요! 🍀`,
            `빅데이터가 골라준 오늘의 추천 번호: [ ${numbers.join(', ')} ] 이 번호 어떤가요? 댓글로 의견 부탁드려요! 📊`,
            `로또 당첨 가즈아! 🚀 공유된 제 번호는 [ ${numbers.join(', ')} ] 입니다. 같이 대박 나요! 💰`
        ];
        const textToCopy = templates[Math.floor(Math.random() * templates.length)];
        navigator.clipboard.writeText(textToCopy).then(() => {
            const status = document.getElementById('copy-status');
            if (status) {
                status.innerText = '✅ 번호와 응원 문구가 복사되었습니다! 댓글창으로 이동합니다.';
                setTimeout(() => { status.innerText = ''; document.getElementById('disqus_thread').scrollIntoView({ behavior: 'smooth' }); }, 1000);
            }
        });
    });
}

function getZones(data) {
    const freq = data.frequency || {};
    const recentFreq = data.recent_20_frequency || {};
    const scores = [];
    for (let i = 1; i <= 45; i++) {
        const cumulative = freq[i] || 0;
        const recent = recentFreq[i] || 0;
        const totalScore = (cumulative * 0.4) + (recent * 25.0 * 0.6); 
        scores.push({ num: i, score: totalScore });
    }
    scores.sort((a, b) => b.score - a.score);
    return {
        gold: scores.slice(0, 9).map(x => x.num),
        silver: scores.slice(9, 23).map(x => x.num),
        normal: scores.slice(23, 36).map(x => x.num),
        cold: scores.slice(36).map(x => x.num)
    };
}

function getRandomFrom(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

document.getElementById('generate-btn')?.addEventListener('click', function() {
    if (!statsData || !statsData.frequency) {
        const nums = []; while(nums.length < 6) { const n = Math.floor(Math.random() * 45) + 1; if(!nums.includes(n)) nums.push(n); }
        nums.sort((a, b) => a - b); renderNumbers(nums, true); return;
    }
    const zones = getZones(statsData);
    let numbers = [...getRandomFrom(zones.gold, 2), ...getRandomFrom(zones.silver, 3), ...getRandomFrom(zones.normal, 1)];
    numbers.sort((a, b) => a - b);
    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));
    renderNumbers(numbers, true);
});
