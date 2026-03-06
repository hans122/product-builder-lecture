'use strict';

/**
 * AI Pension 720+ Utility Library v1.0
 * - Specialized logic for Pension Lottery data analysis
 * - Pattern, Balance, and Dynamics Analyzers
 */

var PensionUtils = {
    /** 1. 패턴 분석 (연속, 중복 등) */
    analyzePatterns: function(nums) {
        var seq = 0, counts = {};
        for(var i=0; i<nums.length; i++) {
            var n = Number(nums[i]); counts[n] = (counts[n] || 0) + 1;
            if(i > 0 && Math.abs(n - Number(nums[i-1])) === 1) seq++;
        }
        var maxOccur = Math.max.apply(null, Object.values(counts));
        var adjRep = 0; Object.values(counts).forEach(function(v) { if(v > 1) adjRep += (v - 1); });
        var unique = Object.keys(counts).length;
        return { seq: seq, adjRep: adjRep, maxOccur: maxOccur, unique: unique };
    },

    /** 2. 밸런스 분석 (합계, 홀짝 등) */
    analyzeBalance: function(nums) {
        var sum = 0, odd = 0, low = 0, prime = 0;
        nums.forEach(function(n) {
            var val = Number(n); sum += val;
            if(val % 2 !== 0) odd++;
            if(val <= 4) low++;
            if([2,3,5,7].includes(val)) prime++;
        });
        return { sum: sum, odd: odd, low: low, prime: prime };
    },

    /** 3. 동적 흐름 분석 (이월, 이웃) */
    analyzeDynamics: function(nums, prevNums) {
        var carry = 0, carryGlobal = 0, neighbor = 0;
        if(!prevNums) return { carry: 0, carryGlobal: 0, neighbor: 0 };
        for(var i=0; i<6; i++) {
            var n = Number(nums[i]);
            var prevArr = prevNums.map(Number);
            if(n === Number(prevNums[i])) carry++;
            if(prevArr.indexOf(n) !== -1) carryGlobal++;
            if(prevArr.some(function(p) { return Math.abs(p - n) === 1; })) neighbor++;
        }
        return { carry: carry, carryGlobal: carryGlobal, neighbor: neighbor };
    }
};
