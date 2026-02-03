import { saveCart, loadCart } from "../storage/sessionStore.js";
const cart = new Map();

let hasRestored = false;

export function restoreCart() {
  if (hasRestored) return;
  hasRestored = true;

  const storedItems = loadCart();
  storedItems.forEach(item => {
    cart.set(item.productId, {
      productId: item.productId,
      quantity: item.quantity
    });
  });
}


export function resetCartSession() {
  cart.clear();         
  saveCart([]);         
}

export function addToCart(productId) {
  const item = cart.get(productId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.set(productId, {
      productId,
      quantity: 1
    });
  }
  persistCart();
}

export function removeFromCart(productId) {
  const item = cart.get(productId);

  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    cart.delete(productId);
  }

  persistCart();
}


export function clearCart() {
  cart.clear();
  persistCart();
}


export function getCartItems() {
  return Array.from(cart.values());
}


function persistCart() {
  saveCart(getCartItems());
}
export function getItemQuantity(productId) {
  return cart.get(productId)?.quantity || 0;
}

export function isCartEmpty() {
  return cart.size === 0;
}
export function getCartTotal() { return Array.from(cart.values()).reduce( (sum, item) => sum + item.unitPrice * item.quantity, 0 ); }