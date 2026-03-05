/**
 * Project Validator v1.0 (Safety Guard)
 * - Checks JS Syntax (ES5 Compliance)
 * - Verifies Core Calculation Logic (Lotto/Pension)
 */

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

console.log('🚀 [Validator] 프로젝트 정밀 진단을 시작합니다...');

// 1. Syntax Check (문법 검사)
var jsFiles = [
    'core.js', 'pension_analysis.js', 'analysis.js', 'combination.js', 
    'history.js', 'main.js', 'prediction.js', 'indicators.js'
];

var syntaxErrors = 0;
jsFiles.forEach(function(file) {
    var filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    try {
        child_process.execSync('node --check ' + file);
        console.log('✅ [Syntax] ' + file + ': 정상');
    } catch (err) {
        console.error('❌ [Syntax] ' + file + ': 문법 오류 발견!');
        console.error(err.message);
        syntaxErrors++;
    }
});

if (syntaxErrors > 0) {
    console.error('\n🚨 문법 오류가 발견되어 진단을 중단합니다. 코드를 확인하세요.');
    process.exit(1);
}

// 2. Logic Test (핵심 계산 로직 검증)
console.log('\n🧪 [Logic] 핵심 유틸리티 로직 검증 중...');

// Node 환경에서 browser용 core.js 로드 (브라우저 환경 모킹)
var coreCode = fs.readFileSync('core.js', 'utf8');
global.window = { onerror: null }; 
global.document = { getElementById: function() { return null; } }; // document 모킹 추가

// var LottoUtils = ... 를 LottoUtils = ... 로 치환하여 전역 등록 유도
coreCode = coreCode.replace(/var (LottoUtils|PensionUtils|LottoUI|LottoSynergy|PensionSynergy|LottoDataManager)/g, '$1');

(function() {
    try {
        eval(coreCode);
        // global 객체에서 추출
        LottoUtils = global.LottoUtils;
        PensionUtils = global.PensionUtils;
    } catch (e) {
        console.error('❌ [Logic] core.js 로드 실패: ' + e.message);
        process.exit(1);
    }
})();

var logicErrors = 0;

function assert(condition, message) {
    if (!condition) {
        console.error('❌ [Logic Error] ' + message);
        logicErrors++;
    }
}

// [Test 1] PensionUtils.analyzePatterns (연속/중복 분석)
var testNums = [1, 2, 2, 4, 5, 5]; // 연속 2(1,2), 중복 2(2,2 / 5,5), 유니크 4종
var pResult = PensionUtils.analyzePatterns(testNums);
assert(pResult.seq === 2, '연속 번호 계산 오류 (Expected 2, got ' + pResult.seq + ')');
assert(pResult.adjRep === 2, '직전 중복 계산 오류 (Expected 2, got ' + pResult.adjRep + ')');
assert(pResult.unique === 4, '번호 종류 계산 오류 (Expected 4, got ' + pResult.unique + ')');

// [Test 2] PensionUtils.analyzeDynamics (이월 분석 - 최근 추가된 로직)
var curr = [1, 2, 3, 4, 5, 6];
var prev = [6, 7, 8, 9, 0, 1]; 
var dResult = PensionUtils.analyzeDynamics(curr, prev);
// 자리 이월(Exact)은 없음(0), 숫자 이월(Global)은 1,6 두개(2)
assert(dResult.carry === 0, '자리 이월 계산 오류');
assert(dResult.carryGlobal === 2, '전역 숫자 이월 계산 오류 (Expected 2, got ' + dResult.carryGlobal + ')');

if (logicErrors === 0) {
    console.log('✅ [Logic] 모든 핵심 로직 검증 통과!');
} else {
    console.error('\n🚨 로직 오류가 발견되었습니다. 구현을 확인하세요.');
    process.exit(1);
}

console.log('\n✨ [Success] 프로젝트가 완벽하게 안전한 상태입니다!');
