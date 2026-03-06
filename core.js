'use strict';

/**
 * LottoCore v11.2 - AI Integrated Engine (Immortal Guardian)
 * - ES5 / ES6 Multi-Compatibility Engine
 * - Integrated Data Manager (Lotto & Pension Stats)
 * - Built-in Privacy Consent Manager
 */

var LottoUtils = {
    round: function(val, precision) {
        var p = precision || 0; var factor = Math.pow(10, p);
        return Math.round(val * factor) / factor;
    },
    isPrime: function(n) {
        var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
        for (var i = 0; i < primes.length; i++) { if (primes[i] === n) return true; }
        return false;
    },
    isComposite: function(n) { return n > 1 && !LottoUtils.isPrime(n); },
    calculateAC: function(nums) {
        var diffs = {}; var count = 0;
        for (var i = 0; i < nums.length; i++) {
            for (var j = i + 1; j < nums.length; j++) {
                var d = Math.abs(nums[i] - nums[j]);
                if (!diffs[d]) { diffs[d] = true; count++; }
            }
        }
        return count - (nums.length - 1);
    },
    getBallColorClass: function(num) {
        if (num <= 10) return 'yellow'; if (num <= 20) return 'blue';
        if (num <= 30) return 'red'; if (num <= 40) return 'gray'; return 'green';
    },
    getZStatus: function(val, stat) {
        if (!stat || stat.std === 0 || val === undefined || val === null) return 'safe';
        var numVal = (typeof val === 'string' && val.indexOf(':') !== -1) ? parseFloat(val.split(':')[0]) : parseFloat(val);
        if (isNaN(numVal)) return 'safe';
        var z = Math.abs(numVal - stat.mean) / stat.std;
        if (z <= 1.0) return 'safe'; if (z <= 2.0) return 'warning'; return 'danger';
    },
    padLeft: function(str, length, char) {
        str = String(str); while (str.length < length) { str = char + str; } return str;
    },
    getStrategyGroups: function(recentDraws) {
        var limit = Math.min(recentDraws.length, 15); var counts = {};
        for (var n = 1; n <= 45; n++) counts[n] = 0;
        for (var i = 0; i < limit; i++) {
            var nums = recentDraws[i].nums;
            for (var j = 0; j < nums.length; j++) { counts[nums[j]]++; }
        }
        var groups = { hot: [], warm: [], cold: [] };
        for (var num = 1; num <= 45; num++) {
            var f = counts[num];
            if (f >= 3) groups.hot.push(num); else if (f >= 1) groups.warm.push(num); else groups.cold.push(num);
        }
        return groups;
    },
    logError: function(msg, context) {
        console.error('[LottoCore] ' + msg, context || '');
    }
};

var PensionUtils = {
    analyzePatterns: function(numsArr) {
        var uniqueSet = {}; var counts = {};
        var maxSeq = 1, curSeq = 1, maxRep = 1, curRep = 1;
        for (var i = 0; i < numsArr.length; i++) {
            var n = numsArr[i]; uniqueSet[n] = true; counts[n] = (counts[n] || 0) + 1;
            if (i > 0) {
                if (Math.abs(n - numsArr[i-1]) === 1) curSeq++; else { if(curSeq > maxSeq) maxSeq = curSeq; curSeq = 1; }
                if (n === numsArr[i-1]) curRep++; else { if(curRep > maxRep) maxRep = curRep; curRep = 1; }
            }
        }
        if(curSeq > maxSeq) maxSeq = curSeq; if(curRep > maxRep) maxRep = curRep;
        var maxO = 0; for (var k in counts) { if (counts[k] > maxO) maxO = counts[k]; }
        var uniqueCount = 0; for (var key in uniqueSet) { if(uniqueSet.hasOwnProperty(key)) uniqueCount++; }
        return { seq: maxSeq === 1 ? 0 : maxSeq, adjRep: maxRep, maxOccur: maxO, unique: uniqueCount };
    },
    analyzeBalance: function(numsArr) {
        var primes = [2, 3, 5, 7]; var odd = 0, low = 0, prime = 0, sum = 0;
        for (var i = 0; i < numsArr.length; i++) {
            var n = numsArr[i]; if (n % 2 !== 0) odd++; if (n <= 4) low++;
            for (var j = 0; j < primes.length; j++) { if (primes[j] === n) { prime++; break; } }
            sum += n;
        }
        return { odd: odd, low: low, prime: prime, sum: sum };
    },
    analyzeDynamics: function(current, previous) {
        var res = { carry: 0, neighbor: 0, carryGlobal: 0 };
        if (!previous) return res;
        var prevCount = {};
        for (var i = 0; i < 6; i++) {
            if (current[i] === previous[i]) res.carry++;
            else if (Math.abs(current[i] - previous[i]) === 1) res.neighbor++;
            prevCount[previous[i]] = (prevCount[previous[i]] || 0) + 1;
        }
        for (var j = 0; j < 6; j++) {
            var n = current[j]; if (prevCount[n] > 0) { res.carryGlobal++; prevCount[n]--; }
        }
        return res;
    },
    analyzeStructure: function(nums) {
        var isSymmetry = true;
        for (var i = 0; i < 3; i++) { if (nums[i] !== nums[5 - i]) { isSymmetry = false; break; } }
        var diff = nums[1] - nums[0]; var isArithmetic = true;
        for (var j = 1; j < 5; j++) { if (nums[j+1] - nums[j] !== diff) { isArithmetic = false; break; } }
        return { symmetry: isSymmetry, arithmetic: isArithmetic, step: isArithmetic && (diff === 1 || diff === -1) };
    }
};

var LottoSynergy = {
    check: function(nums, data) {
        var results = [];
        if (!LottoConfig || !LottoConfig.SYNERGY_RULES) return results;
        
        var stats = (data && data.stats_summary) ? data.stats_summary : {};
        var indicatorValues = {}; 
        var indicators = LottoConfig.INDICATORS;
        
        // 1. 사전 지표 계산 (지표 간 비교를 위해)
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i];
            if (cfg.group && cfg.group.indexOf('GL') === 0 && cfg.calc) {
                indicatorValues[cfg.id] = cfg.calc(nums, data);
            }
        }
        
        // 2. 시너지 규칙(GL0) 검증
        var rules = LottoConfig.SYNERGY_RULES;
        for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            try {
                if (rule.check(indicatorValues, stats)) {
                    results.push({ 
                        id: rule.id, 
                        label: rule.label, 
                        status: rule.status, 
                        desc: rule.desc 
                    });
                }
            } catch(e) { console.warn('Synergy Rule Error:', rule.id, e); }
        }
        return results;
    }
};

var LottoUI = {
    showSkeletons: function(containerId, count) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var html = '';
        for (var i = 0; i < (count || 6); i++) {
            html += '<div class="analysis-item skeleton-box"><div class="skeleton-text"></div><div class="skeleton-value"></div></div>';
        }
        container.innerHTML = html;
    },
    createBall: function(num, isMini) {
        var ball = document.createElement('div');
        ball.className = 'ball ' + (isMini ? 'mini' : '') + ' ' + LottoUtils.getBallColorClass(num);
        ball.innerText = num; return ball;
    },
    renderIndicatorGrid: function(containerId, indicatorIds, numbers, statsData) {
        var container = document.getElementById(containerId);
        if (!container) return; container.innerHTML = '';
        if (!statsData || !statsData.stats_summary) return;
        
        var summary = statsData.stats_summary;
        var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicatorIds.length; i++) {
            var targetId = indicatorIds[i];
            var cfg = null;
            for (var k = 0; k < indicators.length; k++) { if (indicators[k].id === targetId) { cfg = indicators[k]; break; } }
            if (cfg) {
                var val = cfg.calc(numbers, statsData);
                var status = LottoUtils.getZStatus(val, summary[cfg.statKey]);
                var item = document.createElement('div');
                item.className = 'analysis-item ' + status;
                item.innerHTML = '<span class="label">' + cfg.label + '</span><span class="value">' + val + '</span>';
                container.appendChild(item);
            }
        }
    },
    renderMiniTable: function(containerId, draws, indicatorConfig) {
        var tbody = document.getElementById(containerId); if (!tbody) return; tbody.innerHTML = '';
        for (var i = 0; i < draws.length; i++) {
            var draw = draws[i]; var tr = document.createElement('tr');
            var ballsHtml = ''; for (var j = 0; j < draw.nums.length; j++) { ballsHtml += LottoUI.createBall(draw.nums[j], true).outerHTML; }
            var val = draw[indicatorConfig.drawKey] !== undefined ? draw[indicatorConfig.drawKey] : (draw[indicatorConfig.statKey] !== undefined ? draw[indicatorConfig.statKey] : '-');
            tr.innerHTML = '<td>' + draw.no + '회</td><td><div class="table-nums">' + ballsHtml + '</div></td><td><strong>' + val + '</strong></td>';
            tbody.appendChild(tr);
        }
    },
    createCurveChart: function(containerId, distData, unit, statSummary, config, highlightValue) {
        var container = document.getElementById(containerId); if (!container || !statSummary) return;
        container.innerHTML = '';
        try {
            var entries = [];
            for (var key in distData) { if(distData.hasOwnProperty(key)) entries.push([key, distData[key]]); }
            entries.sort(function(a, b) { return parseFloat(a[0]) - parseFloat(b[0]); });
            if (entries.length < 2) return;

            var mu = statSummary.mean; var sd = statSummary.std;
            var width = container.clientWidth || 600; var height = 200; var padding = 50;
            var chartWidth = width - padding * 2; var chartHeight = height - 70; var baselineY = height - 40;
            
            var maxFreq = Math.max.apply(null, entries.map(function(e) { return e[1]; }));
            var points = entries.map(function(e, i) {
                return {
                    x: padding + (i / (entries.length - 1)) * chartWidth,
                    y: baselineY - (e[1] / maxFreq) * chartHeight,
                    val: parseFloat(e[0])
                };
            });

            if (points.length === 0 || !points[0]) return; // 데이터 포인트 부재 시 중단

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 " + width + " " + height);
            svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

            var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            var h1 = "hatch-opt-" + containerId, h2 = "hatch-safe-" + containerId;
            defs.innerHTML = '<pattern id="' + h1 + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.5" opacity="0.4"/></pattern>' +
                             '<pattern id="' + h2 + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1" opacity="0.2"/></pattern>';
            svg.appendChild(defs);

            var drawZone = function(z, color) {
                if (!sd || sd <= 0.1) return;
                var minB = mu - z * sd, maxB = mu + z * sd;
                
                // 빗금 영역 생성을 위한 정밀 포인트 산출 (보간법 적용)
                var zPoints = [];
                for (var i = 0; i < points.length; i++) {
                    var curr = points[i];
                    var prev = i > 0 ? points[i - 1] : null;

                    // 1. 시작 경계선 보간 (구간의 시작점이 데이터 포인트 사이에 있는 경우)
                    if (prev && prev.val < minB && curr.val >= minB) {
                        var r1 = (minB - prev.val) / (curr.val - prev.val);
                        zPoints.push({ x: prev.x + (curr.x - prev.x) * r1, y: prev.y + (curr.y - prev.y) * r1, val: minB });
                    }

                    // 2. 구간 내부 포인트 추가
                    if (curr.val >= minB && curr.val <= maxB) {
                        zPoints.push(curr);
                    }

                    // 3. 종료 경계선 보간 (구간의 종료점이 데이터 포인트 사이에 있는 경우)
                    if (prev && prev.val <= maxB && curr.val > maxB) {
                        var r2 = (maxB - prev.val) / (curr.val - prev.val);
                        zPoints.push({ x: prev.x + (curr.x - prev.x) * r2, y: prev.y + (curr.y - prev.y) * r2, val: maxB });
                    }
                }
                
                if (zPoints.length > 1) {
                    var d = "M " + zPoints[0].x + "," + baselineY;
                    for (var j = 0; j < zPoints.length; j++) {
                        if (isNaN(zPoints[j].x) || isNaN(zPoints[j].y)) continue;
                        d += " L " + zPoints[j].x + "," + zPoints[j].y;
                    }
                    d += " L " + zPoints[zPoints.length - 1].x + "," + baselineY + " Z";
                    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d); path.setAttribute("fill", color); 
                    path.setAttribute("style", "pointer-events:none;");
                    svg.appendChild(path);
                }
            };
            drawZone(2, "url(#" + h2 + ")"); // μ±2σ (파란색 빗금)
            drawZone(1, "url(#" + h1 + ")"); // μ±1σ (초록색 빗금)

            var curveD = "M " + points[0].x + "," + points[0].y;
            for (var i = 1; i < points.length; i++) curveD += " L " + points[i].x + "," + points[i].y;
            var curve = document.createElementNS("http://www.w3.org/2000/svg", "path");
            curve.setAttribute("d", curveD); curve.setAttribute("fill", "none"); curve.setAttribute("stroke", "#3182f6"); curve.setAttribute("stroke-width", "3");
            svg.appendChild(curve);

            var markers = [
                { v: mu - 2*sd, t: '2.5%' }, { v: mu - sd, t: '16%' },
                { v: mu, t: '50%' }, { v: mu + sd, t: '84%' }, { v: mu + 2*sd, t: '97.5%' }
            ];
            
            var drawnX = [];
            markers.forEach(function(m) {
                var bestP = points[0]; var minDist = 999;
                points.forEach(function(p) { var d = Math.abs(p.val - m.v); if(d < minDist) { minDist = d; bestP = p; } });
                
                if (drawnX.every(function(x) { return Math.abs(x - bestP.x) > 40; })) {
                    drawnX.push(bestP.x);
                    var isAvg = m.t === '50%';
                    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    g.innerHTML = '<line x1="'+bestP.x+'" y1="'+baselineY+'" x2="'+bestP.x+'" y2="'+(baselineY+5)+'" stroke="'+(isAvg?'#3182f6':'#cbd5e1')+'" stroke-width="'+(isAvg?2:1)+'"/>' +
                                  '<text x="'+bestP.x+'" y="'+(baselineY+20)+'" text-anchor="middle" font-size="10px" font-weight="800" fill="'+(isAvg?'#3182f6':'#64748b')+'">'+m.t+'</text>' +
                                  '<text x="'+bestP.x+'" y="'+(baselineY+34)+'" text-anchor="middle" font-size="9px" font-weight="700" fill="'+(isAvg?'#3182f6':'#94a3b8')+'">('+Math.round(bestP.val)+')</text>';
                    svg.appendChild(g);
                }
            });
            container.appendChild(svg);
        } catch (e) { console.error(e); }
    },
    renderMarkovHeatmap: function(containerId, matrix, options) {
        var container = document.getElementById(containerId); if (!container || !matrix) return;
        var opts = options || {}; var themeColor = opts.color || '255, 140, 0';
        var html = '<div class="heatmap-grid" style="display:grid; grid-template-columns:40px repeat(10, 1fr); gap:4px; overflow-x:auto;">';
        html += '<div style="background:#f8fafc;"></div>';
        for (var h = 0; h < 10; h++) html += '<div style="text-align:center; font-size:0.6rem; font-weight:800; color:#64748b; background:#f8fafc; padding:8px 0;">' + h + '</div>';
        for (var i = 0; i < 10; i++) {
            html += '<div style="display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:800; color:#64748b; background:#f8fafc;">' + i + '</div>';
            var rowSum = matrix[i].reduce(function(a, b) { return a + b; }, 0);
            var maxP = 0, maxIdx = -1;
            for(var c=0; c<10; c++) { var p = rowSum===0?0:Math.round((matrix[i][c]/rowSum)*100); if(p>maxP){maxP=p; maxIdx=c;} }
            for (var j = 0; j < 10; j++) {
                var prob = rowSum === 0 ? 0 : Math.round((matrix[i][j] / rowSum) * 100);
                var opacity = Math.max(0.05, prob / 30);
                var isBest = j === maxIdx && prob > (opts.threshold || 12);
                html += '<div style="text-align:center; padding:12px 0; font-size:0.7rem; font-weight:800; background:rgba(' + themeColor + ',' + opacity + '); color:' + (opacity>0.4?'white':'#4e5968') + '; border-radius:4px; ' + (isBest?'outline:2px solid rgb('+themeColor+'); outline-offset:-2px;':'') + '">' + prob + '%</div>';
            }
        }
        html += '</div>'; container.innerHTML = html;
    }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    promises: { lotto: null, pension: null },
    SYSTEM_VERSION: '11.2',
    
    getCacheKey: function(type) { return 'lotto_data_' + type + '_v' + this.SYSTEM_VERSION; },
    
    getStats: function(callback) {
        this._loadData('advanced_stats.json', 'lotto', callback);
    },
    
    getPensionStats: function(callback) {
        this._loadData('pension_stats.json', 'pension', callback);
    },

    _loadData: function(url, type, callback) {
        // 1. 메모리 캐시 확인
        if (this.cache[type]) {
            if (callback) callback(this.cache[type]);
            return;
        }

        // 2. 진행 중인 요청 확인 (Promise)
        if (this.promises[type]) {
            this.promises[type].then(data => {
                if (callback) callback(data);
            }).catch(() => {
                if (callback) callback(null);
            });
            return;
        }

        // 3. 새로운 요청 시작
        var self = this;
        var cacheKey = this.getCacheKey(type);
        
        // 로컬 스토리지 캐시 우선 확인
        try {
            var local = localStorage.getItem(cacheKey);
            if (local) {
                var parsed = JSON.parse(local);
                this.cache[type] = parsed;
                if (callback) callback(parsed);
                // 백그라운드에서 최신 데이터 확인 (Stale-While-Revalidate)
                // return; // 최신 데이터 강제 로드를 위해 리턴하지 않음
            }
        } catch(e) {}

        this.promises[type] = new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + '?v=' + self.SYSTEM_VERSION + '_' + new Date().getTime(), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            self.cache[type] = data;
                            localStorage.setItem(cacheKey, xhr.responseText);
                            resolve(data);
                        } catch(e) {
                            console.error('JSON Parse Error:', url, e);
                            reject(e);
                        }
                    } else {
                        console.warn('Data Load Failed:', url, xhr.status);
                        reject(xhr.status);
                    }
                    self.promises[type] = null; // 요청 완료 후 해제
                }
            };
            xhr.send();
        });

        this.promises[type].then(data => {
            if (callback) callback(data);
        }).catch(() => {
            if (callback) callback(null);
        });
    },

    getPensionRecords: function(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'pt720.csv?v=' + new Date().getTime(), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var lines = xhr.responseText.replace(/\r/g, '').split('\n');
                var data = [];
                for (var i = 1; i < lines.length; i++) {
                    if (!lines[i]) continue;
                    var parts = lines[i].split(','); if (parts.length < 4) continue;
                    var numArr = []; var rawNums = LottoUtils.padLeft(parts[3].trim(), 6, '0');
                    for(var n=0; n<6; n++) { numArr.push(Number(rawNums.charAt(n))); }
                    data.push({ no: parts[0], date: parts[1], group: parts[2].trim(), nums: numArr });
                }
                if(callback) callback(data);
            }
        };
        xhr.send();
    }
};

var PrivacyManager = {
    init: function() {
        if (localStorage.getItem('lotto_consent_given')) return;
        var banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#fff; box-shadow:0 -2px 20px rgba(0,0,0,0.1); z-index:10000; padding:1.5rem; text-align:center;';
        banner.innerHTML = '<p style="font-size:0.9rem; color:#4a5568; margin-bottom:1rem;">당사는 서비스 제공을 위해 쿠키와 개인정보를 사용합니다. <a href="privacy.html" style="color:#3498db; text-decoration:underline;">개인정보처리방침</a>에 동의하십니까?</p>' +
                           '<div style="display:flex; gap:1rem; justify-content:center;"><button id="c-acc" style="padding:0.6rem 2rem; border-radius:8px; background:#3498db; color:#fff; border:none; cursor:pointer;">동의함</button><button id="c-dec" style="padding:0.6rem 2rem; border-radius:8px; background:#edf2f7; color:#4a5568; border:none; cursor:pointer;">거부함</button></div>';
        document.body.appendChild(banner);
        document.getElementById('c-acc').onclick = function() { localStorage.setItem('lotto_consent_given', 'true'); banner.style.display = 'none'; };
        document.getElementById('c-dec').onclick = function() { banner.style.display = 'none'; };
    }
};

document.addEventListener('DOMContentLoaded', function() {
    PrivacyManager.init();
});
