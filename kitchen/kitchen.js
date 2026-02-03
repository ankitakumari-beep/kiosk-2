let productMap = {};
const API = "http://localhost:3000";
const WS_URL = "ws://localhost:3000";

const placedCol = document.getElementById("placedOrders");
const preparingCol = document.getElementById("preparingOrders");
const readyCol = document.getElementById("readyOrders");
const statusEl = document.getElementById("connectionStatus");

const placedCount = document.getElementById("placedCount");
const preparingCount = document.getElementById("preparingCount");
const readyCount = document.getElementById("readyCount");
const activeOrderCount = document.getElementById("activeOrderCount");

let orders = [];
let socket = null;
let pollingTimer = null;

async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    if (!res.ok) return;

    const menu = await res.json();
    menu.forEach(item => {
      productMap[item.productId] = item.name;
    });
  } catch (e) {
    console.warn("[Kitchen] Menu load failed");
  }
}

function render() {
  placedCol.innerHTML = "";
  preparingCol.innerHTML = "";
  readyCol.innerHTML = "";

  let placed = 0, preparing = 0, ready = 0;

  orders.forEach(order => {
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
      <div class="order-id">${order.orderId}</div>
      <div class="order-time">${formatTime(order.timestamp)}</div>
    </div>
    <div class="order-items">
      ${(order.items || []).map(i => `
        <div class="order-item-row">
          <span class="item-name">${productMap[i.productId] || i.productId}</span>
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

function handleAction(orderId, status) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert("Connection lost. Retrying…");
    return;
  }

  socket.send(JSON.stringify({
    type: "KITCHEN_ACTION",
    orderId,
    status
  }));
}

async function fetchOrders() {
  try {
    const res = await fetch(`${API}/kitchen/orders`);
    if (!res.ok) return;

    orders = await res.json();
    render();
  } catch (e) {
    console.error("[Kitchen] Polling failed");
  }
}

function startPolling() {
  if (pollingTimer) return;
  updateConnectionStatus("polling");
  fetchOrders();
  pollingTimer = setInterval(fetchOrders, 3000);
}

function stopPolling() {
  if (!pollingTimer) return;
  clearInterval(pollingTimer);
  pollingTimer = null;
}

function connectWS() {
  updateConnectionStatus("connecting");
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[Kitchen] WS connected");
    updateConnectionStatus("connected");
    stopPolling();
  };

  socket.onmessage = (event) => {
  console.log("[WS RAW]", event.data);

  const msg = JSON.parse(event.data);
  console.log("[WS PARSED]", msg);

 if (msg.type === "ORDERS_SNAPSHOT") {
  console.log("[WS] snapshot received", msg.orders);

  if (msg.orders.length > 0) {
    orders = msg.orders;
    render();
  } else {
    console.warn("[Kitchen] Empty snapshot ignored");
  }
  return;
}


 if (msg.type === "ORDER_CREATED") {
  const idx = orders.findIndex(
    o => String(o.orderId) === String(msg.order.orderId)
  );

  if (idx === -1) {
    orders.push(msg.order);
  } else {
    orders[idx] = msg.order; // replace if already exists
  }

  render();
  return;
}


  if (msg.type === "ORDER_UPDATED") {
  const idx = orders.findIndex(
    o => String(o.orderId) === String(msg.order.orderId)
  );

  if (idx === -1) {
    console.warn("[Kitchen] Updated order not found, adding it");
    orders.push(msg.order);
  } else {
    orders[idx] = msg.order;
  }

  render();
  return;
}
};
socket.onerror = () => socket.close();

  socket.onclose = () => {
    console.warn("[Kitchen] WS disconnected → polling");
    startPolling();
    setTimeout(connectWS, 3000);
  };
}
function updateConnectionStatus(state) {
  const dot = document.querySelector(".pulse-dot");
  if (state === "connected") {
    statusEl.textContent = "Live";
    dot.style.background = "#10b981";
  } else if (state === "polling") {
    statusEl.textContent = "Polling";
    dot.style.background = "#f59e0b";
  } else {
    statusEl.textContent = "Connecting...";
    dot.style.background = "#6b7280";
  }
}
(async function init() {
  await loadMenu();
  connectWS();
})();
