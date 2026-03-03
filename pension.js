/**
 * Pension History Engine v2.1 (ES5 Safe Mode)
 */

document.addEventListener('DOMContentLoaded', function() {
    var historyBody = document.getElementById('pension-history-body');
    if (!historyBody) return;

    try {
        // 콜백 방식으로 데이터 로드
        LottoDataManager.getPensionRecords(function(records) {
            if (!records || records.length === 0) {
                historyBody.innerHTML = '<tr><td colspan="4" class="placeholder">등록된 당첨 데이터가 없습니다.</td></tr>';
                return;
            }

            var html = '';
            for (var i = 0; i < records.length; i++) {
                var rec = records[i];
                var numBallsHtml = '';
                for (var j = 0; j < rec.nums.length; j++) {
                    numBallsHtml += '<span class="pension-ball">' + rec.nums[j] + '</span>';
                }

                var drawDate = rec.date;
                var formattedDate = drawDate;
                if (drawDate.length === 8) {
                    formattedDate = drawDate.substring(0,4) + '.' + drawDate.substring(4,6) + '.' + drawDate.substring(6,8);
                }

                html += '<tr>';
                html += '<td class="draw-no">' + rec.drawNo + '회</td>';
                html += '<td><span class="pension-ball group">' + rec.group + '</span></td>';
                html += '<td style="text-align: left;"><div style="display: flex; align-items: center; justify-content: center;">' + numBallsHtml + '</div></td>';
                html += '<td><span class="status-badge safe" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;">' + formattedDate + '</span></td>';
                html += '</tr>';
            }
            historyBody.innerHTML = html;
        });

    } catch (error) {
        console.error('Pension History Error:', error);
        historyBody.innerHTML = '<tr><td colspan="4" class="placeholder">데이터를 로드하는 중 오류가 발생했습니다.</td></tr>';
    }
});
