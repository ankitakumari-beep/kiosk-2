import { startPayment } from "../../state/paymentState.js";
import { createOrderAfterPayment } from "../../state/orderState.js";
import { renderPage } from "../pageController.js";
import { renderOrderStatusPage } from "./orderStatusPage.js";
import { buildReceiptFromCart } from "../../state/checkoutCalculator.js";
import { generateReceipt } from "../../services/receiptService.js";
let checkoutInProgress = false;

export async function handleCheckout({ payerName, upiId }) {
  if (checkoutInProgress) return;
  checkoutInProgress = true;

  const ui = getCheckoutUI();

  if (!payerName || !upiId) {
    checkoutInProgress = false;
    return;
  }

  ui.showLoading();

  try {
    const { receiptItems, totalAmount } = await buildReceiptFromCart();

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

    ui.hideLoading();
    checkoutInProgress = false;

    renderPage(renderOrderStatusPage, order);
  } catch (err) {
    checkoutInProgress = false;
    ui.hideLoading();
    resetOrderUI();
    ui.showError(err.message || "Payment failed");
  }
}

//ui helper

function getCheckoutUI() {
  const loading = document.getElementById("paymentLoading");
  const errorModal = document.getElementById("paymentError");
  const errorMsg = document.getElementById("paymentErrorMessage");

  return {
    showLoading: () => loading.classList.add("active"),
    hideLoading: () => loading.classList.remove("active"),
    showError: (msg) => {
      errorMsg.textContent = msg;
      errorModal.classList.add("active");
    },
  };
}

function resetOrderUI() {
  document.getElementById("successScreen")?.classList.remove("active");
}
