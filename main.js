let statsData = null;

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) {
    if (num <= 1) return false;
    return !isPrime(num);
}

function calculate_ac(nums) {
    const diffs = new Set();
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            diffs.add(Math.abs(nums[i] - nums[j]));
        }
    }
    return diffs.size - (nums.length - 1);
}

function getBallColorClass(num) {
    if (num <= 10) return 'yellow';
    if (num <= 20) return 'blue';
    if (num <= 30) return 'red';
    if (num <= 40) return 'gray';
    return 'green';
}

document.addEventListener('DOMContentLoaded', function() {
    // 데이터 로드
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            console.log('Stats loaded successfully');
            
            // 직전 회차 정보 표시
            if (data.last_draw_numbers && data.total_draws) {
                const infoContainer = document.getElementById('last-draw-info');
                const ballContainer = document.getElementById('last-draw-balls');
                if (infoContainer && ballContainer) {
                    infoContainer.style.display = 'flex';
                    infoContainer.style.flexDirection = 'column';
                    infoContainer.style.alignItems = 'center';
                    ballContainer.innerHTML = '';
                    data.last_draw_numbers.forEach(num => {
                        const ball = document.createElement('div');
                        ball.classList.add('ball', 'mini', getBallColorClass(num));
                        ball.innerText = num;
                        ballContainer.appendChild(ball);
                    });
                    const label = infoContainer.querySelector('.label');
                    if (label) {
                        let drawDate = '';
                        if (data.recent_draws && data.recent_draws.length > 0) {
                            drawDate = ` (${data.recent_draws[0].date})`;
                        }
                        label.innerText = `직전 ${data.total_draws}회차 당첨 번호${drawDate}:`;
                    }
                }
            }

            // 데이터 로드 후 저장된 번호가 있다면 분석 실행
            const savedNumbers = localStorage.getItem('lastGeneratedNumbers');
            if (savedNumbers) {
                renderNumbers(JSON.parse(savedNumbers), false);
            }
        })
        .catch(err => {
            console.error('Stats load failed:', err);
        });
});

function analyzeNumbers(numbers) {
    if (!statsData) {
        console.warn('Stats data not yet loaded. Retrying in 100ms...');
        setTimeout(() => analyzeNumbers(numbers), 100);
        return;
    }

    const currentDraw = new Set(numbers);

    // 1. 직전 회차 출현 (이월수)
    let common = 0;
    if (statsData.last_draw_numbers) {
        const lastDraw = new Set(statsData.last_draw_numbers);
        common = [...currentDraw].filter(x => lastDraw.has(x)).length;
        const target = document.getElementById('period-1-count');
        if (target) {
            let status = 'normal';
            if (common >= 1 && common <= 2) status = 'optimal';
            else if (common >= 3) status = 'warning';
            updateAnalysisItem(target, `${common}개`, status);
        }

        const neighbors = new Set();
        statsData.last_draw_numbers.forEach(n => {
            if (n > 1) neighbors.add(n - 1);
            if (n < 45) neighbors.add(n + 1);
        });
        const neighborCommon = [...currentDraw].filter(x => neighbors.has(x)).length;
        const neighborTarget = document.getElementById('neighbor-count');
        if (neighborTarget) {
            let status = 'normal';
            if (neighborCommon >= 1 && neighborCommon <= 2) status = 'optimal';
            updateAnalysisItem(neighborTarget, `${neighborCommon}개`, status);
        }

        // 이월수 개별 출현 분석 업데이트
        const totalDraws = statsData.total_draws;
        const statsDataItems = statsData.distributions.period_1_stats;
        for (let i = 1; i <= 3; i++) {
            const target = document.getElementById(`p1-stats-${i}`);
            if (target && statsDataItems) {
                const count = statsDataItems[String(i)] || 0;
                const prob = ((count / totalDraws) * 100).toFixed(1);
                const valSpan = target.querySelector('.value');
                if (valSpan) valSpan.innerText = `${prob}%`;
                
                // 현재 생성된 번호가 정확히 이 개수이면 강조
                if (common === i) {
                    target.classList.add('optimal');
                    target.classList.remove('normal', 'warning');
                } else {
                    target.classList.add('normal');
                    target.classList.remove('optimal', 'warning');
                }
            }
        }
    }

    // 2. 기본 비율 및 수 분석
    const odds = numbers.filter(n => n % 2 !== 0).length;
    const oddEvenTarget = document.getElementById('odd-even-ratio');
    if (oddEvenTarget) {
        let status = 'normal';
        if (odds >= 2 && odds <= 4) status = 'optimal';
        updateAnalysisItem(oddEvenTarget, `${odds}:${6 - odds}`, status);
    }

    const lows = numbers.filter(n => n <= 22).length;
    const hlTarget = document.getElementById('high-low-ratio');
    if (hlTarget) {
        let status = 'normal';
        if (lows >= 2 && lows <= 4) status = 'optimal';
        updateAnalysisItem(hlTarget, `${lows}:${6 - lows}`, status);
    }

    const endSum = numbers.reduce((a, b) => a + (b % 10), 0);
    const endSumTarget = document.getElementById('end-sum-value');
    if (endSumTarget) {
        let status = (endSum >= 15 && endSum <= 35) ? 'optimal' : 'normal';
        updateAnalysisItem(endSumTarget, endSum, status);
    }

    const endDigits = numbers.map(n => n % 10);
    const digitCounts = {};
    endDigits.forEach(d => digitCounts[d] = (digitCounts[d] || 0) + 1);
    const maxSameEnd = Math.max(...Object.values(digitCounts));
    const sameEndTarget = document.getElementById('same-end-count');
    if (sameEndTarget) {
        let status = (maxSameEnd >= 2 && maxSameEnd <= 3) ? 'optimal' : 'normal';
        updateAnalysisItem(sameEndTarget, `${maxSameEnd}개`, status);
    }

    const squares = [1, 4, 9, 16, 25, 36];
    const squareCount = numbers.filter(n => squares.includes(n)).length;
    const squareTarget = document.getElementById('square-count');
    if (squareTarget) updateAnalysisItem(squareTarget, `${squareCount}개`, 'normal');

    const m5Count = numbers.filter(n => n % 5 === 0).length;
    const m5Target = document.getElementById('multiple-5-count');
    if (m5Target) updateAnalysisItem(m5Target, `${m5Count}개`, 'normal');

    const doubles = [11, 22, 33, 44];
    const doubleCount = numbers.filter(n => doubles.includes(n)).length;
    const doubleTarget = document.getElementById('double-count');
    if (doubleTarget) updateAnalysisItem(doubleTarget, `${doubleCount}개`, 'normal');

    // 3. 심화 분석: 구간 및 패턴
    const b15Count = new Set(numbers.map(n => Math.floor((n-1)/15))).size;
    const b15Target = document.getElementById('bucket-15-count');
    if (b15Target) updateAnalysisItem(b15Target, `${b15Count}구간`, b15Count >= 2 ? 'optimal' : 'normal');

    const b9Count = new Set(numbers.map(n => Math.floor((n-1)/9))).size;
    const b9Target = document.getElementById('bucket-9-count');
    if (b9Target) updateAnalysisItem(b9Target, `${b9Count}구간`, b9Count >= 3 ? 'optimal' : 'normal');

    const b5Count = new Set(numbers.map(n => Math.floor((n-1)/5))).size;
    const b5Target = document.getElementById('bucket-5-count');
    if (b5Target) updateAnalysisItem(b5Target, `${b5Count}구간`, b5Count >= 4 ? 'optimal' : 'normal');

    const b3Count = new Set(numbers.map(n => Math.floor((n-1)/3))).size;
    const b3Target = document.getElementById('bucket-3-count');
    if (b3Target) {
        let status = (b3Count >= 5) ? 'optimal' : 'normal';
        updateAnalysisItem(b3Target, `${b3Count}구간`, status);
    }

    const colorCnt = new Set(numbers.map(getBallColorClass)).size;
    const colorTarget = document.getElementById('color-count');
    if (colorTarget) updateAnalysisItem(colorTarget, `${colorCnt}색상`, colorCnt >= 3 ? 'optimal' : 'normal');

    const corners = new Set([1, 2, 8, 9, 6, 7, 13, 14, 29, 30, 36, 37, 34, 35, 41, 42]);
    const triangle = new Set([4, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 32]);
    const pCornerCnt = numbers.filter(n => corners.has(n)).length;
    const pTriCnt = numbers.filter(n => triangle.has(n)).length;
    
    const pcTarget = document.getElementById('pattern-corner-count');
    if (pcTarget) updateAnalysisItem(pcTarget, `${pCornerCnt}개`, 'normal');
    const ptTarget = document.getElementById('pattern-triangle-count');
    if (ptTarget) updateAnalysisItem(ptTarget, `${pTriCnt}개`, 'normal');

    // 4. 전문 지표
    const acVal = calculate_ac(numbers);
    const acTarget = document.getElementById('ac-value');
    if (acTarget) {
        let status = (acVal >= 7) ? 'optimal' : (acVal >= 6 ? 'normal' : 'warning');
        updateAnalysisItem(acTarget, acVal, status);
    }

    const spanVal = numbers[numbers.length - 1] - numbers[0];
    const spanTarget = document.getElementById('span-value');
    if (spanTarget) {
        let status = (spanVal >= 25 && spanVal <= 40) ? 'optimal' : 'normal';
        updateAnalysisItem(spanTarget, spanVal, status);
    }

    // 5. 기존 항목 마무리
    let consecutive = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] + 1 === numbers[i + 1]) consecutive++;
    }
    const consecutiveTarget = document.getElementById('consecutive-count');
    if (consecutiveTarget) {
        let status = (consecutive >= 1 && consecutive <= 2) ? 'optimal' : (consecutive >= 3 ? 'warning' : 'normal');
        updateAnalysisItem(consecutiveTarget, `${consecutive}쌍`, status);
    }

    const primeTarget = document.getElementById('prime-count');
    if (primeTarget) {
        const pCnt = numbers.filter(isPrime).length;
        let status = (pCnt >= 2 && pCnt <= 3) ? 'optimal' : 'normal';
        updateAnalysisItem(primeTarget, `${pCnt}개`, status);
    }

    const compositeTarget = document.getElementById('composite-count');
    if (compositeTarget) updateAnalysisItem(compositeTarget, `${numbers.filter(isComposite).length}개`, 'normal');

    const multiple3Target = document.getElementById('multiple-3-count');
    if (multiple3Target) updateAnalysisItem(multiple3Target, `${numbers.filter(n => n % 3 === 0).length}개`, 'normal');

    const sumTarget = document.getElementById('total-sum');
    if (sumTarget) {
        const totalSum = numbers.reduce((a, b) => a + b, 0);
        let status = (totalSum >= 120 && totalSum <= 180) ? 'optimal' : 'warning';
        updateAnalysisItem(sumTarget, totalSum, status);
    }
}

function updateAnalysisItem(element, text, status) {
    if (!element) return;
    element.innerText = text;
    // 부모 div (analysis-item)에 상태 클래스 추가
    const parent = element.closest('.analysis-item');
    if (parent) {
        parent.classList.remove('optimal', 'normal', 'warning');
        parent.classList.add(status);
    }
}

function renderNumbers(numbers, useAnimation = true) {
    const lottoContainer = document.getElementById('lotto-container');
    if (!lottoContainer) return;
    lottoContainer.innerHTML = ''; 

    numbers.forEach((num, index) => {
        const createBall = () => {
            const ball = document.createElement('div');
            ball.classList.add('ball', getBallColorClass(num));
            ball.innerText = num;
            lottoContainer.appendChild(ball);
            if (index === 5) analyzeNumbers(numbers);
        };

        if (useAnimation) {
            setTimeout(createBall, index * 100);
        } else {
            createBall();
        }
    });
}

document.getElementById('generate-btn')?.addEventListener('click', function() {
    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);

    localStorage.setItem('lastGeneratedNumbers', JSON.stringify(numbers));
    renderNumbers(numbers, true);
});