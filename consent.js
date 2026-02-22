(function() {
    // 이미 동의했는지 확인
    if (localStorage.getItem('lotto_consent_given')) return;

    // 배너 스타일 추가
    const style = document.createElement('style');
    style.innerHTML = `
        .consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
            z-index: 10000;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .consent-content {
            max-width: 800px;
            text-align: center;
            margin-bottom: 1rem;
        }
        .consent-text {
            font-size: 0.9rem;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }
        .consent-link {
            color: #3498db;
            text-decoration: underline;
            font-weight: bold;
        }
        .consent-buttons {
            display: flex;
            gap: 1rem;
        }
        .consent-btn {
            padding: 0.6rem 2rem;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }
        .btn-accept {
            background-color: #3498db;
            color: white;
        }
        .btn-accept:hover { background-color: #2980b9; }
        .btn-decline {
            background-color: #edf2f7;
            color: #4a5568;
        }
        .btn-decline:hover { background-color: #e2e8f0; }
        
        @media (max-width: 600px) {
            .consent-buttons { width: 100%; flex-direction: column; }
            .consent-btn { width: 100%; }
        }
    `;
    document.head.appendChild(style);

    // 배너 HTML 생성
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.innerHTML = `
        <div class="consent-content">
            <p class="consent-text">
                당사는 서비스 제공 및 광고 게재를 위해 쿠키와 개인정보를 사용합니다. 
                '동의'를 클릭하시면 <a href="privacy.html" class="consent-link">개인정보처리방침</a>에 따른 데이터 수집 및 맞춤형 광고 게재에 동의하는 것으로 간주됩니다.
            </p>
        </div>
        <div class="consent-buttons">
            <button class="consent-btn btn-accept" id="consent-accept">동의함</button>
            <button class="consent-btn btn-decline" id="consent-decline">거부함</button>
        </div>
    `;
    document.body.appendChild(banner);

    // 이벤트 리스너
    document.getElementById('consent-accept').addEventListener('click', function() {
        localStorage.setItem('lotto_consent_given', 'true');
        banner.style.display = 'none';
    });

    document.getElementById('consent-decline').addEventListener('click', function() {
        // 거부 시에는 저장하지 않고 배너만 닫거나, 사이트 이용 제한 안내 등을 할 수 있음
        banner.style.display = 'none';
    });
})();