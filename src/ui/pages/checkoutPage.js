import { getCartItems } from "../../state/cartState.js";
import { startPayment } from "../../state/paymentState.js";
import { createOrderAfterPayment } from "../../state/orderState.js";
import { renderPage } from "../pageController.js";
import { renderOrderStatusPage } from "./orderStatusPage.js";
import { getMenuView } from "../../state/menuState.js";

let checkoutInProgress = false;

export async function handleCheckout({ payerName, upiId }) {
  if (checkoutInProgress) return;
  checkoutInProgress = true;

  const loading = document.getElementById("paymentLoading");
  const errorModal = document.getElementById("paymentError");
  const errorMsg = document.getElementById("paymentErrorMessage");

  if (!payerName || !upiId) {
    console.warn("[Checkout] Missing payer details");
    checkoutInProgress = false;
    return;
  }

  loading.classList.add("active");

  try {
    const items = getCartItems();
    console.log("[Checkout] cart items:", items);

    const menu = await getMenuView();
    const menuMap = new Map(menu.map((p) => [p.productId, p]));

    let totalAmount = 0;

    const receiptItems = items.map((item) => {
      const product = menuMap.get(item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const price = product.effectivePrice;
      const lineTotal = price * item.quantity;

      totalAmount += lineTotal;

      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price,
      };
    });

    const paymentResult = await startPayment({
      amount: totalAmount,
      payerName,
      paymentMethod: "UPI",
      upiId,
    });

    if (paymentResult.status !== "SUCCESS") {
      throw new Error("Payment failed or timed out");
    }

    const order = await createOrderAfterPayment(paymentResult);

    generateReceipt(order, receiptItems);

    loading.classList.remove("active");
    checkoutInProgress = false;

    renderPage(renderOrderStatusPage, order);
  } catch (err) {
    checkoutInProgress = false;
    loading.classList.remove("active");

    resetOrderUI();
    errorMsg.textContent = err.message || "Payment failed";
    errorModal.classList.add("active");
  }
}

function resetOrderUI() {
  document.getElementById("successScreen")?.classList.remove("active");
}

function generateReceipt(order, receiptItems) {
  if (!order) return;

  const worker = new Worker(
    new URL("../../workers/receiptWorker.js", import.meta.url),
    { type: "module" },
  );

  worker.postMessage({
    orderId: order.orderId,
    items: receiptItems,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  });

  worker.onmessage = (event) => {
    if (event.data?.type === "RECEIPT_READY") {
      console.log("🧾 Receipt generated:");
      console.log(event.data.receiptText);

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(
          `<pre style="font-family: monospace; font-size: 14px;">${event.data.receiptText}</pre>`,
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
