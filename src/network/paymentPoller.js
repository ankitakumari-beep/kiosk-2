import { connectionLEDs } from "../ui/components/connectionLED.js";
export async function waitForPayment(paymentId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); 
  
  try {
    connectionLEDs.paymentPollingActive();
    const res = await fetch(
      `http://localhost:3000/payments/${paymentId}/status`,
      { signal: controller.signal }
    );

    if (res.status === 204) {
      return { status: "TIMEOUT" };
    }

    if (!res.ok) {
      connectionLEDs.paymentPollingFailed();
      return { status: "FAILED" };
    }
    const data = await res.json();
    return data; 
  } catch (err) {
    connectionLEDs.paymentPollingFailed();
    if (err.name === "AbortError") {
      return { status: "TIMEOUT" };
    }
    return { status: "FAILED" };
  } finally {
    connectionLEDs.paymentPollingIdle();
    clearTimeout(timeoutId);
  }
}
