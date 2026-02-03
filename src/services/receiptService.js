export function generateReceipt(order, receiptItems) {
  if (!order) return;

  const worker = new Worker(
    new URL("../workers/receiptWorker.js", import.meta.url),
    { type: "module" }
  );

  worker.postMessage({
    orderId: order.orderId,
    items: receiptItems,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  });

  worker.onmessage = (event) => {
    if (event.data?.type === "RECEIPT_READY") {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(
          `<pre style="font-family: monospace; font-size: 14px;">${event.data.receiptText}</pre>`
        );
        win.document.close();
      }
      worker.terminate();
    }
  };

  worker.onerror = (err) => {
    console.error("[ReceiptWorker] Error", err);
    worker.terminate();
  };
}
