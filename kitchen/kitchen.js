import { loadMenu } from "./services/menuService.js";
import { connectWS } from "./network/socket.js";

(async function init() {
  await loadMenu();
  connectWS();
})();
