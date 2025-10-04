let matchRunning = false;
let inGameMinutes = 0;
let timerInterval;
let gameSpeed = 1; // default (1 real min = 1 PES min)

document.getElementById("liveScoreBtn").addEventListener("click", () => {
  const panel = document.getElementById("liveScorePanel");
  panel.style.display = (panel.style.display === "flex") ? "none" : "flex";
});

// Admin functions
function startMatch(speed) {
  if (matchRunning) return;
  gameSpeed = speed;
  matchRunning = true;
  document.getElementById("matchStatus").innerText = "Live";

  timerInterval = setInterval(() => {
    inGameMinutes++;
    let displayMin = Math.floor(inGameMinutes);
    let displaySec = Math.floor((inGameMinutes % 1) * 60);
    if (displaySec < 10) displaySec = "0" + displaySec;
    document.getElementById("matchTime").innerText = `${displayMin}:${displaySec}`;

    if (inGameMinutes >= 95) {
      endMatch();
    }
  }, 1000 / gameSpeed); // Adjust speed
}

function continueMatch() {
  if (!matchRunning) startMatch(gameSpeed);
}

function endMatch() {
  clearInterval(timerInterval);
  matchRunning = false;
  document.getElementById("matchStatus").innerText = "Match Over";
  document.getElementById("matchTime").innerText = new Date().toLocaleString();
}
