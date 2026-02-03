import {
  updateProductPrice,
  updateProductStock
} from "../services/adminApi.js";
import { showToast } from "./toast.js";

let selectedUpdateType = "price";

export function initQuickUpdate() {
  const updateProductSelect = document.getElementById("updateProductSelect");
  const updateTypeButtons = document.querySelectorAll(".type-btn");
  const updateValue = document.getElementById("updateValue");
  const updateValueLabel = document.getElementById("updateValueLabel");
  const updateInputIcon = document.getElementById("updateInputIcon");
  const applyUpdateBtn = document.getElementById("applyUpdateBtn");

  updateTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      updateTypeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      selectedUpdateType = btn.dataset.type;

      if (selectedUpdateType === "price") {
        updateValueLabel.textContent = "New Price ($)";
        updateInputIcon.textContent = "$";
        updateValue.step = "0.01";
      } else {
        updateValueLabel.textContent = "New Stock Quantity";
        updateInputIcon.textContent = "#";
        updateValue.step = "1";
      }

      updateValue.value = "";
      validate();
    });
  });

  updateProductSelect.addEventListener("change", validate);
  updateValue.addEventListener("input", validate);

  function validate() {
    const ok =
      updateProductSelect.value &&
      updateValue.value !== "" &&
      Number(updateValue.value) >= 0;

    applyUpdateBtn.disabled = !ok;
  }

  applyUpdateBtn.addEventListener("click", async () => {
    const productId = updateProductSelect.value;
    const value = Number(updateValue.value);

    if (!productId || value < 0) return;

    if (selectedUpdateType === "price") {
      if (value <= 0) {
        showToast("Price must be greater than 0", "error");
        return;
      }
      await updateProductPrice(productId, value);
    } else {
      await updateProductStock(productId, value);
    }

    showToast("Updated successfully");
    updateValue.value = "";
    validate();
  });
}
