import { getAllRecords } from "../../src/storage/storage.js";
import { renderProducts } from "../ui/productRenderer.js";

export let allProducts = [];

export async function loadProducts() {
  const products = await getAllRecords("products");
  const inventory = await getAllRecords("inventory");
  const prices = await getAllRecords("priceRules");

  const invMap = new Map(inventory.map(i => [i.productId, i.availableQuantity]));
  const priceMap = new Map(prices.map(p => [p.productId, p.basePrice]));

  allProducts = products.map(p => ({
    ...p,
    price: priceMap.get(p.productId) ?? 0,
    quantity: invMap.get(p.productId) ?? 0,
  }));

  renderProducts(allProducts);
  populateQuickUpdateDropdown(allProducts); 
}

function populateQuickUpdateDropdown(products) {
  const select = document.getElementById("updateProductSelect");
  if (!select) return;

  select.innerHTML = '<option value="">-- Choose a product --</option>';

  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.productId;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
}
