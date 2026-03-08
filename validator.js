'use strict';

var SystemGuardian = {
    results: { total: 0, pass: 0, warn: 0, fail: 0, logs: [] },

    init: function() {
        var self = this;
        
        // [v32.92] 지능형 지연 체크: 데이터가 로드될 때까지 최대 5초간 대기
        var attempts = 0;
        var checkInterval = setInterval(function() {
            attempts++;
            var cache = (typeof LottoDataManager !== 'undefined') ? (LottoDataManager.cache.lotto || LottoDataManager.cache.pension) : null;
            
            if (cache || attempts > 50) { // 데이터가 로드되었거나 5초가 지났을 때
                clearInterval(checkInterval);
                self.runDiagnostics();
            }
        }, 100);
    },

    runDiagnostics: function() {
        this.reset();
        
        // 1. Data Integrity Check
        if (typeof LottoDataManager === 'undefined') this.log('FAIL', 'Core Engine Missing');
        else {
            var cache = LottoDataManager.cache.lotto || LottoDataManager.cache.pension;
            if (!cache) this.log('WARN', 'Data Not Cached Yet');
            else {
                if (!cache.total_draws) this.log('FAIL', 'Data Schema Invalid (No total_draws)');
                else this.log('PASS', 'Data Integrity OK (' + cache.total_draws + ' draws)');
                
                if (document.body.classList.contains('pension-theme')) {
                    if (!cache.markov_matrix) this.log('FAIL', 'AI Markov Matrix Missing');
                    else this.log('PASS', 'AI Engine Ready');
                } else {
                    if (!cache.markov_ending_matrix) this.log('FAIL', 'AI Markov Matrix Missing');
                    else this.log('PASS', 'AI Engine Ready');
                }
            }
        }

        // 2. UI Rendering Check
        this.checkElement('dynamic-guide-root', 'Guide Container');
        this.checkElement('ai-guide-root', 'AI Guide Container');
        this.checkElement('ai-pension-guide-root', 'AI Pension Guide Container');
        
        // 차트 렌더링 확인 (SVG 또는 Bar 존재 여부)
        var charts = document.querySelectorAll('.dist-bar-chart, .frequency-chart, [id$="-chart"]');
        if (charts.length > 0) {
            var rendered = 0;
            charts.forEach(function(c) { 
                if(c.querySelector('svg, .bar, .bar-wrapper, .freq-bar') || c.innerHTML.indexOf('<svg') !== -1) rendered++; 
            });
            if (rendered < charts.length) this.log('WARN', 'Some Charts Not Rendered (' + rendered + '/' + charts.length + ')');
            else this.log('PASS', 'All Charts Rendered (' + rendered + ')');
        }

        this.persistReport();
    },

    checkElement: function(id, name) {
        // 해당 페이지에 ID가 존재해야 하는 경우만 체크
        if (document.getElementById(id)) {
            if (document.getElementById(id).innerHTML.trim() === '') this.log('FAIL', name + ' Empty');
            else this.log('PASS', name + ' Rendered');
        }
    },

    log: function(status, msg) {
        this.results.total++;
        if (status === 'PASS') this.results.pass++;
        else if (status === 'WARN') this.results.warn++;
        else this.results.fail++;
        
        this.results.logs.push({ status: status, msg: msg });
        
        var color = status === 'PASS' ? '#2ecc71' : (status === 'WARN' ? '#ff9500' : '#f04452');
        console.log('%c[' + status + '] ' + msg, 'color:' + color + '; font-weight:bold;');
    },

    reset: function() {
        this.results = { total: 0, pass: 0, warn: 0, fail: 0, logs: [] };
    },

    persistReport: function() {
        // 로그 영속화 (localStorage에 저장하여 AI가 다음 세션에서 읽을 수 있게 함)
        try {
            var summary = {
                timestamp: new Date().toISOString(),
                url: window.location.pathname,
                results: { total: this.results.total, pass: this.results.pass, warn: this.results.warn, fail: this.results.fail },
                fails: this.results.logs.filter(l => l.status === 'FAIL').map(l => l.msg)
            };
            localStorage.setItem('guardian_last_report', JSON.stringify(summary));
        } catch(e) {}
    }
};

document.addEventListener('DOMContentLoaded', function() { SystemGuardian.init(); });
