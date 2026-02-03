const CART_KEY = "hyper_kitchen_cart";

export function saveCart(cartItems) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

export function loadCart() {
  const data = sessionStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearCartStorage() {
  sessionStorage.removeItem(CART_KEY);
}
