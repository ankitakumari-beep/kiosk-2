import { updateOrderStatus } from "./orderStore.js";

const FLOW = ["PREPARING", "READY"];

export function startLifecycle(orderId) {
  let step = 0;

  function advance() {
    if (step >= FLOW.length) return;

    updateOrderStatus(orderId, FLOW[step]);
    step++;

    setTimeout(advance, 3000);
  }

  setTimeout(advance, 3000);
}
