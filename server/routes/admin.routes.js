import { parseBody } from "../utils/parseBody.js";
import {
  createProduct,
  updateProduct,
  updateInventory,
  deleteProduct
} from "../priceInventoryEngine.js";
import { updateOrderStatus } from "../orderStore.js";
import { updateProductImage } from "../priceInventoryEngine.js";

export async function adminRoutes(req, res) {
  if (req.method === "POST" && req.url === "/admin/product") {
    const body = await parseBody(req);
    createProduct(body);
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "PRODUCT_CREATED" }));
  }
  if (
    req.method === "PATCH" &&
    req.url.startsWith("/admin/product/") &&
    req.url.endsWith("/image")
  ) {
    const productId = req.url.split("/")[3];
    const body = await parseBody(req);
    const { imageBuffer, imageMime } = body;

    console.log("[ADMIN] image upload called", productId);

    if (!imageBuffer || !imageMime) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: "INVALID_IMAGE_DATA" }));
    }


    updateProductImage(productId, imageBuffer, imageMime);

    res.writeHead(200);
    return res.end(JSON.stringify({ status: "IMAGE_UPDATED" }));
  }

  if (req.method === "PATCH" && req.url.startsWith("/admin/product/")) {
    const productId = req.url.split("/")[3];
    const body = await parseBody(req);
    updateProduct(productId, body);
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "PRODUCT_UPDATED" }));
  }

  if (req.method === "PATCH" && req.url.startsWith("/admin/inventory/")) {
    const productId = req.url.split("/")[3];
    const body = await parseBody(req);
    updateInventory(productId, body.availableQuantity);
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "INVENTORY_UPDATED" }));
  }

  if (req.method === "DELETE" && req.url.startsWith("/admin/product/")) {
    const productId = req.url.split("/")[3];
    deleteProduct(productId);
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "PRODUCT_DELETED" }));
  }

  if (req.method === "POST" && req.url.startsWith("/admin/orders/")) {
    const orderId = req.url.split("/")[3];
    updateOrderStatus(orderId, "PICKED_UP");
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "ORDER_PICKED_UP" }));
  }

  return false;
}
