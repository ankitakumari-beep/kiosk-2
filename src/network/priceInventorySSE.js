import { updateRecord } from "../storage/storage.js";
import { renderMenu } from "../ui/renderMenu.js";
import { connectionLEDs } from "../ui/components/connectionLED.js";
import { renderCart } from "../ui/renderCart.js";

let eventSource = null;

export function startPriceInventorySSE() {
  if (eventSource) return;

  console.log("[SSE] Connecting to price/inventory stream");
  eventSource = new EventSource("http://localhost:3000/price-inventory-stream");

  eventSource.onmessage = async (event) => {
    connectionLEDs.sseConnected();
    const data = JSON.parse(event.data);
    console.log(data);
    const product = data.product;
    console.log(product);
    if (data.type === "PRICE_UPDATE") {
      await updateRecord("priceRules", {
        priceRuleId: data.productId,
        productId: data.productId,
        basePrice: data.newPrice,
        updatedAt: data.updatedAt,
      });

      await renderMenu();
      await renderCart();
    }

    if (data.type === "INVENTORY_UPDATE") {
      await updateRecord("inventory", {
        productId: data.productId,
        availableQuantity: data.availableQuantity,
        updatedAt: data.updatedAt,
      });

      await renderMenu();
      await renderCart();
    }

    if (data.type === "PRODUCT_CREATED") {
      const product = data.product;
      console.log(product);
      await updateRecord("products", {
        productId: product.productId,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        categoryIds: product.categoryIds,
        tags: product.tags ?? [],
        isActive: product.isActive,

        imageBuffer: product.imageBuffer,
        imageMime: product.imageMime,
        imageUrl: product.imageUrl,
      });

      await updateRecord("inventory", {
        productId: product.productId,
        availableQuantity: product.availableQuantity,
        updatedAt: Date.now(),
      });

      await updateRecord("priceRules", {
        priceRuleId: product.productId,
        productId: product.productId,
        basePrice: product.basePrice,
        updatedAt: Date.now(),
      });

      await renderMenu();
      await renderCart();
    }
  };

  eventSource.onerror = () => {
    connectionLEDs.sseDisconnected();
    console.warn("[SSE] Disconnected. Will retry automatically.");
    eventSource.close();
    eventSource = null;
  };
}
