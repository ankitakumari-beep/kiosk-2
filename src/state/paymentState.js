import { waitForPayment } from "../network/paymentPoller.js";

export async function startPayment(paymentDetails) {
  const res = await fetch("http://localhost:3000/payments/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentDetails),
  });
  console.log(paymentDetails);
  if (!res.ok) {
    throw new Error("Failed to initiate payment");
  }

  const { paymentId } = await res.json();

  return await waitForPayment(paymentId);
}
