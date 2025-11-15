document.getElementById("startBtn").addEventListener("click", () => {
    window.location.href = "../game/game.html";
});

startButton.addEventListener("click", () => {
  document.body.style.transition = "opacity 0.8s ease";
  document.body.style.opacity = 0;
  
  setTimeout(() => {
    alert("Game Starting..."); 
  }, 800);
});

function openRules() {
  document.getElementById("rulesPopup").style.display = "flex";
}

function closeRules() {
  document.getElementById("rulesPopup").style.display = "none";
}