import { subscribeToSyncState } from "../../queue/offlineQueue.js";

export function renderSyncStatus() {
  const getCounter = () => document.getElementById("syncCounter");

  const unsubscribe = subscribeToSyncState((state) => {
    const counter = getCounter();
    if (!counter) return;

    const countEl = counter.querySelector(".sync-count");
    if (!countEl) return;

    // Update count
    countEl.textContent = state.pendingCount || 0;

    // Reset classes
    counter.classList.remove("pending", "offline");

    // Update visual state
    if (!state.isOnline) {
      counter.classList.add("offline");
      counter.title = "Offline — sync paused";
    } else if (state.isSyncing || state.pendingCount > 0) {
      counter.classList.add("pending");
      counter.title = `${state.pendingCount} orders pending sync`;
    } else {
      counter.title = "All orders synced";
    }
  });

  return () => unsubscribe();
}
