import { API } from "../core/config.js";
import { state } from "../core/state.js";

export async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    if (!res.ok) return;

    const menu = await res.json();
    menu.forEach(item => {
      state.productMap[item.productId] = item.name;
    });
  } catch {
    console.warn("[Kitchen] Menu load failed");
  }
}
