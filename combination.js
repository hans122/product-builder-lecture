let statsData = null;
let manualNumbers = new Set(); // 사용자가 직접 클릭한 번호
let autoNumbers = new Set();   // 시스템이 채워준 번호

function isPrime(num) {
    if (num <= 1) return false;
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    return primes.includes(num);
}

function isComposite(num) {
    return num > 1 && !isPrime(num);
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
    initNumberSelector();
    loadStatsData();
    
    // 저장된 번호 불러오기
    loadSavedSelection();

    document.getElementById('semi-auto-btn')?.addEventListener('click', semiAutoSelect);
    document.getElementById('reset-btn')?.addEventListener('click', resetSelection);
    document.getElementById('analyze-my-btn')?.addEventListener('click', runDetailedAnalysis);
});

function loadStatsData() {
    fetch('advanced_stats.json')
        .then(res => res.json())
        .then(data => {
            statsData = data;
            console.log('Stats loaded for analysis');
        })
        .catch(err => console.error('Stats load failed:', err));
}

function initNumberSelector() {
    const selector = document.getElementById('number-selector');
    if (!selector) return;
    selector.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
        const btn = document.createElement('button');
        btn.className = 'select-ball';
        btn.id = `select-ball-${i}`;
        btn.innerText = i;
        btn.type = 'button';
        btn.addEventListener('click', () => toggleNumber(i, btn));
        selector.appendChild(btn);
    }
}

// 번호 상태 저장 함수
function saveSelection() {
    const data = {
        manual: Array.from(manualNumbers),
        auto: Array.from(autoNumbers)
    };
    localStorage.setItem('combination_saved_picks', JSON.stringify(data));
}

// 저장된 번호 불러오기 및 UI 동기화
function loadSavedSelection() {
    const saved = localStorage.getItem('combination_saved_picks');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        manualNumbers = new Set(data.manual || []);
        autoNumbers = new Set(data.auto || []);
        
        // UI 마킹 동기화 (DOM 생성 후 실행되도록 약간의 지연 필요할 수 있음)
        setTimeout(() => {
            manualNumbers.forEach(num => {
                const btn = document.getElementById(`select-ball-${num}`);
                if (btn) btn.classList.add('selected-manual');
            });
            autoNumbers.forEach(num => {
                const btn = document.getElementById(`select-ball-${num}`);
                if (btn) btn.classList.add('selected');
            });
            updateSelectedBallsDisplay();
        }, 50);
    } catch (e) {
        console.error('Failed to load saved picks:', e);
    }
}

function toggleNumber(num, btn) {
    if (manualNumbers.has(num)) {
        manualNumbers.delete(num);
        btn.classList.remove('selected-manual');
    } else if (autoNumbers.has(num)) {
        autoNumbers.delete(num);
        btn.classList.remove('selected');
    } else {
        if (manualNumbers.size + autoNumbers.size >= 6) {
            alert('최대 6개까지만 선택 가능합니다.');
            return;
        }
        manualNumbers.add(num);
        btn.classList.add('selected-manual');
    }
    saveSelection(); // 상태 저장
    updateSelectedBallsDisplay();
}

function updateSelectedBallsDisplay() {
    const container = document.getElementById('selected-balls');
    const analyzeBtn = document.getElementById('analyze-my-btn');
    if (!container || !analyzeBtn) return;
    
    const totalCount = manualNumbers.size + autoNumbers.size;
    if (totalCount === 0) {
        container.innerHTML = '<div class="placeholder">번호를 선택해주세요</div>';
        analyzeBtn.disabled = true;
        return;
    }

    container.innerHTML = '';
    const allSelected = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    
    allSelected.forEach(num => {
        const ball = document.createElement('div');
        const colorClass = getBallColorClass(num);
        ball.className = `ball mini ${colorClass}`;
        if (manualNumbers.has(num)) ball.classList.add('manual');
        ball.innerText = num;
        container.appendChild(ball);
    });

    analyzeBtn.disabled = (totalCount !== 6);
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

function semiAutoSelect() {
    if (manualNumbers.size >= 6) return;
    autoNumbers.clear();
    const btns = document.querySelectorAll('.select-ball');
    btns.forEach((btn, idx) => {
        if (!manualNumbers.has(idx + 1)) btn.classList.remove('selected');
    });

    if (!statsData || !statsData.frequency) {
        while (manualNumbers.size + autoNumbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) autoNumbers.add(num);
        }
    } else {
        const zones = getZones(statsData);
        const weightedCandidates = [...zones.gold, ...zones.gold, ...zones.silver, ...zones.silver, ...zones.normal].filter(n => !manualNumbers.has(n));
        while (manualNumbers.size + autoNumbers.size < 6 && weightedCandidates.length > 0) {
            const idx = Math.floor(Math.random() * weightedCandidates.length);
            const num = weightedCandidates[idx];
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) autoNumbers.add(num);
            weightedCandidates.splice(idx, 1);
        }
        while (manualNumbers.size + autoNumbers.size < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!manualNumbers.has(num) && !autoNumbers.has(num)) autoNumbers.add(num);
        }
    }
    autoNumbers.forEach(num => {
        const btn = document.getElementById(`select-ball-${num}`);
        if (btn) btn.classList.add('selected');
    });
    saveSelection(); // 상태 저장
    updateSelectedBallsDisplay();
}

function resetSelection() {
    manualNumbers.clear();
    autoNumbers.clear();
    document.querySelectorAll('.select-ball').forEach(btn => btn.classList.remove('selected', 'selected-manual'));
    localStorage.removeItem('combination_saved_picks'); // 저장된 데이터 삭제
    updateSelectedBallsDisplay();
    const reportSection = document.getElementById('report-section');
    if (reportSection) reportSection.style.display = 'none';
}

function runDetailedAnalysis() {
    const totalCount = manualNumbers.size + autoNumbers.size;
    if (!statsData || totalCount !== 6) return;

    const reportBody = document.getElementById('analysis-report-body');
    const reportSection = document.getElementById('report-section');
    if (!reportBody || !reportSection) return;
    
    reportBody.innerHTML = '';
    reportSection.style.display = 'block';
    
    const nums = [...manualNumbers, ...autoNumbers].sort((a, b) => a - b);
    const summary = statsData.stats_summary || {};

    const getStatus = (val, statKey) => {
        const stat = summary[statKey];
        if (!stat || stat.std === 0) return 'safe';
        const z = Math.abs(val - stat.mean) / stat.std;
        if (z <= 1.0) return 'optimal';
        if (z <= 2.0) return 'safe';
        return 'warning';
    };

    // [G1] 기본 균형
    const sumVal = nums.reduce((a, b) => a + b, 0);
    addReportRow('[G1] 총합 분포', sumVal, getStatus(sumVal, 'sum'), '평균 ±1σ 이내 분석입니다.');
    const oddCnt = nums.filter(n => n % 2 !== 0).length;
    addReportRow('[G1] 홀:짝 비율', `${oddCnt}:${6-oddCnt}`, getStatus(oddCnt, 'odd_count'), '홀짝 균형 분석입니다.');
    const lowCnt = nums.filter(n => n <= 22).length;
    addReportRow('[G1] 고:저 비율', `${lowCnt}:${6-lowCnt}`, getStatus(lowCnt, 'low_count'), '고저 균형 분석입니다.');

    // [G2] 회차 상관관계
    if (statsData.last_3_draws) {
        const p1 = nums.filter(n => new Set(statsData.last_3_draws[0]).has(n)).length;
        addReportRow('[G2] 직전 1회차', `${p1}개`, getStatus(p1, 'period_1'), '이월수 매칭 분석입니다.');
        
        const prev_1 = new Set(statsData.last_3_draws[0]);
        const neighbors = new Set();
        prev_1.forEach(n => { if(n>1) neighbors.add(n-1); if(n<45) neighbors.add(n+1); });
        const neighborCnt = nums.filter(n => neighbors.has(n)).length;
        addReportRow('[G2] 이웃수(±1)', `${neighborCnt}개`, getStatus(neighborCnt, 'neighbor'), '직전회차 주변수 분석입니다.');

        const p1_2_set = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[])]);
        const p1_2 = nums.filter(n => p1_2_set.has(n)).length;
        addReportRow('[G2] 1~2회전 매칭', `${p1_2}개`, getStatus(p1_2, 'period_1_2'), '최근 흐름 분석입니다.');

        const p1_3_set = new Set([...statsData.last_3_draws[0], ...(statsData.last_3_draws[1]||[]), ...(statsData.last_3_draws[2]||[])]);
        const p1_3 = nums.filter(n => p1_3_set.has(n)).length;
        addReportRow('[G2] 1~3회전 매칭', `${p1_3}개`, getStatus(p1_3, 'period_1_3'), '누적 흐름 분석입니다.');
    }
    let consecutive = 0;
    for (let i=0; i<5; i++) if(nums[i]+1 === nums[i+1]) consecutive++;
    addReportRow('[G2] 연속번호 쌍', `${consecutive}쌍`, getStatus(consecutive, 'consecutive'), '번호 연속성 분석입니다.');

    // [G3] 특수 번호군
    const primeCnt = nums.filter(isPrime).length;
    addReportRow('[G3] 소수 포함', `${primeCnt}개`, getStatus(primeCnt, 'prime'), '수학적 소수 분포입니다.');
    const compositeCnt = nums.filter(isComposite).length;
    addReportRow('[G3] 합성수 포함', `${compositeCnt}개`, getStatus(compositeCnt, 'composite'), '합성수 포함 분석입니다.');
    const m3Cnt = nums.filter(n => n % 3 === 0).length;
    addReportRow('[G3] 3배수 포함', `${m3Cnt}개`, getStatus(m3Cnt, 'multiple_3'), '3의 배수 분포입니다.');
    const m5Cnt = nums.filter(n => n % 5 === 0).length;
    addReportRow('[G3] 5배수 포함', `${m5Cnt}개`, getStatus(m5Cnt, 'multiple_5'), '5의 배수 분포입니다.');
    const squareCnt = nums.filter(n => [1,4,9,16,25,36].includes(n)).length;
    addReportRow('[G3] 제곱수 포함', `${squareCnt}개`, getStatus(squareCnt, 'square'), '제곱수 포함 분석입니다.');
    const doubleCnt = nums.filter(n => [11,22,33,44].includes(n)).length;
    addReportRow('[G3] 쌍수 포함', `${doubleCnt}개`, getStatus(doubleCnt, 'double_num'), '동일숫자 반복 분포입니다.');

    // [G4] 구간 및 패턴
    const b15 = new Set(nums.map(n => Math.floor((n-1)/15))).size;
    addReportRow('[G4] 3분할 점유', `${b15}구간`, getStatus(b15, 'bucket_15'), '15개씩 3분할 분석입니다.');
    const b9 = new Set(nums.map(n => Math.floor((n-1)/9))).size;
    addReportRow('[G4] 5분할 점유', `${b9}구간`, getStatus(b9, 'bucket_9'), '9개씩 5분할 분석입니다.');
    const b5 = new Set(nums.map(n => Math.floor((n-1)/5))).size;
    addReportRow('[G4] 9분할 점유', `${b5}구간`, getStatus(b5, 'bucket_5'), '5개씩 9분할 분석입니다.');
    const b3 = new Set(nums.map(n => Math.floor((n-1)/3))).size;
    addReportRow('[G4] 15분할 점유', `${b3}구간`, getStatus(b3, 'bucket_3'), '3개씩 15분할 분석입니다.');
    const colorCnt = new Set(nums.map(getBallColorClass)).size;
    addReportRow('[G4] 색상수 분포', `${colorCnt}색`, getStatus(colorCnt, 'color'), '색상 그룹 점유 분석입니다.');
    const corners = [1, 2, 8, 9, 6, 7, 13, 14, 29, 30, 36, 37, 34, 35, 41, 42];
    const cornerCnt = nums.filter(n => corners.includes(n)).length;
    addReportRow('[G4] 모서리 패턴', `${cornerCnt}개`, getStatus(cornerCnt, 'pattern_corner'), '용지 외곽 분포입니다.');
    const triangles = [4, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 32];
    const triCnt = nums.filter(n => triangles.includes(n)).length;
    addReportRow('[G4] 삼각형 패턴', `${triCnt}개`, getStatus(triCnt, 'pattern_triangle'), '용지 중심 분포입니다.');

    // [G5] 전문지표
    const endSum = nums.reduce((a, b) => a + (b % 10), 0);
    addReportRow('[G5] 끝수 합계', endSum, getStatus(endSum, 'end_sum'), '일의 자리 합 분석입니다.');
    const endDigits = nums.map(n => n % 10);
    const sameEnd = Math.max(...Object.values(endDigits.reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {})));
    addReportRow('[G5] 동끝수 출현', `${sameEnd}개`, getStatus(sameEnd, 'same_end'), '동일 끝수 중복 분석입니다.');
    const acVal = calculate_ac(nums);
    addReportRow('[G5] AC값 분석', acVal, getStatus(acVal, 'ac'), '산술적 복잡도 분석입니다.');
    const spanVal = nums[5] - nums[0];
    addReportRow('[G5] Span 분석', spanVal, getStatus(spanVal, 'span'), '번호 간격 분석입니다.');

    setTimeout(() => { reportSection.scrollIntoView({ behavior: 'smooth' }); }, 100);
}

function addReportRow(label, value, statusClass, opinion) {
    const tbody = document.getElementById('analysis-report-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    let statusText = statusClass === 'optimal' ? '최적' : (statusClass === 'warning' ? '주의' : '세이프');
    tr.innerHTML = `<td><strong>${label}</strong></td><td>${value}</td><td><span class="status-badge ${statusClass}">${statusText}</span></td><td class="text-left">${opinion}</td>`;
    tbody.appendChild(tr);
}