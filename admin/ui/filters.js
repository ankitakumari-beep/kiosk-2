import { allProducts } from "../state/adminProductState.js";
import { renderProducts } from "./productRenderer.js";

export function initFilters() {
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");

  function apply() {
    let filtered = allProducts;

    if (category.value !== "all") {
      filtered = filtered.filter(p =>
        p.categoryIds?.includes(category.value)
      );
    }

    if (search.value) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.value.toLowerCase())
      );
    }

    renderProducts(filtered);
  }

  search.addEventListener("input", apply);
  category.addEventListener("change", apply);
}
