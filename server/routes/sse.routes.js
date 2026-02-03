import { addSSEClient, removeSSEClient } from "../sse.js";

export function sseRoutes(req, res) {
  if (req.method === "GET" && req.url === "/price-inventory-stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    addSSEClient(res);
    req.on("close", () => removeSSEClient(res));
    return true;
  }

  return false;
}
