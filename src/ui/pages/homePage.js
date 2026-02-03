import { renderMenu } from "../renderMenu.js";
import { renderCart } from "../renderCart.js";
import { initEvents } from "../events.js";
import { renderSyncStatus } from "../components/syncStatus.js";
import { renderCategoryTabs } from "/src/ui/renderCategories.js";

export function renderHomePage() {
  // Top system bar 
  const cleanupSync = renderSyncStatus(
    document.querySelector(".system-menu-bar")
  );

  // Static UI sections
  renderCategoryTabs();
  renderCart();

  // Menu rendering depends on DOM being settled
  deferMenuRender();

  // Global event delegation
  const cleanupEvents = initEvents();

  return () => {
    cleanupEvents();
    cleanupSync();
  };
}

//INTERNAL HELPERS 

function deferMenuRender() {
  // Ensures cart + categories are fully rendered before menu mounts
  queueMicrotask(() => {
    renderMenu();
  });
}
