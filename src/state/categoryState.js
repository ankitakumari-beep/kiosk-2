import { getAllRecords } from "/src/storage/storage.js";

let activeCategoryId = "ALL";
let categoriesCache = [];

export async function loadCategories() {
  if (categoriesCache.length) return categoriesCache;

  const categories = await getAllRecords("categories");
  categoriesCache = categories.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  return categoriesCache;
}

export function getActiveCategory() {
  return activeCategoryId;
}

export function setActiveCategory(categoryId) {
  activeCategoryId = categoryId;
}
