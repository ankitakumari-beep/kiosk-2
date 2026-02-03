import { broadcastOrderCreated, broadcastOrderUpdated } from "./orderSocket.js";

const orders = new Map();

export async function handleCreateOrder(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const order = JSON.parse(body);
      if (orders.has(body.orderId)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "ALREADY_EXISTS" }));
      }
      orders.set(order.orderId, {
        ...order,
        status: "PLACED",
        timestamp: Date.now()
      });
      broadcastOrderCreated(orders.get(order.orderId));

      console.log("[Server] Order accepted:", order.orderId);

      // startLifecycle(order.orderId);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(400);
      res.end("Invalid order payload");
    }
  });
}

export function updateOrderStatus(orderId, status) {
  const order = orders.get(orderId);
  if (!order) return;

  order.status = status;
  broadcastOrderUpdated(order);
  console.log(`[Server] Order ${orderId} → ${status}`);
}

export function handleGetOrderStatus(req, res, orderId) {
  const order = orders.get(orderId);

  if (!order) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Order not found" }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: order.status }));
}

export function getAllOrders() {
  return Array.from(orders.values());
}

export function getOrderById(orderId) {
  return orders.get(orderId);
}
