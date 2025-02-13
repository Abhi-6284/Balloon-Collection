let score = 0;
let timeLeft = 60;
let highestScore = localStorage.getItem("highestScore") ? parseInt(localStorage.getItem("highestScore")) : 0;
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
    balloon.textContent = getRandomNumber(1, 10);
    balloon.dataset.value = balloon.textContent;
    balloon.style.left = getRandomNumber(10, 90) + "%";
    balloon.style.animationDuration = getRandomNumber(5, 8) + "s";
    document.querySelector(".container").appendChild(balloon);
    enableDragging(balloon);
}

function startBalloons() {
    balloonInterval = setInterval(createBalloon, window.innerWidth <= 600 ? 1500 : 1000);
}

function enableDragging(balloon) {
    function moveAt(clientX, clientY) {
        balloon.style.left = clientX - balloon.offsetWidth / 2 + "px";
        balloon.style.top = clientY - balloon.offsetHeight / 2 + "px";
    }

    function startDrag(event) {
        if (activeElement) return;
        event.preventDefault(); // Prevent scrolling on mobile

        activeElement = balloon;
        activeElement.style.animation = "none";
        activeElement.style.position = "absolute";
        activeElement.style.zIndex = 1000;

        let clientX = event.clientX || event.touches[0].clientX;
        let clientY = event.clientY || event.touches[0].clientY;

        moveAt(clientX, clientY);

        function onMove(event) {
            let moveX = event.clientX || event.touches[0].clientX;
            let moveY = event.clientY || event.touches[0].clientY;
            moveAt(moveX, moveY);
        }

        function release() {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", release);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", release);

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
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", release);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", release);
    }

    balloon.addEventListener("mousedown", startDrag);
    balloon.addEventListener("touchstart", startDrag, { passive: false });
}

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
