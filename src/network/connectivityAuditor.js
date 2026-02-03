import { syncQueue } from "../queue/offlineQueue.js";
import { connectionLEDs } from "../ui/components/connectionLED.js";

let baseInterval = 5000; 
let currentInterval = baseInterval;
let timer = null;

export function startConnectivityAuditor() {
  if (timer) return;

  const runCheck = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch("http://localhost:3000/health", {
        signal: controller.signal,
      });

      if (res.status === 200) {
        connectionLEDs.backendHealthy();
        console.log("[Connectivity] Online — triggering sync");
        currentInterval = baseInterval; // reset backoff
        syncQueue();
      } 
      else if (res.status === 429) {
        connectionLEDs.backendDegraded();
        currentInterval = Math.min(currentInterval * 2, 60000);
        console.warn(
          "[Connectivity] Rate limited — backing off to",
          currentInterval,
          "ms"
        );
      }
    } catch (err) {
      connectionLEDs.backendDegraded();
      console.warn("[Connectivity] Offline or timeout");
    } finally {
      clearTimeout(timeoutId);
      timer = setTimeout(runCheck, currentInterval);
    }
  };

  runCheck();
}

export function stopConnectivityAuditor() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
