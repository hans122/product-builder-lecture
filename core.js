/**
 * LottoCore v11.0 - AI Integrated Engine (Immortal Guardian)
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
        if (!stat || stat.std === 0) return 'safe';
        var numVal = (typeof val === 'string' && val.indexOf(':') !== -1) ? parseFloat(val.split(':')[0]) : parseFloat(val);
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
        var indicatorValues = {}; var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i]; indicatorValues[cfg.id] = cfg.calc(nums, data);
        }
        var stats = (data && data.stats_summary) ? data.stats_summary : {};
        var rules = LottoConfig.SYNERGY_RULES;
        for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (rule.check(indicatorValues, stats)) {
                results.push({ id: rule.id, label: rule.label, status: rule.status, desc: rule.desc });
            }
        }
        return results;
    }
};

var LottoUI = {
    createBall: function(num, isMini) {
        var ball = document.createElement('div');
        ball.className = 'ball ' + (isMini ? 'mini' : '') + ' ' + LottoUtils.getBallColorClass(num);
        ball.innerText = num; return ball;
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
            
            var maxFreq = Math.max.apply(null, entries.map(e => e[1]));
            var points = entries.map((e, i) => ({
                x: padding + (i / (entries.length - 1)) * chartWidth,
                y: baselineY - (e[1] / maxFreq) * chartHeight,
                val: parseFloat(e[0])
            }));

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 " + width + " " + height);
            svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");

            // 1. 패턴 정의 (빗금)
            var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            var h1 = "hatch-opt-" + containerId, h2 = "hatch-safe-" + containerId;
            defs.innerHTML = '<pattern id="' + h1 + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.5" opacity="0.4"/></pattern>' +
                             '<pattern id="' + h2 + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1" opacity="0.2"/></pattern>';
            svg.appendChild(defs);

            // 2. 구간 렌더링 함수
            var drawZone = function(z, color) {
                var minB = mu - z * sd, maxB = mu + z * sd;
                var zPoints = points.filter(p => p.val >= minB && p.val <= maxB);
                if (zPoints.length > 0) {
                    var d = "M " + zPoints[0].x + "," + baselineY;
                    zPoints.forEach(p => d += " L " + p.x + "," + p.y);
                    d += " L " + zPoints[zPoints.length - 1].x + "," + baselineY + " Z";
                    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
                }
            };
            drawZone(2, "url(#" + h2 + ")"); drawZone(1, "url(#" + h1 + ")");

            // 3. 메인 곡선
            var curveD = "M " + points[0].x + "," + points[0].y;
            for (var i = 1; i < points.length; i++) curveD += " L " + points[i].x + "," + points[i].y;
            var curve = document.createElementNS("http://www.w3.org/2000/svg", "path");
            curve.setAttribute("d", curveD); curve.setAttribute("fill", "none"); curve.setAttribute("stroke", "#3182f6"); curve.setAttribute("stroke-width", "3");
            svg.appendChild(curve);

            // 4. 통계 마커 및 충돌 방지 라벨링
            var markers = [
                { v: mu - 2*sd, t: '2.5%', p: 2 }, { v: mu - sd, t: '16%', p: 3 },
                { v: mu, t: '50%', p: 10 }, { v: mu + sd, t: '84%', p: 3 }, { v: mu + 2*sd, t: '97.5%', p: 2 }
            ];
            
            var drawnX = [];
            markers.forEach(m => {
                var targetVal = Math.max(points[0].val, Math.min(points[points.length-1].val, m.v));
                var bestP = points[0]; var minDist = 999;
                points.forEach(p => { var d = Math.abs(p.val - targetVal); if(d < minDist) { minDist = d; bestP = p; } });
                
                // 물리적 겹침 방지 (최소 45px)
                if (drawnX.every(x => Math.abs(x - bestP.x) > 40)) {
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
        } catch (e) { console.error(e); container.innerHTML = '<p style="text-align:center; color:#999;">차트 렌더링 오류</p>'; }
    },
    renderMarkovHeatmap: function(containerId, matrix, options) {
        var container = document.getElementById(containerId); if (!container || !matrix) return;
        var opts = options || {}; var themeColor = opts.color || '255, 140, 0';
        var html = '<div class="heatmap-grid" style="display:grid; grid-template-columns:40px repeat(10, 1fr); gap:4px; overflow-x:auto;">';
        html += '<div style="background:#f8fafc;"></div>';
        for (var h = 0; h < 10; h++) html += '<div style="text-align:center; font-size:0.6rem; font-weight:800; color:#64748b; background:#f8fafc; padding:8px 0;">' + h + '</div>';
        for (var i = 0; i < 10; i++) {
            html += '<div style="display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:800; color:#64748b; background:#f8fafc;">' + i + '</div>';
            var rowSum = matrix[i].reduce((a, b) => a + b, 0);
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
    SYSTEM_VERSION: '11.0',
    getCacheKey: function(type) { return 'lotto_data_' + type + '_v' + this.SYSTEM_VERSION; },
    getStats: function(callback) {
        this._loadJson('advanced_stats.json', 'lotto', callback);
    },
    getPensionStats: function(callback) {
        this._loadJson('pension_stats.json', 'pension', callback);
    },
    getPensionRecords: function(callback) {
        // 기존 CSV 로드 호환성 유지 (필요 시 Stats의 recent_draws 활용 권장)
        var self = this;
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
                    data.push({ drawNo: parts[0], date: parts[1], group: parts[2].trim(), nums: numArr });
                }
                callback(data);
            }
        };
        xhr.send();
    },
    _loadJson: function(url, cacheType, callback) {
        if (this.cache[cacheType]) { if(callback) callback(this.cache[cacheType]); return; }
        var self = this; var cacheKey = this.getCacheKey(cacheType);
        try {
            var local = localStorage.getItem(cacheKey);
            if (local) { this.cache[cacheType] = JSON.parse(local); if(callback) callback(this.cache[cacheType]); return; }
        } catch(e) {}
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?v=' + new Date().getTime(), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    self.cache[cacheType] = data;
                    localStorage.setItem(cacheKey, xhr.responseText);
                    if (callback) callback(data);
                } catch(e) { if(callback) callback(null); }
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
