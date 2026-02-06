import { state } from "../core/state.js";
import { handleAction } from "../network/actions.js";

const placedCol = document.getElementById("placedOrders");
const preparingCol = document.getElementById("preparingOrders");
const readyCol = document.getElementById("readyOrders");

const placedCount = document.getElementById("placedCount");
const preparingCount = document.getElementById("preparingCount");
const readyCount = document.getElementById("readyCount");
const activeOrderCount = document.getElementById("activeOrderCount");

export function render() {
  placedCol.innerHTML = "";
  preparingCol.innerHTML = "";
  readyCol.innerHTML = "";

  let placed = 0, preparing = 0, ready = 0;

  state.orders.forEach(order => {
    const card = createOrderCard(order);

    if (order.status === "PLACED") {
      placedCol.appendChild(card);
      placed++;
    } else if (order.status === "ACCEPTED" || order.status === "PREPARING") {
      preparingCol.appendChild(card);
      preparing++;
    } else if (order.status === "READY") {
      readyCol.appendChild(card);
      ready++;
    }
  });

  placedCount.textContent = placed;
  preparingCount.textContent = preparing;
  readyCount.textContent = ready;
  activeOrderCount.textContent = placed + preparing + ready;
}

function createOrderCard(order) {
  const div = document.createElement("div");
  div.className = "order-card";

  div.innerHTML = `
    <div class="order-header">
     <div class="order-id">
  ${order.orderNumber ? `#${order.orderNumber}` : "Assigning…"}
</div>
      <div class="order-time">${formatTime(order.timestamp)}</div>
    </div>
    <div class="order-items">
      ${(order.items || []).map(i => `
        <div class="order-item-row">
          <span class="item-name">
            ${state.productMap[i.productId] || i.productId}
          </span>
          <span class="item-qty">×${i.quantity ?? i.qty ?? 0}</span>
        </div>
      `).join("")}
    </div>
    <div class="order-actions">${renderButtons(order)}</div>
  `;

  div.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => handleAction(order.orderId, btn.dataset.action);
  });

  return div;
}

function renderButtons(order) {
  if (order.status === "PLACED") {
    return `<button class="btn btn-accept" data-action="ACCEPTED">Accept</button>`;
  }
  if (order.status === "ACCEPTED" || order.status === "PREPARING") {
    return `<button class="btn btn-ready" data-action="READY">Mark Ready</button>`;
  }
  return `<div class="status-badge">Ready</div>`;
}

function formatTime(ts) {
  if (!ts) return "Just now";
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  return new Date(ts).toLocaleTimeString();
}
