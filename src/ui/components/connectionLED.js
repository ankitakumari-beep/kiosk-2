function setLED(id, color) {
  const led = document.querySelector(`#${id} .led`);
  if (!led) return;
  led.className = `led ${color}`;
}

export const connectionLEDs = {
  wsConnected() {
    setLED("wsIndicator", "green");
  },
  wsDisconnected() {
    setLED("wsIndicator", "red");
  },
  sseConnected() {
    setLED("sseIndicator", "green");
  },
  sseDisconnected() {
    setLED("sseIndicator", "red");
  },
  pollingActive() {
    setLED("lpIndicator", "yellow");
  },
  pollingIdle() {
    setLED("lpIndicator", "gray");
  },
  backendHealthy() {
    setLED("spIndicator", "green");
  },
  backendDegraded() {
    setLED("spIndicator", "yellow");
  },
  paymentPollingActive() {
  setLED("ppIndicator", "green");
},
paymentPollingIdle() {
  setLED("ppIndicator", "gray");
},
paymentPollingFailed() {
  setLED("ppIndicator", "red");
}

};
