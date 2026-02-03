import { WebSocketServer } from "ws";
import { updateOrderStatus } from "./orderStore.js";
import { getOrderById } from "./orderStore.js";
import { getAllOrders } from "./orderStore.js";
const clients = new Set();

export function initOrderSocket(server) {
  const wss = new WebSocketServer({ server });

  console.log("[WS] Order WebSocket server running");

  wss.on("connection", (ws) => {
    console.log("[WS] Client connected");
    ws.send(
      JSON.stringify({
        type: "ORDERS_SNAPSHOT",
        orders: getAllOrders(),
      }),
    );
    clients.add(ws);

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      // 🔹 Kitchen → Server
      if (msg.type === "KITCHEN_ACTION") {
        updateOrderStatus(msg.orderId, msg.status);

        const updatedOrder = getOrderById(msg.orderId);

        broadcast({
          type: "ORDER_UPDATED",
          order: updatedOrder,
        });
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("[WS] Client disconnected");
    });
  });
}

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const client of clients) {
    try {
      client.send(data);
    } catch {}
  }
}

export function broadcastOrderCreated(order) {
  broadcast({
    type: "ORDER_CREATED",
    order,
  });
}

export function broadcastOrderUpdated(order) {
  broadcast({
    type: "ORDER_UPDATED",
    order,
  });
}
