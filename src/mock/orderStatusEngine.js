const STATUS_FLOW = ["ACCEPTED", "PREPARING", "READY"];
const listeners = new Set();

export function subscribeToOrderStatus(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function startOrderLifecycle(order) {
  let index = 0;

  function advance() {
    if (index >= STATUS_FLOW.length) return;

    const nextStatus = STATUS_FLOW[index];
    index++;

    listeners.forEach((cb) =>
      cb({
        orderId: order.orderId,
        status: nextStatus
      })
    );

    setTimeout(advance, 2000);
  }

  setTimeout(advance, 2000);
}
