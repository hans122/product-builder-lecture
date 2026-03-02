const fs = require('fs');
const data = JSON.parse(fs.readFileSync('advanced_stats.json', 'utf8'));
const allDraws = data.recent_draws;

function getPredictionPoolsForRound(allDraws, currentIndex) {
    const history = allDraws.slice(currentIndex + 1);
    if (history.length < 10) return [];

    const lastDraw = history[0];
    const scores = [];

    for (let i = 1; i <= 45; i++) {
        let score = 0;
        const freq10 = history.slice(0, 10).filter(d => d.nums.includes(i)).length;
        score += freq10 * 15;

        let gap = 0;
        for (let d = 0; d < history.length; d++) {
            if (history[d].nums.includes(i)) { gap = d; break; }
        }
        if (gap >= 5 && gap <= 15) score += 25;
        else if (gap > 30) score -= 15;

        if (lastDraw.nums.includes(i)) score += 12;
        
        const neighbors = new Set();
        lastDraw.nums.forEach(n => { if(n>1) neighbors.add(n-1); if(n<45) neighbors.add(n+1); });
        if (neighbors.has(i)) score += 20;

        scores.push({ num: i, score: score, freq10, gap, isCarry: lastDraw.nums.includes(i), isNeighbor: neighbors.has(i) });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores;
}

// 1213회차 분석 (currentIndex: -1 이면 최신 1213회차 분석이므로, 
// 1213회차 '결과'가 나오기 전 시뮬레이션을 위해 1213회차의 인덱스를 0으로 보고 currentIndex를 0으로 설정)
const results = getPredictionPoolsForRound(allDraws, 0);
console.log("--- 1213회차 분석 결과 (Score Top 40) ---");
results.slice(0, 40).forEach((s, idx) => {
    console.log(`${idx + 1}위: 번호 ${s.num} | 점수 ${s.score} (빈도10: ${s.freq10}, Gap: ${s.gap}, 이월: ${s.isCarry}, 이웃: ${s.isNeighbor})`);
});
