import crypto from "crypto";

const payments = new Map();

export function initPayment(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const {
      amount,
      payerName,
      paymentMethod,
      upiId,
    } = JSON.parse(body || "{}");

    if (!amount || !payerName || !paymentMethod) {
      res.writeHead(400);
      return res.end("Invalid payment payload");
    }

    const paymentId = crypto.randomUUID();

    payments.set(paymentId, {
      status: "PENDING",
      amount,
      payerName,
      paymentMethod,
      upiId,
      createdAt: Date.now(),
    });

    // Simulate gateway processing time (3s–25s)
    const delay = 3000 + Math.random() * 1000;

    setTimeout(() => {
      const success = Math.random() < 0.7; // 70% success rate
      const payment = payments.get(paymentId);
      if (!payment) return;

      payments.set(paymentId, {
        ...payment,
        status: success ? "SUCCESS" : "FAILED",
        updatedAt: Date.now(),
      });
    }, delay);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ paymentId }));
  });
}

export function pollPaymentStatus(req, res, paymentId) {
  const start = Date.now();
  const TIMEOUT = 30000;

  const interval = setInterval(() => {
    const payment = payments.get(paymentId);

    if (!payment) {
      clearInterval(interval);
      res.writeHead(404);
      return res.end();
    }

    if (payment.status !== "PENDING") {
      clearInterval(interval);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          status: payment.status,
          updatedAt: payment.updatedAt,
        })
      );
    }

    if (Date.now() - start > TIMEOUT) {
      clearInterval(interval);
      res.writeHead(204); 
      return res.end();
    }
  }, 1000);
}
