import { state } from "../core/state.js";

export function handleAction(orderId, status) {
  if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
    alert("Connection lost. Retrying…");
    return;
  }

  state.socket.send(JSON.stringify({
    type: "KITCHEN_ACTION",
    orderId,
    status
  }));
}
