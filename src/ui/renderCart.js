import {
  getCartItems,
  addToCart,
  removeFromCart
} from "../state/cartState.js";
import { getMenuView } from "../state/menuState.js";
import { renderMenu } from "./renderMenu.js";

export async function renderCart() {
  // fetch current cart state
  const items = getCartItems();

  // cart DOM references
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalAmount");
  const badge = document.getElementById("cartBadge");
  const footer = document.getElementById("cartFooter");

  // empty cart state
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty</p>
      </div>
    `;
    badge.classList.add("hidden");
    footer.style.display = "none";
    totalEl.textContent = "₹0.00";
    return;
  }

  // load menu data for validation & pricing
  const menu = await getMenuView();
  const menuMap = new Map(menu.map(p => [p.productId, p]));

  let total = 0;
  let count = 0;
  let removedUnavailableItems = false;

  // build cart UI
  const cartHTML = items.map(item => {
    const product = menuMap.get(item.productId);

    // remove inactive / missing products
    if (!product || !product.isActive) {
      removedUnavailableItems = true;
      removeFromCart(item.productId);
      return "";
    }

    const availableQty = product.availableQuantity ?? 0;

    // remove out-of-stock items
    if (availableQty <= 0) {
      removedUnavailableItems = true;
      removeFromCart(item.productId);
      return "";
    }

    // clamp quantity to available stock
    const quantity = Math.min(item.quantity, availableQty);
    if (quantity !== item.quantity) {
      item.quantity = quantity;
    }

    const price = product.effectivePrice;

    total += quantity * price;
    count += quantity;

    return `
      <div class="cart-item">
        <div class="cart-item-left">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">₹${price}</div>
        </div>

        <div class="cart-qty-controls">
          <button class="qty-btn minus" data-id="${item.productId}">−</button>
          <span class="qty-count">${quantity}</span>
          <button class="qty-btn plus" data-id="${item.productId}" ${
            quantity >= availableQty ? "disabled" : ""
          }>+</button>
        </div>
      </div>
    `;
  }).join("");

  // optional warning banner
  const infoBanner = removedUnavailableItems
    ? `
      <div class="cart-warning">
        Some items were removed because they are no longer available.
      </div>
    `
    : "";

  container.innerHTML = infoBanner + cartHTML;

  // totals & badge update
  totalEl.textContent = `₹${total.toFixed(2)}`;
  badge.textContent = count;
  badge.classList.remove("hidden");
  footer.style.display = "flex";

  // quantity increment handlers
  container.querySelectorAll(".qty-btn.plus").forEach(btn => {
    btn.onclick = () => {
      if (btn.disabled) return;
      addToCart(btn.dataset.id);
      renderCart();
      renderMenu();
    };
  });

  // quantity decrement handlers
  container.querySelectorAll(".qty-btn.minus").forEach(btn => {
    btn.onclick = () => {
      removeFromCart(btn.dataset.id);
      renderCart();
      renderMenu();
    };
  });
}
