import { getAllRecords } from "../storage/storage.js";
import { setProducts } from "../state/menuState.js";

export async function loadMenuFromStorage() {
  console.log("[MenuLoader] Loading menu from IndexedDB...");

  const products = await getAllRecords("products");

  setProducts(products);

  console.log(`[MenuLoader] Loaded ${products.length} products into memory`);
}
