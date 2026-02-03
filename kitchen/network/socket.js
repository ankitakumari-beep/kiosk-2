import { WS_URL } from "../core/config.js";
import { state } from "../core/state.js";
import { render } from "../ui/renderer.js";
import { startPolling, stopPolling } from "./polling.js";
import { updateConnectionStatus } from "../ui/status.js";

export function connectWS() {
  updateConnectionStatus("connecting");
  state.socket = new WebSocket(WS_URL);

  state.socket.onopen = () => {
    updateConnectionStatus("connected");
    stopPolling();
  };

  state.socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "ORDERS_SNAPSHOT") {
      if (msg.orders.length > 0) {
        state.orders = msg.orders;
        render();
      }
      return;
    }

    if (msg.type === "ORDER_CREATED" || msg.type === "ORDER_UPDATED") {
      const idx = state.orders.findIndex(
        o => String(o.orderId) === String(msg.order.orderId)
      );

      if (idx === -1) state.orders.push(msg.order);
      else state.orders[idx] = msg.order;

      render();
    }
  };

  state.socket.onerror = () => state.socket.close();

  state.socket.onclose = () => {
    startPolling();
    setTimeout(connectWS, 3000);
  };
}
