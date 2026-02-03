import http from "http";
import { router } from "./router.js";
import { initOrderSocket } from "./orderSocket.js";
import "./priceInventoryEngine.js";

const server = http.createServer(router);

initOrderSocket(server);

server.listen(3000, () => {
  console.log("[Server] Running on port 3000");
});
