import { initStorage, getAllRecords } from "../src/storage/storage.js";
const imageInput = document.getElementById("productImageInput");
const previewImg = document.getElementById("productImagePreview");

let imageBase64 = null;

const API = "http://localhost:3000";

const productList = document.getElementById("productList");
const productCountEl = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const categoriesSelect = document.getElementById("categories");
const addProductBtn = document.getElementById("addProductBtn");

// Quick Update Elements
const updateProductSelect = document.getElementById("updateProductSelect");
const updateTypeButtons = document.querySelectorAll(".type-btn");
const updateValue = document.getElementById("updateValue");
const updateValueLabel = document.getElementById("updateValueLabel");
const updateInputIcon = document.getElementById("updateInputIcon");
const applyUpdateBtn = document.getElementById("applyUpdateBtn");

// Card Toggle Elements
const cardToggleButtons = document.querySelectorAll(".toggle-btn");
const cardViews = document.querySelectorAll(".card-view");

const toast = document.getElementById("toast");

window.__adminDbReady = false;
let allProducts = [];
let allCategories = [];
let selectedUpdateType = "price";

const categoryFilter = document.getElementById("categoryFilter");
let activeCategoryFilter = "all";


function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

async function loadCategories() {
  try {
    const categories = await getAllRecords("categories");
    allCategories = categories;

    // Add Product form dropdown
    categoriesSelect.innerHTML =
      '<option value="">-- Select Category --</option>';

    // Filter dropdown
    categoryFilter.innerHTML =
      '<option value="all">All Categories</option>';

    categories.forEach((cat) => {
      // Add Product select
      const option = document.createElement("option");
      option.value = cat.categoryId;
      option.textContent = cat.name;
      categoriesSelect.appendChild(option);

      // Filter select
      const filterOpt = document.createElement("option");
      filterOpt.value = cat.categoryId;
      filterOpt.textContent = cat.name;
      categoryFilter.appendChild(filterOpt);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}


imageInput.addEventListener("change", () => {
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

addProductBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const price = Number(priceInput.value);
  const quantity = Number(quantityInput.value);
  const categoryId = categoriesSelect.value;

  // Validation
  if (!name || !price || price <= 0) {
    showToast(
      "Please fill in Product Name and Price (must be greater than 0)",
      "error",
    );
    return;
  }

  if (!quantity || quantity < 0) {
    showToast("Please enter a valid stock quantity", "error");
    return;
  }

  const productId = `prod_${generateUUID()}`;

  const body = {
    productId,
    name,
    description,
    basePrice: price,
    availableQuantity: quantity,
    categoryIds: categoryId ? [categoryId] : [],
    isActive: true,
    imageBase64,
  };

  try {
    console.log("[ADMIN] imageBase64:", imageBase64);
    const response = await fetch(`${API}/admin/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      showToast("Product added successfully!", "success");

      // Clear form
      nameInput.value = "";
      descriptionInput.value = "";
      priceInput.value = "";
      quantityInput.value = "";
      categoriesSelect.value = "";
      imageInput.value = "";
      previewImg.style.display = "none";
      imageBase64 = null;
    } else {
      showToast("Failed to add product", "error");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    showToast("Error adding product", "error");
  }
});

async function loadProductsFromIndexedDB() {
  try {
    const products = await getAllRecords("products");
    const inventory = await getAllRecords("inventory");
    const priceRules = await getAllRecords("priceRules");

    const inventoryMap = new Map(
      inventory.map((i) => [i.productId, i.availableQuantity]),
    );

    const priceMap = new Map(priceRules.map((p) => [p.productId, p.basePrice]));

    allProducts = products.map((p) => ({
      ...p,
      price: priceMap.get(p.productId) ?? 0,
      quantity: inventoryMap.get(p.productId) ?? 0,
    }));

    renderProducts(allProducts);
    updateProductDropdown();
  } catch (error) {
    console.error("Error loading products:", error);
    renderEmptyState();
  }
}

function updateProductDropdown() {
  updateProductSelect.innerHTML = '<option value="">-- Choose a product --</option>';
  
  allProducts.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.productId;
    option.textContent = p.name;
    updateProductSelect.appendChild(option);
  });
}

function getCategoryName(categoryIds) {
  if (!categoryIds || categoryIds.length === 0) return "--";

  const categoryId = categoryIds[0];
  const category = allCategories.find((cat) => cat.categoryId === categoryId);
  return category ? category.name : "--";
}

function renderProducts(products) {
  productCountEl.textContent = products.length;

  if (!products.length) {
    renderEmptyState();
    return;
  }

  productList.innerHTML = products
    .map((p) => {
      const categoryName = getCategoryName(p.categoryIds);

      return `
      <div class="product-item" data-product-id="${p.productId}">
        <div class="product-image">
          <img src="${getProductImageSrc(p)}" alt="${p.name}" />
        </div>
        <div class="product-info">
          <div class="product-name">
            ${p.name}
            ${categoryName !== "--" ? `<span class="category-badge">${categoryName}</span>` : ""}
          </div>
          ${p.description ? `<div class="product-description">${p.description}</div>` : ""}
          <div class="product-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <strong>$${p.price.toFixed(2)}</strong>
            </div>
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <strong>${p.quantity}</strong> in stock
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderEmptyState() {
  productList.innerHTML = `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
      <p>No products found. Add your first product above!</p>
    </div>
  `;
  productCountEl.textContent = "0";
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  let filtered = allProducts;

  // Category filter
  if (activeCategoryFilter !== "all") {
    filtered = filtered.filter((p) =>
      p.categoryIds?.includes(activeCategoryFilter)
    );
  }

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description &&
          p.description.toLowerCase().includes(searchTerm))
    );
  }

  renderProducts(filtered);
}

searchInput.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", (e) => {
  activeCategoryFilter = e.target.value;
  applyFilters();
});


// Quick Update Functionality
updateTypeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    updateTypeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedUpdateType = btn.dataset.type;
    
    if (selectedUpdateType === "price") {
      updateValueLabel.textContent = "New Price ($)";
      updateInputIcon.textContent = "$";
      updateValue.step = "0.01";
      updateValue.placeholder = "Enter new price";
    } else {
      updateValueLabel.textContent = "New Stock Quantity";
      updateInputIcon.textContent = "#";
      updateValue.step = "1";
      updateValue.placeholder = "Enter new quantity";
    }
    
    updateValue.value = "";
    checkUpdateFormValidity();
  });
});

updateProductSelect.addEventListener("change", checkUpdateFormValidity);
updateValue.addEventListener("input", checkUpdateFormValidity);

function checkUpdateFormValidity() {
  const hasProduct = updateProductSelect.value !== "";
  const hasValue = updateValue.value !== "" && Number(updateValue.value) >= 0;
  
  applyUpdateBtn.disabled = !(hasProduct && hasValue);
}

applyUpdateBtn.addEventListener("click", async () => {
  const productId = updateProductSelect.value;
  const newValue = Number(updateValue.value);
  
  if (!productId || newValue < 0) {
    showToast("Please select a product and enter a valid value", "error");
    return;
  }
  
  if (selectedUpdateType === "price") {
    if (newValue <= 0) {
      showToast("Price must be greater than 0", "error");
      return;
    }
    await updatePrice(productId, newValue);
  } else {
    await updateStock(productId, newValue);
  }
  
  // Reset form
  updateValue.value = "";
  checkUpdateFormValidity();
});

async function updatePrice(productId, newPrice) {
  try {
    const res = await fetch(`${API}/admin/product/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basePrice: newPrice }),
    });
    
    if (!res.ok) {
      showToast("Failed to update price", "error");
      return;
    }
    
    showToast("Price updated successfully!", "success");
  } catch (error) {
    console.error("Error updating price:", error);
    showToast("Failed to update price", "error");
  }
}

async function updateStock(productId, newQuantity) {
  try {
    const res = await fetch(`${API}/admin/inventory/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availableQuantity: newQuantity }),
    });
    
    if (!res.ok) {
      showToast("Failed to update stock", "error");
      return;
    }
    
    showToast("Stock updated successfully!", "success");
  } catch (error) {
    console.error("Error updating stock:", error);
    showToast("Failed to update stock", "error");
  }
}

const es = new EventSource(`${API}/price-inventory-stream`);

es.onmessage = async () => {
  if (!window.__adminDbReady) return;
  await loadProductsFromIndexedDB();
};

es.onerror = () => {
  document.getElementById("statusText").textContent = "Disconnected";
  document.querySelector(".status-dot").style.background = "#ef4444";
};

es.onopen = () => {
  document.getElementById("statusText").textContent = "Connected";
  document.querySelector(".status-dot").style.background = "#10b981";
};

async function initAdmin() {
  try {
    await initStorage();
    window.__adminDbReady = true;

    await loadCategories();
    await loadProductsFromIndexedDB();

    console.log("Admin panel initialized successfully");
  } catch (error) {
    console.error("Error initializing admin panel:", error);
    showToast("Error initializing admin panel", "error");
  }
}

initAdmin();

function getProductImageSrc(p) {
  if (p.imageBuffer && p.imageMime) {
    const blob = new Blob(
      [new Uint8Array(p.imageBuffer.data)],
      { type: p.imageMime }
    );
    return URL.createObjectURL(blob);
  }
  return p.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='32' fill='%2394a3b8'%3E?%3C/text%3E%3C/svg%3E";
}

// Card Toggle Functionality
cardToggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active from all buttons
    cardToggleButtons.forEach((b) => b.classList.remove("active"));
    // Add active to clicked button
    btn.classList.add("active");
    
    // Get the card to show
    const cardToShow = btn.dataset.card;
    
    // Toggle card visibility
    cardViews.forEach((view) => {
      if (view.classList.contains(`${cardToShow}-card`)) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });
  });
});