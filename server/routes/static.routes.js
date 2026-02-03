import fs from "fs";
import path from "path";
import url from "url";

export function staticRoutes(req, res) {
  if (req.method !== "GET") return false;

  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const safePath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(__dirname, "..", safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const map = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
    };

    res.writeHead(200, { "Content-Type": map[ext] || "text/plain" });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
}
