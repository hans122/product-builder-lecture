'use strict';

/**
 * AI Computation Worker v1.4 (Unified Logic Bridge)
 * - Offloads heavy calculations to LottoAI.generateSmartCombinations
 * - Zero duplicated logic between core and worker
 */

importScripts('lotto_utils.js', 'indicators.js', 'unified_engine.js');

var LottoAI = self.LottoAI;
var LottoUtils = self.LottoUtils;
var LottoConfig = self.LottoConfig;

self.onmessage = function(e) {
    var task = e.data;
    try {
        if (task.type === 'GENERATE_COMBINATIONS') {
            // [v32.1] 통합 엔진의 표준 생성 메서드 호출
            var result = LottoAI.generateSmartCombinations(
                task.pools, 
                task.strategies, 
                task.statsData, 
                task.synergyMatrix
            );
            self.postMessage({ type: task.type, result: result, id: task.id });
        } else if (task.type === 'CALC_PROBABILITY') {
            var res = LottoAI.calculateWinProbability(task.nums, task.isPension, task.statsData);
            self.postMessage({ type: task.type, result: res, id: task.id });
        }
    } catch(err) {
        self.postMessage({ type: 'ERROR', error: err.toString(), id: task.id });
    }
};
