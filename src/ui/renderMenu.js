import { getMenuView } from "/src/state/menuState.js";
import { getActiveCategory } from "/src/state/categoryState.js";
import {
  addToCart,
  removeFromCart,
  getItemQuantity
} from "/src/state/cartState.js";

function getProductImageSrc(p) {
  if (p.imageBuffer && p.imageMime) {
    const blob = new Blob(
      [new Uint8Array(p.imageBuffer.data)],
      { type: p.imageMime }
    );
    return URL.createObjectURL(blob);
  }
  return p.imageUrl || "";
}

export async function renderMenu() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  const activeCategory = getActiveCategory();
  const products = await getMenuView();

  const filteredProducts =
    activeCategory === "ALL"
      ? products
      : products.filter(p => p.categoryIds?.includes(activeCategory));

  grid.innerHTML = "";

  if (!filteredProducts.length) {
    grid.innerHTML = "<p>No items in this category</p>";
    return;
  }

  for (const p of filteredProducts) {
    const cartQty = getItemQuantity(p.productId); // ✅ ONLY cart quantity
    const stockQty = p.availableQuantity ?? Infinity;

    const isOutOfStock = stockQty <= 0;
    const isMaxReached = cartQty >= stockQty;

    let controlsHTML = "";

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
