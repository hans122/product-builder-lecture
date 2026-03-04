/**
 * Pension History Script v2.0 - Expert Mode (Immortal Guardian)
 */

document.addEventListener('DOMContentLoaded', function() {
    LottoDataManager.getPensionRecords(function(records) {
        if (!records) return;
        renderExpertTable(records);
    });
});

function renderExpertTable(records) {
    var tbody = document.getElementById('pension-history-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    for (var i = 0; i < records.length; i++) {
        var draw = records[i];
        var tr = document.createElement('tr');
        
        // 지표 계산
        var balance = PensionUtils.analyzeBalance(draw.nums);
        var pattern = PensionUtils.analyzePatterns(draw.nums);
        
        // 회차/조 틀고정 열
        var html = '<td class="sticky-col first"><strong>' + draw.drawNo + '회</strong></td>' +
                   '<td class="sticky-col second"><div class="pension-ball group small">' + draw.group + '</div></td>';
        
        // 6자리 번호 (개별 셀)
        for (var j = 0; j < draw.nums.length; j++) {
            var n = draw.nums[j];
            var colorClass = n >= 5 ? 'blue' : 'yellow'; // 연금만의 간이 색상 구분
            html += '<td><div class="pension-ball small ' + colorClass + '" style="margin:0 auto; width:26px; height:26px; font-size:0.85rem;">' + n + '</div></td>';
        }
        
        // 통계 지표 열
        var sumStatus = balance.sum >= 20 && balance.sum <= 34 ? 'c-blue' : 'c-red';
        html += '<td class="' + sumStatus + '"><strong>' + balance.sum + '</strong></td>' +
                '<td>' + (6 - balance.odd) + ':' + balance.odd + '</td>' +
                '<td><span class="status-tag ' + (pattern.maxOccur >= 3 ? 'fail' : 'excellent') + '">' + 
                (pattern.maxOccur >= 3 ? '편중' : '균형') + '</span></td>';
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }
}
