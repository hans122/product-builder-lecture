/**
 * AI System Guardian v1.0 (Self-Diagnostic Engine)
 * - Validates Data Integrity, UI Rendering, and AI Status
 * - Provides Real-time Feedback via Console & Badge
 */

'use strict';

var SystemGuardian = {
    results: { total: 0, pass: 0, warn: 0, fail: 0, logs: [] },
    badge: null,

    init: function() {
        var self = this;
        // 페이지 로드 1초 후 진단 시작 (렌더링 완료 대기)
        setTimeout(function() {
            self.createBadge();
            self.runDiagnostics();
        }, 1000);
    },

    createBadge: function() {
        this.badge = document.createElement('div');
        this.badge.id = 'guardian-badge';
        this.badge.style.cssText = 'position:fixed; bottom:15px; right:15px; width:12px; height:12px; border-radius:50%; background:#ccc; z-index:99999; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2); transition:all 0.3s;';
        this.badge.onclick = () => this.showReport();
        document.body.appendChild(this.badge);
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
        
        // 차트 렌더링 확인 (SVG 존재 여부)
        var charts = document.querySelectorAll('.dist-bar-chart, .frequency-chart');
        if (charts.length > 0) {
            var rendered = 0;
            charts.forEach(c => { if(c.querySelector('svg, .bar')) rendered++; });
            if (rendered < charts.length) this.log('WARN', 'Some Charts Not Rendered (' + rendered + '/' + charts.length + ')');
            else this.log('PASS', 'All Charts Rendered');
        }

        this.updateBadge();
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

    updateBadge: function() {
        if (!this.badge) return;
        var color = '#2ecc71'; // Green
        if (this.results.fail > 0) color = '#f04452'; // Red
        else if (this.results.warn > 0) color = '#ff9500'; // Orange
        
        this.badge.style.backgroundColor = color;
        this.badge.title = 'System Status: ' + (this.results.fail > 0 ? 'Error Detected' : 'Operational');
    },

    showReport: function() {
        var report = '🛡️ AI System Diagnostic Report\n--------------------------------\n';
        this.results.logs.forEach(l => {
            var icon = l.status === 'PASS' ? '✅' : (l.status === 'WARN' ? '⚠️' : '❌');
            report += icon + ' ' + l.msg + '\n';
        });
        alert(report);
    }
};

document.addEventListener('DOMContentLoaded', function() { SystemGuardian.init(); });
