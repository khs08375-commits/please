import './lotto-ball.js';

// --- 전역 설정 및 상태 ---
const URL = "https://teachablemachine.withgoogle.com/models/ZENzZR5Eg/";
let model, webcam, labelContainer, maxPredictions;

// --- DOM 요소 ---
const themeToggle = document.getElementById('theme-toggle');
const startTestButton = document.getElementById('start-test-button');
const generateButton = document.getElementById('generate-button');
const numbersContainer = document.getElementById('numbers-container');
const body = document.body;

// --- 테마 관리 ---
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = 'Light Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    themeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', theme);
});

// --- 동물상 테스트 (Teachable Machine) ---
async function initAnimalTest() {
    startTestButton.disabled = true;
    startTestButton.textContent = "모델 로딩 중...";
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; 
    webcam = new tmImage.Webcam(200, 200, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = '';
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-bar-wrapper';
        wrapper.innerHTML = `
            <div class="result-label">
                <span class="class-name"></span>
                <span class="probability">0%</span>
            </div>
            <div class="result-bar-bg">
                <div class="result-bar-fill"></div>
            </div>
        `;
        labelContainer.appendChild(wrapper);
    }
    
    startTestButton.textContent = "테스트 실행 중";
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const wrapper = labelContainer.childNodes[i];
        wrapper.querySelector('.class-name').textContent = className === "Class 1" ? "강아지상" : (className === "Class 2" ? "고양이상" : className);
        wrapper.querySelector('.probability').textContent = probability + "%";
        wrapper.querySelector('.result-bar-fill').style.width = probability + "%";
    }
}

startTestButton.addEventListener('click', initAnimalTest);

// --- 로또 번호 생성기 ---
function generateNumbers() {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    for (const number of sortedNumbers) {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', number);
        numbersContainer.appendChild(ball);
    }
}

generateButton.addEventListener('click', generateNumbers);
