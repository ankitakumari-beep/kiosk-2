import { getAllRecords } from "../storage/storage.js";

export async function getActiveOrders() {
  const orders = await getAllRecords("orders");
  return orders.filter(o =>
    ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  );
}

export async function getOrderById(orderId) {
  const orders = await getAllRecords("orders");
  return orders.find(o => o.orderId === orderId);
}
