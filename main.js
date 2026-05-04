document.addEventListener('DOMContentLoaded', () => {
    // === 로또 번호 생성 관련 ===
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

    // === Teachable Machine AI 분류기 관련 ===
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/X5Lfk_5Rs6/";
    let model, maxPredictions;

    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const previewImage = document.getElementById('preview-image');
    const resultLabel = document.getElementById('result-label');
    const labelContainer = document.getElementById('label-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    // 모델 미리 로드 (성능 및 구동 안정성 향상)
    async function initModel() {
        if (model) return;
        try {
            loadingSpinner.style.display = 'block';
            loadingSpinner.innerText = 'AI 모델 불러오는 중...';
            const modelURL = MODEL_URL + "model.json";
            const metadataURL = MODEL_URL + "metadata.json";
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
            loadingSpinner.style.display = 'none';
            console.log("Model loaded successfully");
        } catch (error) {
            console.error("Model load failed:", error);
            loadingSpinner.innerText = '모델 로드 실패. URL을 확인해주세요.';
        }
    }

    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            // 이미지 소스 설정
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            
            // 이미지가 완전히 로드된 후 예측 수행
            previewImage.onload = async () => {
                await initModel();
                if (model) {
                    predict();
                }
            };
        };
        reader.readAsDataURL(file);
    });

    async function predict() {
        if (!model) return;
        
        resultLabel.innerHTML = "판별 중...";
        try {
            const prediction = await model.predict(previewImage);
            
            let highestProb = 0;
            let bestClass = "";
            
            labelContainer.innerHTML = "";
            prediction.forEach(p => {
                const classPrediction = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
                const div = document.createElement("div");
                div.innerHTML = classPrediction;
                labelContainer.appendChild(div);

                if (p.probability > highestProb) {
                    highestProb = p.probability;
                    bestClass = p.className;
                }
            });
            
            const resultEmoji = bestClass === "강아지" ? "🐶" : (bestClass === "고양이" ? "🐱" : "✨");
            resultLabel.innerHTML = `<h3>결과: ${resultEmoji} ${bestClass}일 확률이 ${(highestProb * 100).toFixed(1)}%입니다!</h3>`;
        } catch (error) {
            console.error("Prediction failed:", error);
            resultLabel.innerHTML = "판별 오류가 발생했습니다.";
        }
    }
    
    // 페이지 로드 시 모델 미리 로드 시작
    initModel();
});
