import { getAllRecords } from "../storage/storage.js";
import { enqueueOrder } from "../queue/offlineQueue.js";
import { startOrderTracking } from "../network/orderLiveTracker.js";

const ACTIVE_ORDER_STATUSES = ["PLACED", "ACCEPTED", "PREPARING"];

export async function rehydrateActiveOrders() {
  const orders = await getAllRecords("orders");

  const activeOrders = orders.filter(order =>
    ACTIVE_ORDER_STATUSES.includes(order.status)
  );

  if (activeOrders.length === 0) return;

  console.log(`[Rehydrate] Replaying ${activeOrders.length} active orders`);

  for (const order of activeOrders) {
    startOrderTracking(order.orderId);
    if (!order.synced) {
      await enqueueOrder(order);
    }
  }
}
