import { updateRecord, getAllRecords } from "../storage/storage.js";
import { createOrder } from "./orderCreator.js";

const orderListeners = new Set();

export async function createOrderAfterPayment(paymentResult) {
  return createOrder({
    requirePaymentSuccess: true,
    paymentResult
  });
}

export async function placeOrder() {
  return createOrder({ requirePaymentSuccess: false });
}

export function subscribeToOrderUpdates(cb) {
  orderListeners.add(cb);

  getAllRecords("orders").then((orders) => {
    orders.forEach(order => cb(order));
  });

  return () => orderListeners.delete(cb);
}

export async function updateOrderStatus(orderId, status,orderNumber) {
  const orders = await getAllRecords("orders");
  const order = orders.find(o => o.orderId === orderId);
  if (!order || order.status === status) return;

  order.status = status;
  if (orderNumber && !order.orderNumber) {
    order.orderNumber = orderNumber;
  }
  order.updatedAt = Date.now();

  await updateRecord("orders", order);
  notifyOrderListeners(order);
}

function notifyOrderListeners(order) {
  orderListeners.forEach(cb => cb(order));
}
