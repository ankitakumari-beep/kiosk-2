export function healthRoutes(req, res) {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "OK",
        uptime: process.uptime(),
        timestamp: Date.now(),
      })
    );
  }

  return false;
}
