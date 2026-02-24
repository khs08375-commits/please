import './lotto-ball.js';

const URL = "https://teachablemachine.withgoogle.com/models/ZENzZR5Eg/";
let model, webcam, labelContainer, maxPredictions;
let isWebcamMode = false;

// DOM 요소
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const startWebcamBtn = document.getElementById('start-webcam-btn');
const faceImage = document.getElementById('face-image');
const webcamContainer = document.getElementById('webcam-container');
const generateButton = document.getElementById('generate-button');
const numbersContainer = document.getElementById('numbers-container');

// 테마 관리
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

// 탭 전환 로직
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === target) content.classList.add('active');
        });

        // 웹캠이 켜져있다면 탭 전환 시 중지
        if (target !== 'animal-tab' && webcam) {
            stopWebcam();
        }
    });
});

// 모델 로드
async function loadModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

// 결과 컨테이너 초기화
function initLabelContainer() {
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
}

// 예측 로직 (이미지/웹캠 공용)
async function predict(inputElement) {
    const prediction = await model.predict(inputElement);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const wrapper = labelContainer.childNodes[i];
        wrapper.querySelector('.class-name').textContent = className === "Class 1" ? "강아지상" : (className === "Class 2" ? "고양이상" : className);
        wrapper.querySelector('.probability').textContent = probability + "%";
        wrapper.querySelector('.result-bar-fill').style.width = probability + "%";
    }
}

// 사진 업로드 이벤트
uploadBtn.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    stopWebcam();
    const reader = new FileReader();
    reader.onload = async (event) => {
        faceImage.src = event.target.result;
        faceImage.style.display = 'block';
        webcamContainer.style.display = 'none';
        
        await loadModel();
        initLabelContainer();
        
        // 이미지가 로드된 후 예측 실행
        faceImage.onload = () => predict(faceImage);
    };
    reader.readAsDataURL(file);
});

// 웹캠 제어
async function startWebcam() {
    isWebcamMode = true;
    faceImage.style.display = 'none';
    webcamContainer.style.display = 'block';
    webcamContainer.innerHTML = '로딩 중...';

    await loadModel();
    initLabelContainer();

    webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup();
    await webcam.play();
    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcam.canvas);
    window.requestAnimationFrame(webcamLoop);
}

function stopWebcam() {
    if (webcam) {
        webcam.stop();
        webcam = null;
        isWebcamMode = false;
        webcamContainer.innerHTML = '';
    }
}

async function webcamLoop() {
    if (!isWebcamMode) return;
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(webcamLoop);
}

startWebcamBtn.addEventListener('click', startWebcam);

// 로또 번호 생성
generateButton.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    Array.from(numbers).sort((a, b) => a - b).forEach(num => {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', num);
        numbersContainer.appendChild(ball);
    });
});
