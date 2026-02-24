
import './lotto-ball.js';

const generateButton = document.getElementById('generate-button');
const numbersContainer = document.getElementById('numbers-container');

generateButton.addEventListener('click', () => {
    generateNumbers();
});

function generateNumbers() {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    for (const number of numbers) {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', number);
        numbersContainer.appendChild(ball);
    }
}
