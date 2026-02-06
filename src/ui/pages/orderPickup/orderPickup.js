const list = document.getElementById("orderList");
const emptyState = document.getElementById("emptyState");


let orders = [];
let socket = null;
let currentFilter = "ACTIVE";
let pollingTimer = null;
const POLL_INTERVAL = 3000;


async function startPolling() {
  if (pollingTimer) return;

  console.warn("[Pickup] WS down → polling");
  await pollOnce();

  pollingTimer = setInterval(pollOnce, POLL_INTERVAL);
}

function stopPolling() {
  if (!pollingTimer) return;

  console.log("[Pickup] WS restored → stop polling");
  clearInterval(pollingTimer);
  pollingTimer = null;
}

async function pollOnce() {
  try {
    const res = await fetch("http://localhost:3000/kitchen/orders");
    if (!res.ok) return;

    const snapshot = await res.json();

    // Replace local state with authoritative snapshot
    orders = snapshot;
    render();
  } catch (err) {
    console.warn("[Pickup] Poll failed");
  }
}

function isVisible(order) {
  if (currentFilter === "ACTIVE") {
    return ["PLACED", "ACCEPTED"].includes(order.status);
  }
  if (currentFilter === "COMPLETED") {
    return order.status === "READY";
  }
  return true;
}


function render() {
  list.innerHTML = "";

  let visible = 0;

  orders.forEach(order => {
    if (!isVisible(order)) return;

    list.appendChild(renderRow(order));
    visible++;
  });

  emptyState.style.display = visible === 0 ? "flex" : "none";
}

function renderRow(order) {
  const row = document.createElement("div");
  row.className = "order-row";

  row.innerHTML = `
    <div class="order-info">
      <span class="order-id">
  Order #${order.orderNumber ?? "—"}
</span>
      <span class="order-status ${statusClass(order.status)}">
        ${order.status}
      </span>
    </div>
    ${
      order.status === "READY"
        ? `<button class="pickup-btn">Mark as Picked Up</button>`
        : ""
    }
  `;

  const btn = row.querySelector(".pickup-btn");
  if (btn) {
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Processing...";
      await markPickedUp(order.orderId);
    };
  }

  return row;
}

function statusClass(status) {
  return {
    PLACED: "status-pending",
    ACCEPTED: "status-preparing",
    READY: "status-ready"
  }[status] || "status-pending";
}

function connectWS() {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("[Pickup] WS connected");
    stopPolling();
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "ORDERS_SNAPSHOT") {
      orders = msg.orders;
      render();
      return;
    }

    if (msg.type === "ORDER_CREATED") {
      upsertOrder(msg.order);
      return;
    }

    if (msg.type === "ORDER_UPDATED") {
      upsertOrder(msg.order);
      return;
    }
  };

  socket.onclose = () => {
    console.warn("[Pickup] WS disconnected, retrying…");
    startPolling();
    setTimeout(connectWS, 3000);
  };

  //socket.onerror = () => socket.close();
}

function upsertOrder(order) {
  if (order.status === "PICKED_UP") {
    orders = orders.filter(o => o.orderId !== order.orderId);
    render();
    return;
  }

  const idx = orders.findIndex(o => o.orderId === order.orderId);
  if (idx === -1) {
    orders.push(order);
  } else {
    orders[idx] = order;
  }

  render();
}


async function markPickedUp(orderId) {
  await fetch(`http://localhost:3000/admin/orders/${orderId}`, {
    method: "POST"
  });
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  };
});


connectWS();
