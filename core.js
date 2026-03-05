/**
 * LottoCore v9.2 - 이모탈 가디언 (Full Engine Restored)
 * - ES5 초정밀 호환성 (const/let/arrow-function 제거)
 * - 로또/연금 시너지 엔진(Synergy Engine) 복구 완료
 * - 데이터 검증 및 사생활 보호 모드 대응
 */

var LottoUtils = {
    round: function(val, precision) {
        var p = precision || 0;
        var factor = Math.pow(10, p);
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
    // [STRATEGY] 최근 15회차 기반 골든타임 그룹핑 엔진
    getStrategyGroups: function(recentDraws) {
        var limit = Math.min(recentDraws.length, 15);
        var counts = {};
        for (var n = 1; n <= 45; n++) counts[n] = 0;
        
        for (var i = 0; i < limit; i++) {
            var nums = recentDraws[i].nums;
            for (var j = 0; j < nums.length; j++) { counts[nums[j]]++; }
        }
        
        var groups = { hot: [], warm: [], cold: [] };
        for (var num = 1; num <= 45; num++) {
            var f = counts[num];
            if (f >= 3) groups.hot.push(num);
            else if (f >= 1) groups.warm.push(num);
            else groups.cold.push(num);
        }
        return groups;
    },
    logError: function(msg, context) {
        console.error('[LottoCore Error] ' + msg, context || '');
        var notifier = document.getElementById('global-error-notifier');
        if (!notifier) {
            notifier = document.createElement('div');
            notifier.id = 'global-error-notifier';
            document.body.appendChild(notifier);
        }
        notifier.innerText = '⚠️ 서비스 일시적 불안정 (일부 지표 점검 중)';
        notifier.style.display = 'block';
        setTimeout(function() { notifier.style.display = 'none'; }, 3000);
    }
};

var PensionUtils = {
    analyzePatterns: function(numsArr) {
        var uniqueSet = {}; var counts = {};
        var maxSeq = 1, curSeq = 1, maxRep = 1, curRep = 1;
        for (var i = 0; i < numsArr.length; i++) {
            var n = numsArr[i]; uniqueSet[n] = true; counts[n] = (counts[n] || 0) + 1;
            if (i > 0) {
                if (Math.abs(n - numsArr[i-1]) === 1) curSeq++;
                else { if(curSeq > maxSeq) maxSeq = curSeq; curSeq = 1; }
                if (n === numsArr[i-1]) curRep++;
                else { if(curRep > maxRep) maxRep = curRep; curRep = 1; }
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
        var res = { carry: 0, neighbor: 0 };
        if (!previous) return res;
        for (var i = 0; i < 6; i++) {
            if (current[i] === previous[i]) res.carry++;
            else if (Math.abs(current[i] - previous[i]) === 1) res.neighbor++;
        }
        return res;
    },
    analyzeStructure: function(nums) {
        var isSymmetry = true;
        for (var i = 0; i < 3; i++) { if (nums[i] !== nums[5 - i]) { isSymmetry = false; break; } }
        var diff = nums[1] - nums[0];
        var isArithmetic = true;
        for (var j = 1; j < 5; j++) { if (nums[j+1] - nums[j] !== diff) { isArithmetic = false; break; } }
        return { symmetry: isSymmetry, arithmetic: isArithmetic, step: isArithmetic && (diff === 1 || diff === -1) };
    }
};

// [ENGINE] 시너지 분석 엔진 (G0)
var LottoSynergy = {
    check: function(nums, data) {
        var results = [];
        if (!LottoConfig || !LottoConfig.INDICATORS) return results;
        var indicatorValues = {};
        var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicators.length; i++) {
            var cfg = indicators[i];
            indicatorValues[cfg.id] = cfg.calc(nums, data);
        }
        var stats = (data && data.stats_summary) ? data.stats_summary : {};
        var rules = LottoConfig.SYNERGY_RULES || [];
        for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (rule.check(indicatorValues, stats)) {
                results.push({ id: rule.id, label: rule.label, status: rule.status, desc: rule.desc });
            }
        }
        return results;
    }
};

// [ENGINE] 연금 시너지 분석 엔진 (P0)
var PensionSynergy = {
    check: function(digits) {
        var results = [];
        if (!LottoConfig || !LottoConfig.PENSION_SYNERGY_RULES) return results;
        var rules = LottoConfig.PENSION_SYNERGY_RULES;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.check(digits)) {
                results.push({ id: rule.id, label: rule.label, status: rule.status, desc: rule.desc });
            }
        }
        return results;
    }
};

var LottoUI = {
    renderGapChart: function(containerId, gapData) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var html = '<div class="gap-chart-grid" style="display:grid; grid-template-columns: repeat(11, 1fr); gap: 2px;">';
        html += '<div style="background:#f8fafc;"></div>';
        for (var h = 0; h <= 9; h++) html += '<div style="text-align:center; font-size:0.6rem; font-weight:bold; background:#f8fafc; padding:4px 0;">' + h + '</div>';
        var labels = ['십만','만','천','백','십','일'];
        for (var i = 0; i < 6; i++) {
            html += '<div style="font-size:0.65rem; font-weight:bold; color:#64748b; display:flex; align-items:center; justify-content:center; background:#f8fafc;">' + labels[i] + '</div>';
            for (var n = 0; n <= 9; n++) {
                var gap = gapData[i][n];
                var color = gap > 20 ? '#f04452' : (gap > 10 ? '#ff9500' : (gap === 0 ? '#3182f6' : '#94a3b8'));
                var opacity = gap === 0 ? 1 : Math.min(0.8, 0.2 + (gap / 40));
                html += '<div style="text-align:center; padding:8px 0; font-size:0.7rem; font-weight:800; color:white; background:' + color + '; opacity:' + opacity + '; border-radius:2px;">' + gap + '</div>';
            }
        }
        html += '</div>';
        container.innerHTML = html;
    },
    showSkeletons: function(containerId, count) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var html = '';
        for (var i = 0; i < (count || 6); i++) { html += '<div class="analysis-item skeleton-box"><div class="skeleton-text"></div><div class="skeleton-value"></div></div>'; }
        container.innerHTML = html;
    },
    createBall: function(num, isMini) {
        var ball = document.createElement('div');
        ball.className = 'ball ' + (isMini ? 'mini' : '') + ' ' + LottoUtils.getBallColorClass(num);
        ball.innerText = num;
        return ball;
    },
    createAnalysisItem: function(cfg, value, status, stat) {
        var item = document.createElement('div');
        item.className = 'analysis-item ' + status;
        var tip = '';
        if (stat) {
            var optMin = Math.max(0, Math.round(stat.mean - stat.std));
            var optMax = Math.round(stat.mean + stat.std);
            var safeMin = Math.max(0, Math.round(stat.mean - 2 * stat.std));
            var safeMax = Math.round(stat.mean + 2 * stat.std);
            if (cfg.maxLimit) {
                optMax = Math.min(cfg.maxLimit, optMax); safeMax = Math.min(cfg.maxLimit, safeMax);
                optMin = Math.min(optMin, optMax); safeMin = Math.min(safeMin, safeMax);
            }
            tip = 'data-tip="[' + cfg.label + '] 세이프: ' + safeMin + '~' + safeMax + (cfg.unit||'') + ' (옵티멀: ' + optMin + '~' + optMax + (cfg.unit||'') + ')"';
        }
        item.innerHTML = '<a href="analysis.html#' + cfg.id + '-section" class="analysis-item-link" ' + tip + '>' +
                '<span class="label">' + cfg.label + '</span>' +
                '<span id="' + cfg.id + '" class="value">' + value + '</span>' +
                '</a>';
        return item;
    },
    renderIndicatorGrid: function(containerId, indicatorIds, numbers, statsData) {
        var container = document.getElementById(containerId);
        if (!container) return; container.innerHTML = '';
        var summary = statsData.stats_summary || {};
        var indicators = LottoConfig.INDICATORS;
        for (var i = 0; i < indicatorIds.length; i++) {
            var targetId = indicatorIds[i];
            var cfg = null;
            for (var k = 0; k < indicators.length; k++) { if (indicators[k].id === targetId) { cfg = indicators[k]; break; } }
            if (cfg) {
                try {
                    var val = cfg.calc(numbers, statsData);
                    var status = LottoUtils.getZStatus(val, summary[cfg.statKey]);
                    container.appendChild(this.createAnalysisItem(cfg, val, status, summary[cfg.statKey]));
                } catch (e) {
                    var errorItem = document.createElement('div');
                    errorItem.className = 'analysis-item error-isolation';
                    errorItem.innerHTML = '<span class="label">' + cfg.label + '</span><span class="value">점검 중</span>';
                    container.appendChild(errorItem);
                }
            }
        }
    },
    createCurveChart: function(containerId, distData, unit, statSummary, config, highlightValue) {
        var container = document.getElementById(containerId);
        if (!container || !statSummary) return;
        container.innerHTML = '';
        try {
            var entries = [];
            if (Array.isArray(distData)) { entries = distData; } 
            else {
                for (var key in distData) { if(distData.hasOwnProperty(key)) entries.push([key, distData[key]]); }
                entries.sort(function(a, b) {
                    var valA = parseFloat(a[0].split(/[ :\-]/)[0]);
                    var valB = parseFloat(b[0].split(/[ :\-]/)[0]);
                    return isNaN(valA) ? 0 : valA - valB;
                });
            }
            if (entries.length < 2) throw new Error('Not enough data');
            var mu = statSummary.mean; var sd = statSummary.std;
            var valKeys = [];
            for (var i = 0; i < entries.length; i++) {
                var v = parseFloat(entries[i][0].split(/[ :\-]/)[0]);
                if (!isNaN(v)) valKeys.push(v);
            }
            var dataMax = Math.max.apply(null, valKeys);
            var dataMin = Math.min.apply(null, valKeys);
            var limit = (config && config.maxLimit) ? Math.min(config.maxLimit, dataMax) : dataMax;
            var width = container.clientWidth || 600; var height = 200; var padding = 50;
            var chartWidth = width - padding * 2; var chartHeight = height - 70; var baselineY = height - 40;
            var maxFreq = 1;
            for (var fIdx = 0; fIdx < entries.length; fIdx++) { if(entries[fIdx][1] > maxFreq) maxFreq = entries[fIdx][1]; }
            var points = [];
            for (var i = 0; i < entries.length; i++) {
                var x = padding + (i / (entries.length - 1)) * chartWidth;
                var y = baselineY - (entries[i][1] / maxFreq) * chartHeight;
                points.push({ x: x, y: y, label: entries[i][0], value: entries[i][1] });
            }
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 " + width + " " + height);
            svg.setAttribute("style", "width:100%; height:100%; overflow:visible;");
            var hatchIdOpt = "hatch-opt-" + containerId;
            var hatchIdSafe = "hatch-safe-" + containerId;
            var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            defs.innerHTML = '<pattern id="' + hatchIdOpt + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#2ecc71" stroke-width="1.5" opacity="0.4"/></pattern>' +
                             '<pattern id="' + hatchIdSafe + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#3182f6" stroke-width="1" opacity="0.2"/></pattern>';
            svg.appendChild(defs);
            var drawZone = function(z, color) {
                var minB = Math.round(mu - z * sd);
                var maxB = Math.min(limit, Math.round(mu + z * sd));
                var zPoints = [];
                for (var i = 0; i < points.length; i++) {
                    var pV = parseFloat(points[i].label.split(/[ :\-]/)[0]);
                    if (!isNaN(pV) && pV >= minB && pV <= maxB) zPoints.push(points[i]);
                }
                if (zPoints.length > 0) {
                    var d = "M " + zPoints[0].x + "," + baselineY;
                    for (var j = 0; j < zPoints.length; j++) { d += " L " + zPoints[j].x + "," + zPoints[j].y; }
                    d += " L " + zPoints[zPoints.length - 1].x + "," + baselineY + " Z";
                    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d); path.setAttribute("fill", color); svg.appendChild(path);
                }
            };
            drawZone(2, "url(#" + hatchIdSafe + ")"); drawZone(1, "url(#" + hatchIdOpt + ")");
            var curveD = "M " + points[0].x + "," + points[0].y;
            for (var i = 1; i < points.length; i++) { curveD += " L " + points[i].x + "," + points[i].y; }
            var curve = document.createElementNS("http://www.w3.org/2000/svg", "path");
            curve.setAttribute("d", curveD); curve.setAttribute("fill", "none"); curve.setAttribute("stroke", "#3182f6"); curve.setAttribute("stroke-width", "3");
            svg.appendChild(curve);

            // [FIX] 정규분포 확률(σ) 기반 백분위(%) 라벨 정밀화
            // μ±2σ = 95.4% (양끝 2.3%), μ±1σ = 68.2% (양끝 15.9%)
            var statsMarkers = [
                { v: 0, t: '0%' },
                { v: mu - 2 * sd, t: '2.5%' },
                { v: mu - sd, t: '16%' },
                { v: mu, t: '50%' },
                { v: mu + sd, t: '84%' },
                { v: mu + 2 * sd, t: '97.5%' },
                { v: limit, t: '100%' }
            ];

            // 중복된 위치의 라벨 제거 (반올림 시 같은 위치에 올 수 있음)
            var renderedVals = {};
            for (var mIdx = 0; mIdx < statsMarkers.length; mIdx++) {
                var marker = statsMarkers[mIdx];
                var lVal = Math.max(0, Math.min(limit, Math.round(marker.v)));
                if (renderedVals[lVal]) continue; // 이미 표시된 수치는 건너뜀
                renderedVals[lVal] = true;

                var lIdx = -1;
                var minDist = 999;
                for (var k = 0; k < points.length; k++) {
                    var pV = parseFloat(points[k].label.split(/[ :\-]/)[0]);
                    if (!isNaN(pV)) {
                        var dist = Math.abs(pV - lVal);
                        if (dist < minDist) { minDist = dist; lIdx = k; }
                    }
                }

                if (lIdx !== -1) {
                    var lp = points[lIdx];
                    var isAvg = marker.t === '평균';

                    // 보조선 (Tick)
                    var gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    gridLine.setAttribute("x1", lp.x); gridLine.setAttribute("y1", baselineY);
                    gridLine.setAttribute("x2", lp.x); gridLine.setAttribute("y2", baselineY + 5);
                    gridLine.setAttribute("stroke", isAvg ? "#3182f6" : "#cbd5e1");
                    gridLine.setAttribute("stroke-width", isAvg ? "2" : "1");
                    svg.appendChild(gridLine);

                    // 텍스트 라벨 (통계 명칭)
                    var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    txt.setAttribute("x", lp.x); txt.setAttribute("y", baselineY + 20);
                    txt.setAttribute("text-anchor", "middle"); txt.setAttribute("font-size", isAvg ? "11px" : "10px");
                    txt.setAttribute("font-weight", isAvg ? "800" : "600");
                    txt.setAttribute("fill", isAvg ? "#3182f6" : "#64748b");
                    txt.textContent = marker.t;
                    svg.appendChild(txt);

                    // 수치 라벨 (하단에 병기)
                    var valTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    valTxt.setAttribute("x", lp.x); valTxt.setAttribute("y", baselineY + 34);
                    valTxt.setAttribute("text-anchor", "middle"); valTxt.setAttribute("font-size", isAvg ? "10px" : "9px");
                    valTxt.setAttribute("font-weight", isAvg ? "700" : "500");
                    valTxt.setAttribute("fill", isAvg ? "#3182f6" : "#94a3b8");
                    valTxt.textContent = "(" + lVal + ")";
                    svg.appendChild(valTxt);
                }
            }

            container.appendChild(svg);
        } catch (e) { container.innerHTML = '<p style="text-align:center; padding: 20px; font-size:0.8rem; color:#999;">데이터 부족</p>'; }
    },
    renderMiniTable: function(containerId, draws, indicatorConfig) {
        var tbody = document.getElementById(containerId);
        if (!tbody) return; tbody.innerHTML = '';
        for (var i = 0; i < draws.length; i++) {
            var draw = draws[i]; var tr = document.createElement('tr');
            var ballsHtml = ''; for (var j = 0; j < draw.nums.length; j++) { ballsHtml += LottoUI.createBall(draw.nums[j], true).outerHTML; }
            var val = draw[indicatorConfig.drawKey] !== undefined ? draw[indicatorConfig.drawKey] : (draw[indicatorConfig.statKey] !== undefined ? draw[indicatorConfig.statKey] : '-');
            tr.innerHTML = '<td>' + draw.no + '회</td><td><div class="table-nums">' + ballsHtml + '</div></td><td><strong>' + val + '</strong></td>';
            tbody.appendChild(tr);
        }
    },
    renderBarChart: function(containerId, freqData, unitLabel, themeColor) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var color = themeColor || '#ff8c00';
        var keys = []; for (var k in freqData) { if(freqData.hasOwnProperty(k)) keys.push(Number(k)); }
        keys.sort(function(a, b) { return a - b; });
        var max = 0; for (var i = 0; i < keys.length; i++) { if (freqData[keys[i]] > max) max = freqData[keys[i]]; }
        if (max === 0) max = 1;
        var html = '<div style="display: flex; align-items: flex-end; height: 100%; border-bottom: 2px solid #edf2f7; padding-bottom: 5px;">';
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j]; var f = freqData[key] || 0; var h = Math.max(4, (f / max) * 100);
            var label = (key === 0 || (key === 1 && containerId === 'repeat-dist-chart')) ? '없음' : key + unitLabel;
            html += '<div style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; margin: 0 1px;">' +
                    '<span style="font-size: 0.55rem; color: #94a3b8; margin-bottom: 2px;">' + f + '</span>' +
                    '<div style="width: 80%; height: ' + h + '%; background: ' + color + '; border-radius: 2px; opacity: ' + (0.4 + (h/150)) + ';"></div>' +
                    '<span style="font-size: 0.6rem; font-weight: 700; color: #475569; margin-top: 5px; white-space: nowrap; transform: scale(0.9);">' + label + '</span>' +
                    '</div>';
        }
        html += '</div>'; container.innerHTML = html;
    }
};

var LottoDataManager = {
    cache: { lotto: null, pension: null },
    SYSTEM_VERSION: '10.0', 
    getCacheKey: function() { return 'lotto_data_v' + this.SYSTEM_VERSION; },
    getStats: function(callback) {
        if (typeof Promise !== 'undefined' && !callback) { return new Promise(function(resolve) { LottoDataManager.getStats(function(data) { resolve(data); }); }); }
        if (this.cache.lotto) { if(callback) callback(this.cache.lotto); return; }
        var cacheKey = this.getCacheKey();
        var localData = null;
        try {
            localData = localStorage.getItem(cacheKey);
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf('lotto_data_') === 0 && key !== cacheKey) { localStorage.removeItem(key); }
            }
        } catch (e) {}
        if (localData) {
            try {
                var parsed = JSON.parse(localData);
                this.cache.lotto = parsed;
                if (callback) callback(parsed);
                return;
            } catch (e) { try { localStorage.removeItem(cacheKey); } catch(ex) {} }
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'advanced_stats.json?v=' + new Date().getTime(), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.stats_summary) {
                        LottoDataManager.cache.lotto = data;
                        localStorage.setItem(cacheKey, xhr.responseText);
                        if (callback) callback(data);
                    }
                } catch (e) { if (callback) callback(null); }
            }
        };
        xhr.send();
    },
    getPensionRecords: function(callback) {
        if (this.cache.pension) { if(callback) callback(this.cache.pension); return; }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'pt720.csv?v=' + new Date().getTime(), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var lines = xhr.responseText.replace(/\r/g, '').split('\n');
                var data = [];
                for (var i = 1; i < lines.length; i++) {
                    if (!lines[i]) continue;
                    var parts = lines[i].split(','); if (parts.length < 4) continue;
                    var numArr = [];
                    var rawNums = LottoUtils.padLeft(parts[3].replace(/^\s+|\s+$/g, ''), 6, '0');
                    for(var n=0; n<6; n++) { numArr.push(Number(rawNums.charAt(n))); }
                    data.push({ drawNo: parts[0], date: parts[1], group: parts[2].replace(/^\s+|\s+$/g, ''), nums: numArr });
                }
                LottoDataManager.cache.pension = data;
                if(callback) callback(data);
            }
        };
        xhr.send();
    }
};

window.onerror = function(msg, url, lineNo, colNo, error) {
    LottoUtils.logError('Runtime Exception', { msg: msg, line: lineNo });
    return false;
};
