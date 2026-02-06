import { initStorage } from "../storage/storage.js";
import { loadMenuFromStorage } from "./loadMenu.js";
import { restoreCart } from "../state/cartState.js";
import { renderPage } from "../ui/pageController.js";
import { renderHomePage } from "../ui/pages/homePage.js";
import { registerConnectivityListeners } from "../network/connectivity.js";
import { syncQueue } from "../queue/offlineQueue.js";
import { startPriceInventorySSE } from "../network/priceInventorySSE.js";
import { startConnectivityAuditor } from "../network/connectivityAuditor.js";
import { rehydrateActiveOrders } from "../state/orderRecovery.js";
import { initOrderCounterFromDB } from "../state/orderCounter.js";
export async function initApp() {
  console.log("[InitApp] Starting application");
  await bootstrapLocalState();
  bootstrapNetwork();
  registerLifecycleHandlers();
  await rehydrateActiveOrders();
  renderPage(renderHomePage);
  startConnectivityAuditor();
  console.log("[InitApp] Application ready");
}

//BOOTSTRAP

async function bootstrapLocalState() {
  await initStorage();
  await initOrderCounterFromDB();
  await loadMenuFromStorage();
  restoreCart();
  //syncQueue();
}

function bootstrapNetwork() {
  registerConnectivityListeners();
  startPriceInventorySSE();
}

function registerLifecycleHandlers() {
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function handleVisibilityChange() {
  if (!document.hidden) {
    console.log("[App] Tab active — retrying sync");
    syncQueue();
  }
}
