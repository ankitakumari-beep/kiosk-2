import { subscribeToOrderUpdates } from "../../state/orderState.js";
import { initEvents } from "../events.js";
import { renderPage } from "../pageController.js";
import { renderHomePage } from "./homePage.js";

export function renderOrderStatusPage(order) {
  if (!order || !order.orderId) {
    console.warn("[OrderStatusPage] Invalid order");
    return;
  }

  const screen = document.getElementById("successScreen");
  screen.classList.add("active");

const startNewOrderBtn = document.getElementById("closeSuccessToast");
startNewOrderBtn?.addEventListener("click", () => {
  screen.classList.remove("active");
  renderPage(renderHomePage);
});


  // order id
  const orderNumber = document.getElementById("orderNumber");
  orderNumber.textContent = `#${order.orderId}`;

  // status text
  let statusEl = screen.querySelector(".order-status-text");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "order-status-text";
    statusEl.style.marginTop = "16px";
    screen.querySelector(".success-content").appendChild(statusEl);
  }

  statusEl.textContent = `Status: ${order.status}`;

  // subscribe ONLY to this order
  const unsubscribe = subscribeToOrderUpdates((updatedOrder) => {
    if (updatedOrder.orderId !== order.orderId) return;
    statusEl.textContent = `Status: ${updatedOrder.status}`;
  });

  const cleanupEvents = initEvents();

  return () => {
  unsubscribe();
  cleanupEvents();
  statusEl?.remove();
  screen.classList.remove("active");
};
}
