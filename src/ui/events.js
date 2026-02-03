import { addToCart } from "../state/cartState.js";
import { renderCart } from "./renderCart.js";
import { handleCheckout } from "./pages/checkoutPage.js";

export function initEvents() {
  const handler = async (event) => {
    if (event.target.closest("#cartButton")) {
      document.getElementById("cartModal")?.classList.add("active");
      renderCart();
      return;
    }

    if (
      event.target.id === "closeCartButton" ||
      event.target.id === "cartModal"
    ) {
      document.getElementById("cartModal")?.classList.remove("active");
      return;
    }

    const menuItem = event.target.closest(".menu-item");
    if (menuItem && event.target.closest(".add-btn, .qty-btn")) {
      const productId = menuItem.dataset.productId;
      await addToCart(productId);
      renderCart();
      return;
    }

    if (event.target.closest("#checkoutButton")) {
      // Close cart
      document.getElementById("cartModal")?.classList.remove("active");

      // Open payment details
      document.getElementById("paymentDetails")?.classList.add("active");
      return;
    }

    if (event.target.id === "closePaymentDetails") {
      document.getElementById("paymentDetails")?.classList.remove("active");
      return;
    }
    if (event.target.closest("#payNowButton")) {
      const nameInput = document.getElementById("payerName");
      const upiInput = document.getElementById("upiId");

      const nameError = document.getElementById("payerNameError");
      const upiError = document.getElementById("upiIdError");

      const payerName = nameInput?.value.trim();
      const upiId = upiInput?.value.trim();

      // Reset errors
      nameError.style.display = "none";
      upiError.style.display = "none";
      nameInput.classList.remove("error");
      upiInput.classList.remove("error");

      let hasError = false;

      if (!payerName) {
        nameError.textContent = "Name is required";
        nameError.style.display = "block";
        nameInput.classList.add("error");
        hasError = true;
      }

      if (!upiId) {
        upiError.textContent = "UPI ID is required";
        upiError.style.display = "block";
        upiInput.classList.add("error");
        hasError = true;
      }

      if (hasError) return;

      // Close payment details overlay
      document.getElementById("paymentDetails")?.classList.remove("active");

      // Start checkout
      handleCheckout({ payerName, upiId });
      return;
    }

    if (event.target.closest("#retryPaymentBtn")) {
      document.getElementById("paymentError")?.classList.remove("active");
      handleCheckout(); // retry uses previous details / backend logic
      return;
    }
  };
  document.addEventListener("click", handler);

  return () => {
    document.removeEventListener("click", handler);
  };
}
