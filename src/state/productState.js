import { getAllRecords } from "../storage/storage.js";

export async function getProductById(productId) {
  const products = await getAllRecords("products");
  return products.find(p => p.productId === productId);
}
