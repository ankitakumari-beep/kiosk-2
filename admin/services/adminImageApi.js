const API = "http://localhost:3000";

export function updateProductImage(productId, imageBuffer, imageMime) {
  return fetch(`${API}/admin/product/${productId}/image`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBuffer, imageMime }),
  });
}
