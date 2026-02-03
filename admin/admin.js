import { initStorage } from "../src/storage/storage.js";
import { loadCategories } from "./state/adminCategoryState.js";
import { loadProducts } from "./state/adminProductState.js";
import { initAdminSSE } from "./services/adminSSE.js";
import { initCardToggle } from "./ui/cardToggle.js";
import { initFilters } from "./ui/filters.js";
import { initFormHandlers } from "./ui/formHandler.js";
import { initQuickUpdate } from "./ui/quickUpdate.js";

async function initAdmin() {
  try {
    await initStorage();

    await loadCategories();
    await loadProducts();

    initFilters();
    initFormHandlers();
    initCardToggle();
    initAdminSSE();
    initQuickUpdate();

    console.log("[Admin] Initialized");
  } catch (err) {
    console.error("[Admin] Init failed", err);
  }
}

initAdmin();
