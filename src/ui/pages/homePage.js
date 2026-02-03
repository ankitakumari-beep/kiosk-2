import { renderMenu } from "../renderMenu.js";
import { renderCart } from "../renderCart.js";
import { initEvents } from "../events.js";
import { renderSyncStatus } from "../components/syncStatus.js";
import { renderCategoryTabs } from "/src/ui/renderCategories.js";

export function renderHomePage() {
  const cleanupSync = renderSyncStatus(
    document.querySelector(".system-menu-bar")
  );
  renderCategoryTabs(); 
  //renderMenu();
  renderCart();
  queueMicrotask(() => {
  renderMenu();
});
  const cleanupEvents = initEvents();
  return () => {
    cleanupEvents();
    cleanupSync();
  };
}
