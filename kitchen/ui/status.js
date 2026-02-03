const statusEl = document.getElementById("connectionStatus");
const dot = document.querySelector(".pulse-dot");

export function updateConnectionStatus(state) {
  if (state === "connected") {
    statusEl.textContent = "Live";
    dot.style.background = "#10b981";
  } else if (state === "polling") {
    statusEl.textContent = "Polling";
    dot.style.background = "#f59e0b";
  } else {
    statusEl.textContent = "Connecting...";
    dot.style.background = "#6b7280";
  }
}
