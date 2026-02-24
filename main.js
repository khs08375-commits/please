import './lotto-ball.js';

const URL = "https://teachablemachine.withgoogle.com/models/ZENzZR5Eg/";
let model, webcam, labelContainer, maxPredictions;
let isWebcamMode = false;

// 동물상별 특징 데이터
const animalFeatures = {
    "강아지상": {
        title: "귀염뽀짝 강아지상!",
        description: "다정다감하고 사교적인 성격을 가진 당신은 주변 사람들에게 즐거움을 주는 에너자이저입니다! 눈망울이 선하고 부드러운 인상을 주며, 누구에게나 호감을 사는 매력적인 페이스를 가지셨네요."
    },
    "고양이상": {
        title: "도도하고 섹시한 고양이상!",
        description: "신비롭고 세련된 분위기를 풍기는 당신은 차가워 보일 수 있지만 알면 알수록 매력이 넘치는 '츤데레' 스타일입니다! 뚜렷한 이목구비와 날렵한 눈매가 매력 포인트이며, 독립적이고 지적인 인상을 줍니다."
    }
};

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
const resultMessageContainer = document.getElementById('result-message-container');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');

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

// 예측 로직
async function predict(inputElement) {
    const prediction = await model.predict(inputElement);
    let topAnimal = { name: "", prob: -1 };

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className === "Class 1" ? "강아지상" : (prediction[i].className === "Class 2" ? "고양이상" : prediction[i].className);
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        if (prediction[i].probability > topAnimal.prob) {
            topAnimal = { name: className, prob: prediction[i].probability };
        }

        const wrapper = labelContainer.childNodes[i];
        wrapper.querySelector('.class-name').textContent = className;
        wrapper.querySelector('.probability').textContent = probability + "%";
        wrapper.querySelector('.result-bar-fill').style.width = probability + "%";
    }

    // 특징 표시
    if (animalFeatures[topAnimal.name]) {
        resultTitle.textContent = topAnimal.name + " (" + (topAnimal.prob * 100).toFixed(0) + "% 일치)";
        resultDescription.textContent = animalFeatures[topAnimal.name].description;
        resultMessageContainer.style.display = 'block';
    }
}

// 사진 업로드
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
        resultMessageContainer.style.display = 'none';
        
        await loadModel();
        initLabelContainer();
        
        faceImage.onload = () => predict(faceImage);
    };
    reader.readAsDataURL(file);
});

// 웹캠 제어
async function startWebcam() {
    isWebcamMode = true;
    faceImage.style.display = 'none';
    webcamContainer.style.display = 'block';
    resultMessageContainer.style.display = 'none';
    webcamContainer.innerHTML = '카메라 로딩 중...';

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
