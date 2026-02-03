import { connectionLEDs } from "../ui/components/connectionLED.js";

const activePolls = new Map();

export function startPolling(orderId, onUpdate) {
  if (activePolls.has(orderId)) return;
  console.log("[Polling] Started for", orderId);
  connectionLEDs.pollingActive();
  const timer = setInterval(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/orders/${orderId}/status`
      );
      if (!res.ok) return;

      const data = await res.json();
      onUpdate({
        orderId,
        status: data.status,
        updatedAt: Date.now()
      });

      if (data.status === "COMPLETED") {
        connectionLEDs.pollingIdle();
        stopPolling(orderId);
      }
    } catch {
      console.warn("[Polling] Failed");
      connectionLEDs.pollingIdle();
    }
  }, 2000);

  activePolls.set(orderId, timer);
}

export function stopPolling(orderId) {
  const timer = activePolls.get(orderId);
  if (!timer) return;
  clearInterval(timer);
  activePolls.delete(orderId);
  console.log("[Polling] Stopped for", orderId);
  connectionLEDs.pollingIdle();
}
