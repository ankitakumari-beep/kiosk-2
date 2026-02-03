import { API } from "../core/config.js";
import { state } from "../core/state.js";
import { render } from "../ui/renderer.js";
import { updateConnectionStatus } from "../ui/status.js";

export async function fetchOrders() {
  try {
    const res = await fetch(`${API}/kitchen/orders`);
    if (!res.ok) return;

    state.orders = await res.json();
    render();
  } catch {
    console.error("[Kitchen] Polling failed");
  }
}

export function startPolling() {
  if (state.pollingTimer) return;

  updateConnectionStatus("polling");
  fetchOrders();
  state.pollingTimer = setInterval(fetchOrders, 3000);
}

export function stopPolling() {
  if (!state.pollingTimer) return;
  clearInterval(state.pollingTimer);
  state.pollingTimer = null;
}
