import { initStorage, getAllRecords, updateRecord } from "../storage/storage.js";
import { loadMenuFromStorage } from "./loadMenu.js";
import { restoreCart } from "../state/cartState.js";
import { renderPage } from "../ui/pageController.js";
import { renderHomePage } from "../ui/pages/homePage.js";
import { registerConnectivityListeners } from "../network/connectivity.js";
import { syncQueue } from "../queue/offlineQueue.js";
import { startPriceInventorySSE } from "../network/priceInventorySSE.js";
import { startConnectivityAuditor } from "../network/connectivityAuditor.js";
// import { seedTestData } from "../dev/seed.js";

const API_BASE = "http://localhost:3000";
const ACTIVE_ORDER_STATUSES = ["PLACED", "ACCEPTED", "PREPARING"];

export async function initApp() {
  console.log("[InitApp] Starting application");

  await bootstrapLocalState();
  bootstrapNetwork();
  registerAppLifecycleHandlers();

  await rehydrateActiveOrders();

  renderPage(renderHomePage);
  startConnectivityAuditor();

  console.log("[InitApp] Application ready");
}



async function bootstrapLocalState() {
  await initStorage();
  await loadMenuFromStorage();
  // await seedTestData();
  restoreCart();
  syncQueue();
}

function bootstrapNetwork() {
  registerConnectivityListeners();
  startPriceInventorySSE();
}

function registerAppLifecycleHandlers() {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}


function handleVisibilityChange() {
  if (!document.hidden) {
    console.log("[App] Tab active — retrying sync");
    syncQueue();
  }
}


async function rehydrateActiveOrders() {
  const orders = await getAllRecords("orders");

  const activeOrders = orders.filter(order =>
    ACTIVE_ORDER_STATUSES.includes(order.status)
  );

  if (activeOrders.length === 0) return;

  console.log(`[Rehydrate] Replaying ${activeOrders.length} active orders`);

  for (const order of activeOrders) {
    await rehydrateOrder(order);
  }
}

async function rehydrateOrder(order) {
  try {
    await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    order.serverRehydrated = true;
    await updateRecord("orders", order);
  } catch (err) {
    console.warn("[Rehydrate] Failed for order", order.orderId);
  }
}
