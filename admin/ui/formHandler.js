import {
  createProduct,
  updateProductPrice,
  updateProductStock
} from "../services/adminApi.js";
import { showToast } from "./toast.js";
import { generateUUID } from "../utils/uuid.js";

let imageBase64 = null;

export function initFormHandlers() {
  const nameInput = document.getElementById("name");
  const descriptionInput = document.getElementById("description");
  const priceInput = document.getElementById("price");
  const quantityInput = document.getElementById("quantity");
  const categorySelect = document.getElementById("categories");

  const imageInput = document.getElementById("productImageInput");
  const previewImg = document.getElementById("productImagePreview");

  const addBtn = document.getElementById("addProductBtn");
  const updateProductSelect = document.getElementById("updateProductSelect");
  const updateValue = document.getElementById("updateValue");
  const applyUpdateBtn = document.getElementById("applyUpdateBtn");

  imageInput?.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = reader.result;
      previewImg.src = imageBase64;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  addBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = Number(priceInput.value);
    const quantity = Number(quantityInput.value);

    if (!name || price <= 0) {
      showToast("Please enter valid name & price", "error");
      return;
    }

    if (quantity < 0) {
      showToast("Invalid quantity", "error");
      return;
    }

    const body = {
      productId: `prod_${generateUUID()}`,
      name,
      description,
      basePrice: price,
      availableQuantity: quantity,
      categoryIds: categorySelect.value ? [categorySelect.value] : [],
      isActive: true,
      imageBase64, 
    };

    const res = await createProduct(body);

    if (res.ok) {
      showToast("Product added successfully");

      nameInput.value = "";
      descriptionInput.value = "";
      priceInput.value = "";
      quantityInput.value = "";
      categorySelect.value = "";
      imageInput.value = "";
      previewImg.style.display = "none";
      imageBase64 = null;
    } else {
      showToast("Failed to add product", "error");
    }
  };

  applyUpdateBtn.onclick = async () => {
    const productId = updateProductSelect.value;
    const value = Number(updateValue.value);

    if (!productId || value < 0) return;

    if (applyUpdateBtn.dataset.type === "price") {
      await updateProductPrice(productId, value);
    } else {
      await updateProductStock(productId, value);
    }

    showToast("Updated successfully");
  };
}
