const clipArea = document.getElementById("clipArea");
const clipText = document.getElementById("clipText");
const durationSelect = document.getElementById("duration");
const timeStat = document.getElementById("timeStat");
const clickStat = document.getElementById("clickStat");
const cpsStat = document.getElementById("cpsStat");
const resultBox = document.getElementById("resultBox");
const colorSelect = document.getElementById("colorSelect");
const rankingTable = document.querySelector("#rankingTable tbody");
const background = document.getElementById("background");

let clicks = 0;
let running = false;
let showingResults = false;
let testData = [];
let neonColor = "#00bcd4";
let lightInterval;

// === Dynamic Neon Background ===
function createLight() {
  const light = document.createElement("div");
  const size = Math.random() * 200 + 100;
  light.style.position = "absolute";
  light.style.width = `${size}px`;
  light.style.height = `${size}px`;
  light.style.borderRadius = "50%";
  light.style.background = `${neonColor}20`;
  light.style.top = `${Math.random() * 100}%`;
  light.style.left = `${Math.random() * 100}%`;
  light.style.filter = "blur(50px)";
  light.style.animation = "float 10s ease-in-out infinite";
  background.appendChild(light);
  setTimeout(() => light.remove(), 10000);
}

function startBackgroundLights() {
  clearInterval(lightInterval);
  background.innerHTML = "";
  lightInterval = setInterval(createLight, 600);
}

document.documentElement.style.setProperty("--neon-color", neonColor);
startBackgroundLights();

// === Neon color change ===
colorSelect.addEventListener("change", e => {
  neonColor = e.target.value;
  document.documentElement.style.setProperty("--neon-color", neonColor);
  startBackgroundLights();
});

// === Main Test ===
clipArea.addEventListener("click", () => {
  if (running || showingResults) return;
  startTest();
});

function startTest() {
  const duration = parseInt(durationSelect.value);
  clicks = 0;
  running = true;
  clipArea.classList.add("active");
  clipText.textContent = "Click fast!";
  timeStat.textContent = `${duration}s`;
  clickStat.textContent = "0";
  cpsStat.textContent = "0";

  const startTime = Date.now();

  const handleClick = () => {
    clicks++;
    clickStat.textContent = clicks;
    const elapsed = (Date.now() - startTime) / 1000;
    const cps = (clicks / elapsed).toFixed(2);
    cpsStat.textContent = cps;
  };

  clipArea.addEventListener("click", handleClick);

  setTimeout(() => {
    running = false;
    clipArea.classList.remove("active");
    clipArea.removeEventListener("click", handleClick);
    const cps = (clicks / duration).toFixed(2);
    showResult(duration, clicks, cps);
  }, duration * 1000);
}

function showResult(duration, clicks, cps) {
  showingResults = true;
  resultBox.innerHTML = `
    <h2>Results</h2>
    <p>Duration: ${duration}s</p>
    <p>Clicks: ${clicks}</p>
    <p>CPS: <strong>${cps}</strong></p>
    <p>Click anywhere to continue</p>
  `;
  resultBox.classList.remove("hidden");

  testData.push({ duration, clicks, cps: parseFloat(cps) });
  updateRanking("general");

  const closeHandler = (e) => {
    if (e.target.closest("#resultBox")) return;
    resultBox.classList.add("hidden");
    showingResults = false;
    document.removeEventListener("click", closeHandler);
    clipText.textContent = "Click to start the test";
  };

  setTimeout(() => {
    document.addEventListener("click", closeHandler);
  }, 500);
}

// === Ranking ===
function updateRanking(mode) {
  let sorted = [...testData];
  if (mode === "general") {
    sorted.sort((a, b) => b.cps - a.cps);
  } else {
    const dur = parseInt(durationSelect.value);
    sorted = sorted.filter(d => d.duration === dur);
    sorted.sort((a, b) => b.cps - a.cps);
  }

  rankingTable.innerHTML = sorted
    .map(
      (t, i) =>
        `<tr>
          <td>${i + 1}</td>
          <td>${t.duration}s</td>
          <td>${t.clicks}</td>
          <td>${t.cps}</td>
        </tr>`
    )
    .join("");
}

document.getElementById("generalRank").addEventListener("click", () => {
  updateRanking("general");
});

document.getElementById("byDurationRank").addEventListener("click", () => {
  updateRanking("byDuration");
});

// === Startup message ===
window.addEventListener("load", () => {
  clipText.textContent = "Click to start the test";
});
