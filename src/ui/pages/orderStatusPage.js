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

  setupNavigation(screen);

  // Order ID
  const orderNumber = document.getElementById("orderNumber");
 orderNumber.textContent = order.orderNumber
  ? `#${order.orderNumber}`
  : "Assigning order number…";


  // Status text
  const statusEl = ensureStatusElement(screen);
  statusEl.textContent = `Status: ${order.status}`;

  // Subscribe ONLY to this order
  // const unsubscribe = subscribeToOrderUpdates((updatedOrder) => {
  //   if (updatedOrder.orderId !== order.orderId) return;
  //   statusEl.textContent = `Status: ${updatedOrder.status}`;
  // });

  const unsubscribe = subscribeToOrderUpdates((updatedOrder) => {
  if (updatedOrder.orderId !== order.orderId) return;

  statusEl.textContent = `Status: ${updatedOrder.status}`;

  if (updatedOrder.orderNumber) {
    orderNumber.textContent = `#${updatedOrder.orderNumber}`;
  }
});
  const cleanupEvents = initEvents();
  return () => {
    unsubscribe();
    cleanupEvents();
    teardownNavigation(screen);
    statusEl.remove();
    screen.classList.remove("active");
  };
}

//UI HELPERS 

function ensureStatusElement(screen) {
  let el = screen.querySelector(".order-status-text");

  if (!el) {
    el = document.createElement("div");
    el.className = "order-status-text";
    el.style.marginTop = "16px";
    screen.querySelector(".success-content").appendChild(el);
  }

  return el;
}

//NAVIGATION 

function setupNavigation(screen) {
  const btn = document.getElementById("closeSuccessToast");
  if (!btn) return;

  btn.onclick = () => {
    screen.classList.remove("active");
    renderPage(renderHomePage);
  };
}

function teardownNavigation() {
  const btn = document.getElementById("closeSuccessToast");
  if (btn) btn.onclick = null;
}
