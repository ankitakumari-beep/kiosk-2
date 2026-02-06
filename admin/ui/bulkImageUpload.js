import { allProducts } from "../state/adminProductState.js";
import { updateProductImage } from "../services/adminImageApi.js";
import { showToast } from "./toast.js";

export function initBulkImageUpload() {
  const input = document.getElementById("bulkImageInput");
  const list = document.getElementById("bulkPreviewList");
  const uploadBtn = document.getElementById("bulkUploadBtn");

  const worker = new Worker(
    new URL("./imageWorker.js", import.meta.url),
    { type: "module" }
  );

  let items = [];

  input.addEventListener("change", () => {
    items = [];
    list.innerHTML = "";

    [...input.files].forEach((file, index) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      const select = document.createElement("select");
      select.innerHTML =
        `<option value="">Select product</option>` +
        allProducts.map(p =>
          `<option value="${p.productId}">${p.name}</option>`
        ).join("");

      const row = document.createElement("div");
      row.className = "bulk-preview-item";
      row.append(img, select);
      list.appendChild(row);

      items[index] = {
        productId: "",
        buffer: null,
        mime: null
      };

      select.onchange = () => {
        items[index].productId = select.value;
        validate();
      };

      worker.postMessage({ file, index });
    });
  });

  worker.onmessage = (e) => {
    const { index, buffer, mime, error } = e.data;

    if (error) {
      showToast("Image processing failed", "error");
      return;
    }

    items[index].buffer = Array.from(new Uint8Array(buffer));
    items[index].mime = mime;
    validate();
  };

  function validate() {
    uploadBtn.disabled = items.some(
      i => !i.productId || !i.buffer
    );
  }

  uploadBtn.onclick = async () => {
    for (const i of items) {
      await updateProductImage(i.productId, i.buffer, i.mime);
    }

    showToast("Images uploaded successfully");
    uploadBtn.disabled = true;
    list.innerHTML = "";
    input.value = "";
  };
}
