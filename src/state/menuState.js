import { getAllRecords } from "../storage/storage.js";

const products = new Map();
const categories = new Map();
const activeFilters = new Set();

export function setProducts(productList) {
  products.clear();
  productList.forEach((p) => {
    products.set(p.productId, p);
  });
}

export function getAllProducts() {
  return Array.from(products.values());
}

export function addFilter(filter) {
  activeFilters.add(filter);
}

export function removeFilter(filter) {
  activeFilters.delete(filter);
}

export function getActiveFilters() {
  return Array.from(activeFilters);
}

export async function getMenuView() {
  const products = await getAllRecords("products");
  const priceRules = await getAllRecords("priceRules");
  const inventory = await getAllRecords("inventory");

  const latestPriceMap = new Map();
  priceRules.forEach(rule => {
    if (!latestPriceMap.has(rule.productId)) {
      latestPriceMap.set(rule.productId, rule);
    } else {
      const existing = latestPriceMap.get(rule.productId);
      if ((rule.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
        latestPriceMap.set(rule.productId, rule);
      }
    }
  });

  const latestInventoryMap = new Map();
  inventory.forEach(record => {
    if (!latestInventoryMap.has(record.productId)) {
      latestInventoryMap.set(record.productId, record);
    } else {
      const existing = latestInventoryMap.get(record.productId);
      if ((record.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
        latestInventoryMap.set(record.productId, record);
      }
    }
  });

  return products
    .filter(p => p.isActive)
    .map(product => {
      const priceRule = latestPriceMap.get(product.productId);
      const inv = latestInventoryMap.get(product.productId);

      return {
        ...product,
        effectivePrice: priceRule ? priceRule.basePrice : product.basePrice,
        availableQuantity: inv ? inv.availableQuantity : 0
      };
    });
}
