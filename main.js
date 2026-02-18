document.getElementById('generate-btn').addEventListener('click', function() {
    const lottoContainer = document.getElementById('lotto-container');
    lottoContainer.innerHTML = ''; // 기존 번호 삭제

    // 1~45 사이의 중복되지 않는 6개 숫자 생성
    const numbers = [];
    while(numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if(!numbers.includes(num)) {
            numbers.push(num);
        }
    }

    // 숫자를 오름차순으로 정렬
    numbers.sort((a, b) => a - b);

    // 공 생성 및 화면 표시
    numbers.forEach((num, index) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.classList.add('ball');
            ball.innerText = num;

            // 숫자 범위에 따른 색상 클래스 추가
            if (num <= 10) ball.classList.add('yellow');
            else if (num <= 20) ball.classList.add('blue');
            else if (num <= 30) ball.classList.add('red');
            else if (num <= 40) ball.classList.add('gray');
            else ball.classList.add('green');

            lottoContainer.appendChild(ball);
        }, index * 100); // 0.1초 간격으로 순차적으로 등장
    });
});