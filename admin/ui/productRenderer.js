import { getCategoryName } from "../state/adminCategoryState.js";
import { getProductImageSrc } from "../utils/imageUtils.js";

const list = document.getElementById("productList");
const count = document.getElementById("productCount");

export function renderProducts(products) {
  count.textContent = products.length;

  if (!products.length) {
    list.innerHTML = "<p>No products found</p>";
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="product-item">
      <div class="product-image">
        <img src="${getProductImageSrc(p)}" />
      </div>
      <div class="product-info">
        <div class="product-name">
          ${p.name}
          <span class="category-badge">${getCategoryName(p.categoryIds?.[0])}</span>
        </div>
        <div class="product-meta">
          <strong>$${p.price.toFixed(2)}</strong> • ${p.quantity} in stock
        </div>
      </div>
    </div>
  `).join("");
}
