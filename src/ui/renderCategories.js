import {
  loadCategories,
  setActiveCategory,
  getActiveCategory
} from "/src/state/categoryState.js";

import { renderMenu } from "/src/ui/renderMenu.js";

export async function renderCategoryTabs() {
  const container = document.querySelector(".category-tabs-content");
  if (!container) return;

  const categories = await loadCategories();
  const active = getActiveCategory();

  container.innerHTML = "";


  const allBtn = document.createElement("button");
  allBtn.className = `category-tab ${active === "ALL" ? "active" : ""}`;
  allBtn.textContent = "All";
  allBtn.onclick = () => {
    setActiveCategory("ALL");
    renderCategoryTabs();
    renderMenu();
  };
  container.appendChild(allBtn);

  // ---- DB CATEGORIES ----
  for (const c of categories) {
    const btn = document.createElement("button");
    btn.className = `category-tab ${active === c.categoryId ? "active" : ""}`;
    btn.textContent = c.name;

    btn.onclick = () => {
      setActiveCategory(c.categoryId);
      renderCategoryTabs();
      renderMenu();
    };

    container.appendChild(btn);
  }
}
