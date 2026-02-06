import { connectOrderSocket } from "./orderWebSocket.js";
import { startPolling } from "./orderPoller.js";
import { updateOrderStatus } from "../state/orderState.js";
export function startOrderTracking(orderId) {
  let pollingStarted = false;

  connectOrderSocket(
    orderId,
    (update) => {
      console.log("[Tracker] Update received:", update);
      updateOrderStatus(
      update.order.orderId,
      update.order.status,
      update.order.orderNumber
    );
    },
    () => {
      if (!pollingStarted) {
        pollingStarted = true;
        startPolling(orderId, (update) => {
          updateOrderStatus(update.orderId, update.status);
        });
      }
    }
  );
}
