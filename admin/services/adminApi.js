const API = "http://localhost:3000";

export function createProduct(body) {
  return fetch(`${API}/admin/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function updateProductPrice(productId, basePrice) {
  return fetch(`${API}/admin/product/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ basePrice }),
  });
}

export function updateProductStock(productId, availableQuantity) {
  return fetch(`${API}/admin/inventory/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availableQuantity }),
  });
}
