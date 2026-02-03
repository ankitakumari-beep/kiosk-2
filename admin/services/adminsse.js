import { loadProducts } from "../state/adminProductState.js";

const API = "http://localhost:3000";

export function initAdminSSE() {
  const es = new EventSource(`${API}/price-inventory-stream`);

  es.onmessage = async () => {
    await loadProducts();
  };

  es.onopen = () => {
    document.getElementById("statusText").textContent = "Connected";
    document.querySelector(".status-dot").style.background = "#10b981";
  };

  es.onerror = () => {
    document.getElementById("statusText").textContent = "Disconnected";
    document.querySelector(".status-dot").style.background = "#ef4444";
  };
}
