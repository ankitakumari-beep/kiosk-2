import { renderOrderStatusRow } from "./orderStatusRow.js";

export function renderOrderStatusList(container, orders) {
  container.innerHTML = "";

  if (!orders.length) {
    container.innerHTML = `<p>No orders yet.</p>`;
    return;
  }

  orders.forEach(order => {
    container.appendChild(renderOrderStatusRow(order));
  });
}
