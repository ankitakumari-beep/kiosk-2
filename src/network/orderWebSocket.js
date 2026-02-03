import { connectionLEDs } from "../ui/components/connectionLED.js";

let socket = null;

export function connectOrderSocket(orderId, onUpdate, onFail) {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("[WS] Connected");
    connectionLEDs.wsConnected();
  };

  socket.onmessage = (event) => {
    connectionLEDs.wsConnected();
    const data = JSON.parse(event.data);
    if (data.type === "ORDER_UPDATED") {
      onUpdate(data);
    }
  };

  socket.onerror = () => {
    connectionLEDs.wsDisconnected();
    socket.close();
  };

  socket.onclose = () => {
    connectionLEDs.wsDisconnected();
    onFail?.();
  };
}
