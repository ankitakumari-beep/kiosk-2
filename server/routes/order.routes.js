import {
  handleCreateOrder,
  handleGetOrderStatus
} from "../orderStore.js";

export function orderRoutes(req, res) {
  if (req.method === "POST" && req.url === "/orders") {
    return handleCreateOrder(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/orders/")) {
    const parts = req.url.split("/");
    if (parts[3] === "status") {
      return handleGetOrderStatus(req, res, parts[2]);
    }
  }

  return false;
}
