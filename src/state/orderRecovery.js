import { getAllRecords, updateRecord } from "../storage/storage.js";

const API_BASE = "http://localhost:3000";
const ACTIVE_ORDER_STATUSES = ["PLACED", "ACCEPTED", "PREPARING"];

export async function rehydrateActiveOrders() {
  const orders = await getAllRecords("orders");

  const activeOrders = orders.filter(order =>
    ACTIVE_ORDER_STATUSES.includes(order.status)
  );

  if (activeOrders.length === 0) return;

  console.log(`[Rehydrate] Replaying ${activeOrders.length} active orders`);

  for (const order of activeOrders) {
    await rehydrateOrder(order);
  }
}

async function rehydrateOrder(order) {
  try {
    await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    order.serverRehydrated = true;
    await updateRecord("orders", order);
  } catch {
    console.warn("[Rehydrate] Failed for order", order.orderId);
  }
}
