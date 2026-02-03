import {
  getCartItems,
  addToCart,
  removeFromCart
} from "../state/cartState.js";
import { getMenuView } from "../state/menuState.js";
import { renderMenu } from "./renderMenu.js";

export async function renderCart() {
  const items = getCartItems();

  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalAmount");
  const badge = document.getElementById("cartBadge");
  const footer = document.getElementById("cartFooter");


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

  const menu = await getMenuView();
  const menuMap = new Map(menu.map(p => [p.productId, p]));

  let total = 0;
  let count = 0;
  let removedUnavailableItems = false;

  const cartHTML = items.map(item => {
    const product = menuMap.get(item.productId);

    if (!product || !product.isActive) {
      removedUnavailableItems = true;
      removeFromCart(item.productId);
      return "";
    }

    const availableQty = product.availableQuantity ?? 0;

   
    if (availableQty <= 0) {
      removedUnavailableItems = true;
      removeFromCart(item.productId);
      return "";
    }

    
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


  const infoBanner = removedUnavailableItems
    ? `
      <div class="cart-warning">
        Some items were removed because they are no longer available.
      </div>
    `
    : "";

  container.innerHTML = infoBanner + cartHTML;

 
  totalEl.textContent = `₹${total.toFixed(2)}`;
  badge.textContent = count;
  badge.classList.remove("hidden");
  footer.style.display = "flex";


  container.querySelectorAll(".qty-btn.plus").forEach(btn => {
    btn.onclick = () => {
      if (btn.disabled) return;
      //addToCart(btn.dataset.id);
      addToCart(btn.dataset.id, product.effectivePrice);
      renderCart();
      renderMenu();
    };
  });

  container.querySelectorAll(".qty-btn.minus").forEach(btn => {
    btn.onclick = () => {
      removeFromCart(btn.dataset.id);
      renderCart();
      renderMenu();
    };
  });
}
