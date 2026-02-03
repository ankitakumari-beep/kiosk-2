import fs from "fs";
import path from "path";
import url from "url";
import http from "http";
import {
  handleCreateOrder,
  handleGetOrderStatus,
  updateOrderStatus,
  getAllOrders,
} from "./orderStore.js";

import { addSSEClient, removeSSEClient } from "./sse.js";
import "./priceInventoryEngine.js";
import {
  createProduct,
  updateProduct,
  updateInventory,
  deleteProduct,
} from "./priceInventoryEngine.js";
import { initOrderSocket } from "./orderSocket.js";
import { initPayment, pollPaymentStatus } from "./paymentEngine.js";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/kitchen/orders") {
    const orders = getAllOrders();

    const activeOrders = orders.filter((o) =>
      ["PENDING", "ACCEPTED", "READY"].includes(o.status),
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(activeOrders));
  }

  if (req.method === "POST" && req.url.startsWith("/kitchen/orders/")) {
    const parts = req.url.split("/");
    const orderId = parts[3];

    const body = await parseBody(req);

    if (!body.status) {
      res.writeHead(400);
      return res.end("Missing status");
    }

    updateOrderStatus(orderId, body.status);

    res.writeHead(200);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/admin/product") {
    try {
      const body = await parseBody(req);

      const {
        productId,
        name,
        description = "",
        basePrice,
        availableQuantity = 0,
        imageUrl,
        imageBase64, // 🆕 ADD
        categoryIds = [],
      } = body;

      if (!productId || !name || basePrice == null) {
        res.writeHead(400);
        return res.end("Invalid product data");
      }
      console.log("[SERVER] imageBase64 present:", !!body.imageBase64);
      createProduct({
        productId,
        name,
        description,
        basePrice,
        availableQuantity,
        imageUrl,
        imageBase64,
        categoryIds,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "PRODUCT_CREATED" }));
    } catch (err) {
      console.error("[Admin] Create product failed", err);
      res.writeHead(500);
      return res.end("Failed to create product");
    }
  }

  if (req.method === "PATCH" && req.url.startsWith("/admin/product/")) {
    try {
      const productId = req.url.split("/")[3];
      const body = await parseBody(req);
      console.log("[PATCH] raw body:", body);
      const { name, basePrice } = body;

      if (name == null && basePrice == null) {
        res.writeHead(400);
        return res.end("Nothing to update");
      }

      updateProduct(productId, {
        ...(name != null && { name }),
        ...(basePrice != null && { basePrice }),
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "PRODUCT_UPDATED" }));
    } catch (err) {
      console.error("[Admin] Update product failed", err);
      res.writeHead(500);
      return res.end("Failed to update product");
    }
  }
  if (req.method === "PATCH" && req.url.startsWith("/admin/inventory/")) {
    try {
      const productId = req.url.split("/")[3];
      const body = await parseBody(req);

      const { availableQuantity } = body;

      if (availableQuantity == null || availableQuantity < 0) {
        res.writeHead(400);
        return res.end("Invalid quantity");
      }

      updateInventory(productId, availableQuantity);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "INVENTORY_UPDATED" }));
    } catch (err) {
      console.error("[Admin] Update inventory failed", err);
      res.writeHead(500);
      return res.end("Failed to update inventory");
    }
  }
  if (req.method === "DELETE" && req.url.startsWith("/admin/product/")) {
    try {
      const productId = req.url.split("/")[3];
      deleteProduct(productId);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "PRODUCT_DELETED" }));
    } catch (err) {
      console.error("[Admin] Delete product failed", err);
      res.writeHead(500);
      return res.end("Failed to delete product");
    }
  }
  if (req.method === "POST" && req.url.startsWith("/admin/orders/")) {
    const parts = req.url.split("/");
    const orderId = parts[3];

    // Mark order as picked up (internal only)
    updateOrderStatus(orderId, "PICKED_UP");

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ORDER_PICKED_UP" }));
  }

  if (req.method === "POST" && req.url === "/orders") {
    return handleCreateOrder(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/orders/")) {
    const parts = req.url.split("/");
    const orderId = parts[2];

    if (parts[3] === "status") {
      return handleGetOrderStatus(req, res, orderId);
    }
  }

  if (req.method === "GET" && req.url === "/price-inventory-stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    addSSEClient(res);
    req.on("close", () => {
      removeSSEClient(res);
    });

    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    if (Math.random() < 0.1) {
      res.writeHead(429);
      return res.end("Too Many Requests");
    }
    res.writeHead(200);
    return res.end("OK");
  }
  if (req.method === "POST" && req.url === "/payments/init") {
    return initPayment(req, res);
  }
  if (req.method === "GET" && req.url.startsWith("/payments/")) {
    const parts = req.url.split("/");
    const paymentId = parts[2];
    if (parts[3] === "status") {
      return pollPaymentStatus(req, res, paymentId);
    }
  }

  if (req.method === "GET") {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const safePath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(__dirname, safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);

      const contentTypeMap = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
      };

      res.writeHead(200, {
        "Content-Type": contentTypeMap[ext] || "text/plain",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});
initOrderSocket(server);
const PORT = 3000;
server.listen(PORT, () => {
  console.log("[Server] Running on port 3000");
});
