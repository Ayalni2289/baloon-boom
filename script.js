// DOM elementleri
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");
const xUsernameInput = document.getElementById("xUsername");
const startGameBtn = document.getElementById("startGameBtn");
const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const mistakesDisplay = document.getElementById("mistakes");
const gameOverEl = document.getElementById("gameOver");
const playerNameDisplay = document.getElementById("playerName");

// Oyun değişkenleri
let score = 0;
let mistakes = 0;
let isGameOver = false;
let playerName = "";
let spawnInterval;
const popSound = new Audio('sounds/pop.mp3');
const bombSound = new Audio('sounds/bomba.mp3');

function createItem() {
  if (isGameOver) return;

  const item = document.createElement("div");
  const isBomb = Math.random() < 0.4;

  item.classList.add(isBomb ? "bomba" : "balon");

  if (!isBomb) {
    item.style.backgroundImage = "url('public/logo.png')";
  } else {
    item.style.backgroundImage = "url('public/bomb.png')";
  }
  item.style.backgroundSize = "contain";
  item.style.backgroundRepeat = "no-repeat";
  item.style.backgroundPosition = "center";

  const x = Math.random() * (window.innerWidth - 60);
  item.style.left = `${x}px`;

  const xMove = (Math.random() * 200 - 100) + "px";
  item.style.setProperty("--xMove", xMove);

  item.addEventListener("click", () => {
    item.remove();
  
    if (isBomb) {
      bombSound.currentTime = 0;  // Baştan çalması için
      bombSound.play();
      mistakes++;
      mistakesDisplay.textContent = mistakes;
      if (mistakes >= 3) endGame();
    } else {
      popSound.currentTime = 0;
      popSound.play();
      score++;
      scoreDisplay.textContent = score;
    }
  });

  // Animasyon süresi kadar bekle, sonra kaldır
  setTimeout(() => {
    item.remove();
  }, 3000); // 3 saniye

  gameArea.appendChild(item);
}

// Başlatırken interval süresi:
spawnInterval = setInterval(createItem, 500); // 0.5 saniyede bir yeni balon/bomba


function endGame() {
  isGameOver = true;
  gameOverEl.style.display = "block";
  clearInterval(spawnInterval);
  gameArea.style.display = "none";  // Burada gameArea'yı gizliyoruz
  
  saveScore(playerName, score);
  
  // Otomatik reset yok, kullanıcı butona basacak
  showScoreBoard();
}
const earnPointsBtn = document.getElementById("earnPointsBtn");

earnPointsBtn.addEventListener("click", () => {
  // Kullanıcıyı X (Twitter) sayfasına yönlendir
  window.open("https://x.com/Ethereum_OS", "_blank");
});


const tryAgainBtn = document.getElementById("tryAgainBtn");
tryAgainBtn.addEventListener("click", () => {
  resetGame();
});


function saveScore(player, finalScore) {
  // Mevcut skorları al
  let scores = JSON.parse(localStorage.getItem("balloonGameScores") || "[]");
  
  // Yeni skoru ekle
  scores.push({
    player: player,
    score: finalScore,
    date: new Date().toLocaleDateString("tr-TR"),
    time: new Date().toLocaleTimeString("tr-TR")
  });
  
  // Skorları puanına göre sırala (yüksekten düşüğe)
  scores.sort((a, b) => b.score - a.score);
  
  // Sadece en iyi 10 skoru sakla
  scores = scores.slice(0, 10);
  
  // LocalStorage'a kaydet
  localStorage.setItem("balloonGameScores", JSON.stringify(scores));
  
  // Kullanıcıya bilgi ver
  alert(`${player} - Score: ${finalScore} points! 🎉`);
}

function resetGame() {
  score = 0;
  mistakes = 0;
  isGameOver = false;
  scoreDisplay.textContent = "0";
  mistakesDisplay.textContent = "0";
  gameOverEl.style.display = "none";
  gameArea.style.display = "block";  // Oyun yeniden başlarken tekrar göster
  document.getElementById("scoreBoard").style.display = "none";
  gameArea.innerHTML = "";
  
  loginScreen.style.display = "flex";
  gameScreen.style.display = "none";
  xUsernameInput.value = "";
}


// Oyun başlatma fonksiyonu
function startGame() {
  const username = xUsernameInput.value.trim();
  
  if (username === "") {
    alert("Please enter your X username!");
    return;
  }
  
  playerName = username.startsWith("@") ? username : "@" + username;
  playerNameDisplay.textContent = playerName;
  
  loginScreen.style.display = "none";
  gameScreen.style.display = "block";

  // "+500 points" animasyonunu gizle
  const anim = document.getElementById("pointsAnimation");
  if (anim) {
    anim.style.opacity = "0";
  }

  // localStorage'dan kazanılmış puanı al ve skora ekle
  score = getEarnedPoints();
  scoreDisplay.textContent = score;

  mistakes = 0;
  mistakesDisplay.textContent = mistakes;
  isGameOver = false;
  gameArea.innerHTML = "";
  
  spawnInterval = setInterval(createItem, 800);
}
// Event listener'ları ekle
startGameBtn.addEventListener("click", startGame);
xUsernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    startGame();
  }
});
function showScoreBoard() {
  const scores = JSON.parse(localStorage.getItem("balloonGameScores") || "[]");
  const scoreBoard = document.getElementById("scoreBoard");
  const scoreList = document.getElementById("scoreList");

  scoreList.innerHTML = "";

  scores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.player} - ${entry.score} puan (${entry.date} ${entry.time})`;
    scoreList.appendChild(li);
  });

  scoreBoard.style.display = "block";
}

document.getElementById("scoreBoard").style.display = "none";
// Önce localStorage'dan kazanılmış puanı al (yoksa 0)
function getEarnedPoints() {
  return parseInt(localStorage.getItem("earnedPoints") || "0");
}

// Puan ekle ve göster
function addEarnedPoints(points) {
  let current = getEarnedPoints();
  current += points;
  localStorage.setItem("earnedPoints", current);

  showPointsAnimation(`+${points} points`);
}

// +500 points animasyonunu gösteren fonksiyon
function showPointsAnimation(text) {
  // Eğer zaten varsa kaldırmadan yeni oluşturma, bir tane sürekli gösterelim:
  let anim = document.getElementById("pointsAnimation");
  if (!anim) {
    anim = document.createElement("div");
    anim.id = "pointsAnimation";
    anim.style.position = "fixed";
    anim.style.top = "20%";
    anim.style.left = "50%";
    anim.style.transform = "translateX(-50%)";
    anim.style.background = "rgba(0,0,0,0.7)";
    anim.style.color = "lime";
    anim.style.padding = "10px 20px";
    anim.style.borderRadius = "8px";
    anim.style.fontSize = "24px";
    anim.style.fontWeight = "bold";
    anim.style.zIndex = 2000;
    anim.style.pointerEvents = "none";
    anim.style.userSelect = "none";
    document.body.appendChild(anim);
  }
  
  anim.textContent = text;
  anim.style.opacity = "1";
  anim.style.transition = "none";
  anim.style.top = "20%";
}


// Earn Points butonuna tıklandığında
document.getElementById("earnPointsBtn").addEventListener("click", () => {
  addEarnedPoints(500);
});

// Oyun başlarken skor başlangıcına earnedPoints ekle
function startGame() {
  const username = xUsernameInput.value.trim();
  
  if (username === "") {
    alert("Please enter your X username!");
    return;
  }
  
  playerName = username.startsWith("@") ? username : "@" + username;
  playerNameDisplay.textContent = playerName;
  
  // Giriş ekranını gizle, oyun ekranını göster
  loginScreen.style.display = "none";
  gameScreen.style.display = "block";

  // "+500 points" animasyonunu gizle
  const anim = document.getElementById("pointsAnimation");
  if (anim) {
    anim.style.opacity = "0";
    // İstersen tamamen kaldırmak için:
    // anim.remove();
  }

  // Oyunu başlat
  spawnInterval = setInterval(createItem, 800); // hız artırıldıysa vs.
}
