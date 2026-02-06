import { getCartItems, resetCartSession } from "./cartState.js";
import { addRecord } from "../storage/storage.js";
import { generateOrderId } from "../utils/idGenerator.js";
import { enqueueOrder, syncQueue } from "../queue/offlineQueue.js";
import { startOrderTracking } from "../network/orderLiveTracker.js";
import { getNextOrderNumber } from "./orderCounter.js";
export async function createOrder({ requirePaymentSuccess = false, paymentResult }) {
  if (requirePaymentSuccess && paymentResult?.status !== "SUCCESS") {
    throw new Error("Order creation blocked: payment not successful");
  }

  const items = getCartItems();
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = {
    orderId: generateOrderId(),
    orderNumber: getNextOrderNumber(),
    items,
    totalAmount: calculateTotal(items),
    status: "PENDING",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source: "offline",
  };

  await addRecord("orders", order);
  // await addRecord("syncQueue", {
  //   queueId: crypto.randomUUID(),
  //   orderId: order.orderId,
  //   payload: order,
  //   createdAt: Date.now(),
  //   retryCount: 0,
  //   lastAttemptAt: null,
  // });

  await enqueueOrder(order);
  startOrderTracking(order.orderId);
  //syncQueue();

  resetCartSession();
  return order;
}

function calculateTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.computedPrice * item.quantity,
    0
  );
}
