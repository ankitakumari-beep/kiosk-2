import { getAllRecords } from "../../src/storage/storage.js";

let categories = [];

export async function loadCategories() {
  categories = await getAllRecords("categories");

  const select = document.getElementById("categories");
  const filter = document.getElementById("categoryFilter");

  select.innerHTML = '<option value="">-- Select Category --</option>';
  filter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(c => {
    const opt1 = new Option(c.name, c.categoryId);
    const opt2 = new Option(c.name, c.categoryId);
    select.appendChild(opt1);
    filter.appendChild(opt2);
  });
}

export function getCategoryName(id) {
  return categories.find(c => c.categoryId === id)?.name ?? "--";
}
