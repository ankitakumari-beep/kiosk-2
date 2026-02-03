import { getCartItems, clearCart,resetCartSession } from "./cartState.js";
import {
  addRecord,
  updateRecord,
  getAllRecords
} from "../storage/storage.js";
import { generateOrderId } from "../utils/idGenerator.js";
import { enqueueOrder, syncQueue } from "../queue/offlineQueue.js";
import { startOrderTracking } from "../network/orderLiveTracker.js";

const orderListeners = new Set();

export async function createOrderAfterPayment(paymentResult) {
  if (!paymentResult || paymentResult.status !== "SUCCESS") {
  throw new Error("Order creation blocked: payment not successful");
}

  const items = getCartItems();
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const order = {
    orderId: generateOrderId(),
    items,
    totalAmount: calculateTotal(items),
    status: "PENDING",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source: "offline",
  };

  await addRecord("orders", order);

  await addRecord("syncQueue", {
    queueId: crypto.randomUUID(),
    orderId: order.orderId,
    payload: order,
    createdAt: Date.now(),
    retryCount: 0,
    lastAttemptAt: null,
  });

  await enqueueOrder(order);
  startOrderTracking(order.orderId);
  syncQueue();
  //clearCart();
  resetCartSession();

  return order;
}

export function subscribeToOrderUpdates(cb) {
  orderListeners.add(cb);

  getAllRecords("orders").then((orders) => {
    orders.forEach((order) => cb(order));
  });

  return () => orderListeners.delete(cb);
}


function notifyOrderListeners(order) {
  orderListeners.forEach((cb) => cb(order));
}

export async function placeOrder() {
  const items = getCartItems();
  if (items.length === 0) {
    throw new Error("Cannot place empty order");
  }

  const order = {
    orderId: generateOrderId(),
    items,
    totalAmount: calculateTotal(items),
    status: "PENDING",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source: "offline"
  };

  // Persist order
  await addRecord("orders", order);

  // Add sync job
  await addRecord("syncQueue", {
    queueId: crypto.randomUUID(),
    orderId: order.orderId,
    payload: order,
    createdAt: Date.now(),
    retryCount: 0,
    lastAttemptAt: null
  });

  await enqueueOrder(order);

  
  startOrderTracking(order.orderId);

  syncQueue();
  //clearCart();
  resetCartSession();

  return order;
}


export async function updateOrderStatus(orderId, status) {
  const orders = await getAllRecords("orders");
  const order = orders.find((o) => o.orderId === orderId);
  console.log("enter update function")
  if (!order) return;
  if (order.status === status) {
    console.log("returning from update function");
    return;
  }
  console.log("enter update function 2")
  order.status = status;
  order.updatedAt = Date.now();

  await updateRecord("orders", order);
  
  console.log("[OrderState] Status updated:", orderId, status);
  notifyOrderListeners(order);
}

function calculateTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.computedPrice * item.quantity,
    0
  );
}


export async function getActiveOrders() {
  const orders = await getAllRecords("orders");
  return orders.filter(o =>
    ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  );
}

