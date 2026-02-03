import { initApp } from "./core/initApp.js";

console.log("[App] Script loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("[App] DOM fully loaded");
  start();
});

function start() {
  console.log("[App] Starting application...");
  initApp();
  console.log("[App] Step 2 complete");
}
