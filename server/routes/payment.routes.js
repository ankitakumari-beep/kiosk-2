import { initPayment, pollPaymentStatus } from "../paymentEngine.js";

export function paymentRoutes(req, res) {
  if (req.method === "POST" && req.url === "/payments/init") {
    return initPayment(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/payments/")) {
    const parts = req.url.split("/");
    if (parts[3] === "status") {
      return pollPaymentStatus(req, res, parts[2]);
    }
  }

  return false;
}
