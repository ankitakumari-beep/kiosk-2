import { broadcastSSE } from "./sse.js";

const products = new Map();
const inventory = new Map();
const prices = new Map();

function base64ToBuffer(base64) {
  const [meta, data] = base64.split(",");
  const mime = meta.match(/:(.*?);/)[1];

  return {
    buffer: Buffer.from(data, "base64"),
    mime
  };
}

function deriveTags(categoryIds) {
  const CATEGORY_TAG_MAP = {
    c1: "burgers",
    c2: "pizza",
    c3: "salads",
    c4: "pasta",
    c5: "drinks",
    c6: "desserts"
  };

  return (categoryIds || []).map(id => CATEGORY_TAG_MAP[id]).filter(Boolean);
}

export function rehydrateState({
  productsList = [],
  inventoryList = [],
  priceRulesList = []
}) {
  console.log("[Rehydrate] Starting server state rehydration");

  products.clear();
  inventory.clear();
  prices.clear();

  productsList.forEach(p => {
    products.set(p.productId, {
  productId: p.productId,
  name: p.name,
  description: p.description ?? "",
  basePrice: p.basePrice,
  categoryIds: p.categoryIds ?? [],
  tags: p.tags ?? [],
  imageBlob: p.imageBlob,
  imageUrl: p.imageUrl,
  isActive: p.isActive ?? true
});

  });

  inventoryList.forEach(i => {
    inventory.set(i.productId, i.availableQuantity ?? 0);
  });

  priceRulesList.forEach(rule => {
    prices.set(rule.productId, rule.basePrice);
  });

  console.log(
    `[Rehydrate] Products: ${products.size}, Inventory: ${inventory.size}, Prices: ${prices.size}`
  );
}
export function createProduct({
  productId,
  name,
  description = "",
  basePrice,
  availableQuantity = 0,
  categoryIds = [],
  isActive = true,
  imageBase64       
}) {

  const product = {
  productId,
  name,
  description,
  basePrice,
  categoryIds,
  tags: deriveTags(categoryIds), 
  isActive
};
console.log(
  "[ENGINE] createProduct image:",
  imageBase64 ? "YES" : "NO"
);

// attach image
if (imageBase64) {
  const { buffer, mime } = base64ToBuffer(imageBase64);
  product.imageBuffer = buffer;
  product.imageMime = mime;
}

products.set(productId, product);


  prices.set(productId, basePrice);
  inventory.set(productId, availableQuantity);

  broadcastSSE({
  type: "PRODUCT_CREATED",
  product: {
    ...product,
    availableQuantity
  }
});

}

export function updateProduct(productId, updates) {
  if (updates.basePrice != null) {
    prices.set(productId, updates.basePrice);

    broadcastSSE({
      type: "PRICE_UPDATE",
      productId,
      newPrice: updates.basePrice,
      updatedAt: Date.now()
    });
  }
}


export function updateInventory(productId, availableQuantity) {
  inventory.set(productId, availableQuantity);

  broadcastSSE({
    type: "INVENTORY_UPDATE",
    productId,
    availableQuantity,
    updatedAt: Date.now()
  });
}

export function deleteProduct(productId) {
  products.delete(productId);
  inventory.delete(productId);
  prices.delete(productId);

  broadcastSSE({
    type: "PRODUCT_DELETED",
    productId
  });
}

export function getAllProducts() {
  return Array.from(products.values()).map(p => ({
    ...p,
    availableQuantity: inventory.get(p.productId),
    basePrice: prices.get(p.productId)
  }));
}
