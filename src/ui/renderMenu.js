import { getMenuView } from "/src/state/menuState.js";
import { getActiveCategory } from "/src/state/categoryState.js";
import {
  addToCart,
  removeFromCart,
  getItemQuantity
} from "/src/state/cartState.js";

// resolve image source (buffer or URL)
export function getProductImageSrc(p) {
  if (p.imageBuffer && p.imageMime) {
    const bytes =
      Array.isArray(p.imageBuffer)
        ? p.imageBuffer          // NEW: image update flow
        : p.imageBuffer.data;    // OLD: product creation flow

    const blob = new Blob(
      [new Uint8Array(bytes)],
      { type: p.imageMime }
    );

    return URL.createObjectURL(blob);
  }

  return (
    p.imageUrl ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='32' fill='%2394a3b8'%3E?%3C/text%3E%3C/svg%3E"
  );
}


export async function renderMenu() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  // load menu + active category
  const activeCategory = getActiveCategory();
  const products = await getMenuView();

  const filteredProducts =
    activeCategory === "ALL"
      ? products
      : products.filter(p => p.categoryIds?.includes(activeCategory));

  grid.innerHTML = "";

  // empty category state
  if (!filteredProducts.length) {
    grid.innerHTML = "<p>No items in this category</p>";
    return;
  }

  // render product cards
  for (const p of filteredProducts) {
    const cartQty = getItemQuantity(p.productId);
    const stockQty = p.availableQuantity ?? Infinity;

    const isOutOfStock = stockQty <= 0;
    const isMaxReached = cartQty >= stockQty;

    let controlsHTML = "";

    // controls based on cart quantity
    if (cartQty === 0) {
      controlsHTML = `
        <button class="add-btn" ${isOutOfStock ? "disabled" : ""}>+</button>
      `;
    } else {
      controlsHTML = `
        <div class="qty-controls">
          <button class="qty-btn minus">−</button>
          <span class="qty-count">${cartQty}</span>
          <button class="qty-btn plus" ${isMaxReached ? "disabled" : ""}>+</button>
        </div>
      `;
    }

    const card = document.createElement("div");
    card.className = "menu-item";
    if (isOutOfStock) card.classList.add("out-of-stock");

    card.innerHTML = `
      <div class="menu-item-image">
        <img src="${getProductImageSrc(p)}" />
      </div>

      <div class="menu-item-content">
        <h3>${p.name}</h3>
        <p class="menu-item-description">${p.description}</p>
        <p class="menu-item-price">₹${p.effectivePrice}</p>
      </div>

      <div class="menu-item-controls">
        ${controlsHTML}
      </div>
    `;

    // cart actions
    card.querySelector(".add-btn")?.addEventListener("click", () => {
      addToCart(p.productId);
      renderMenu();
    });

    card.querySelector(".plus")?.addEventListener("click", () => {
      if (!isMaxReached) {
        addToCart(p.productId);
        renderMenu();
      }
    });

    card.querySelector(".minus")?.addEventListener("click", () => {
      removeFromCart(p.productId);
      renderMenu();
    });

    grid.appendChild(card);
  }
}
