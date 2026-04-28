document.addEventListener('DOMContentLoaded', () => {
    const winningNumbersContainer = document.getElementById('winning-numbers');
    const bonusNumberContainer = document.getElementById('bonus-number');
    const generateBtn = document.getElementById('generate-btn');

    function getBallColor(number) {
        if (number <= 10) return '#fbc400'; // Yellow
        if (number <= 20) return '#69c8f2'; // Blue
        if (number <= 30) return '#ff7272'; // Red
        if (number <= 40) return '#aaa'; // Gray
        return '#b0d840'; // Green
    }

    function createBall(number) {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.backgroundColor = getBallColor(number);
        ball.textContent = number;
        return ball;
    }

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        const winningNumbers = Array.from(numbers).sort((a, b) => a - b);

        let bonusNumber;
        do {
            bonusNumber = Math.floor(Math.random() * 45) + 1;
        } while (winningNumbers.includes(bonusNumber));

        return { winningNumbers, bonusNumber };
    }

    function displayNumbers() {
        winningNumbersContainer.innerHTML = '';
        bonusNumberContainer.innerHTML = '';

        const { winningNumbers, bonusNumber } = generateLottoNumbers();

        winningNumbers.forEach(number => {
            winningNumbersContainer.appendChild(createBall(number));
        });

        bonusNumberContainer.appendChild(createBall(bonusNumber));
    }

    generateBtn.addEventListener('click', displayNumbers);

    // Initial generation
    displayNumbers();
});
