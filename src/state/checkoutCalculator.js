import { getCartItems } from "./cartState.js";
import { getMenuView } from "./menuState.js";

export async function buildReceiptFromCart() {
  const items = getCartItems();
  const menu = await getMenuView();
  const menuMap = new Map(menu.map(p => [p.productId, p]));

  let totalAmount = 0;

  const receiptItems = items.map(item => {
    const product = menuMap.get(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const price = product.effectivePrice;
    totalAmount += price * item.quantity;

    return {
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      price,
    };
  });

  return { receiptItems, totalAmount };
}
