import { parseBody } from "../utils/parseBody.js";
import { getAllOrders, updateOrderStatus } from "../orderStore.js";

export async function kitchenRoutes(req, res) {
  if (req.method === "GET" && req.url === "/kitchen/orders") {
    const orders = getAllOrders().filter(o =>
      ["PENDING", "ACCEPTED", "READY"].includes(o.status)
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(orders));
  }

  if (req.method === "POST" && req.url.startsWith("/kitchen/orders/")) {
    const orderId = req.url.split("/")[3];
    const body = await parseBody(req);

    if (!body.status) {
      res.writeHead(400);
      return res.end("Missing status");
    }

    updateOrderStatus(orderId, body.status);
    res.writeHead(200);
    return res.end();
  }

  return false;
}
