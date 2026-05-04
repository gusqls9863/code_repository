document.addEventListener('DOMContentLoaded', () => {
    // 로또 번호 생성 관련
    const winningNumbersContainer = document.getElementById('winning-numbers');
    const bonusNumberContainer = document.getElementById('bonus-number');
    const generateBtn = document.getElementById('generate-btn');

    function getBallColor(number) {
        if (number <= 10) return '#fbc400';
        if (number <= 20) return '#69c8f2';
        if (number <= 30) return '#ff7272';
        if (number <= 40) return '#aaa';
        return '#b0d840';
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
    displayNumbers();

    // Teachable Machine AI 분류기 관련
    const URL = "https://teachablemachine.withgoogle.com/models/X5Lfk_5Rs6/";
    let model, maxPredictions;

    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const previewImage = document.getElementById('preview-image');
    const resultLabel = document.getElementById('result-label');
    const labelContainer = document.getElementById('label-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    async function initModel() {
        if (model) return;
        loadingSpinner.style.display = 'block';
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        loadingSpinner.style.display = 'none';
    }

    uploadBtn.addEventListener('click', () => imageUpload.click());

    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            await initModel();
            predict();
        };
        reader.readAsDataURL(file);
    });

    async function predict() {
        const prediction = await model.predict(previewImage);
        
        // 가장 높은 확률의 클래스 찾기
        let highestProb = 0;
        let bestClass = "";
        
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
            const div = document.createElement("div");
            div.innerHTML = classPrediction;
            labelContainer.appendChild(div);

            if (prediction[i].probability > highestProb) {
                highestProb = prediction[i].probability;
                bestClass = prediction[i].className;
            }
        }
        
        const resultEmoji = bestClass === "강아지" ? "🐶" : (bestClass === "고양이" ? "🐱" : "❓");
        resultLabel.innerHTML = `<h3>결과: ${resultEmoji} ${bestClass}일 확률이 높습니다!</h3>`;
    }
});
