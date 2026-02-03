import { syncQueue } from "../queue/offlineQueue.js";

export function isOnline() {
  return navigator.onLine;
}
export function registerConnectivityListeners() {
  window.addEventListener("online", () => {
    console.log("[Connectivity] Network restored");
    syncQueue();
  });
}