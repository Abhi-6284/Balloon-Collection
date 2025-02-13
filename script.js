let score = 0;
let timeLeft = 60;
let highestScore = localStorage.getItem("highestScore") ? parseInt(localStorage.getItem("highestScore")) : 0;
let scoreHistory = JSON.parse(localStorage.getItem("scoreHistory")) || [];
let activeElement = null;
let timerInterval;
let balloonInterval;
const retryBtn = document.getElementById("retry-btn");

document.getElementById("highest-score").textContent = highestScore;

const popSound = new Audio("pop.mp3");
const errorSound = new Audio("error.mp3");
const gameOverSound = new Audio("gameover.mp3");

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBalloon() {
    const balloon = document.createElement("div");
    balloon.classList.add("heart");

    if (Math.random() > 0.8) {
        balloon.classList.add("zigzag"); // Randomly assign zigzag movement
    }

    const balloonNumber = getRandomNumber(1, 10);
    balloon.textContent = balloonNumber;
    balloon.dataset.value = balloonNumber;

    balloon.style.left = getRandomNumber(10, 90) + "%";
    balloon.style.animationDuration = getRandomNumber(5, 8) + "s";

    document.querySelector(".container").appendChild(balloon);
}

function startBalloons() {
    balloonInterval = setInterval(createBalloon, 1000);
}

document.addEventListener("mousedown", function (event) {
    const target = event.target.closest(".heart");
    if (!target || activeElement) return;

    activeElement = target;
    activeElement.style.animation = "none";
    activeElement.style.position = "absolute";
    activeElement.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);

    function moveAt(clientX, clientY) {
        activeElement.style.left = clientX - activeElement.offsetWidth / 2 + "px";
        activeElement.style.top = clientY - activeElement.offsetHeight / 2 + "px";
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener("mouseup", function release() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", release);

        const bucket = document.querySelector(".bucket");
        const bucketRect = bucket.getBoundingClientRect();
        const heartRect = activeElement.getBoundingClientRect();

        if (
            heartRect.left >= bucketRect.left &&
            heartRect.right <= bucketRect.right &&
            heartRect.top >= bucketRect.top &&
            heartRect.bottom <= bucketRect.bottom
        ) {
            score += parseInt(activeElement.dataset.value);
            document.getElementById("score").textContent = score;
            activeElement.remove();
            popSound.play();
        } else {
            activeElement.style.animation = "floatUp 6s infinite ease-in-out";
            errorSound.play();
        }

        activeElement = null;
    }, { once: true });
});

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameOverSound.play();
    alert("Time's up! Your final score: " + score);

    scoreHistory.push(score);
    localStorage.setItem("scoreHistory", JSON.stringify(scoreHistory));

    let averageScore = scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;
    document.getElementById("average-score").textContent = Math.round(averageScore);

    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem("highestScore", highestScore);
        document.getElementById("highest-score").textContent = highestScore;
    }

    document.querySelectorAll(".heart").forEach(balloon => balloon.remove());
    clearInterval(balloonInterval);

    retryBtn.style.display = "block";
}

retryBtn.addEventListener("click", function () {
    retryBtn.style.display = "none";
    score = 0;
    timeLeft = 60;
    document.getElementById("score").textContent = score;
    document.getElementById("time").textContent = timeLeft;
    startBalloons();
    startTimer();
});

startBalloons();
startTimer();
