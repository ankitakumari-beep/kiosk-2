import { kitchenRoutes } from "./routes/kitchen.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { paymentRoutes } from "./routes/payment.routes.js";
import { sseRoutes } from "./routes/sse.routes.js";
import { staticRoutes } from "./routes/static.routes.js";

export async function router(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (await kitchenRoutes(req, res)) return;
  if (await adminRoutes(req, res)) return;
  if (orderRoutes(req, res)) return;
  if (paymentRoutes(req, res)) return;
  if (sseRoutes(req, res)) return;
  if (staticRoutes(req, res)) return;

  res.writeHead(404);
  res.end("Not Found");
}
