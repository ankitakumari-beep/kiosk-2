export function getProductImageSrc(p) {
  if (p.imageBuffer && p.imageMime) {
    const bytes =
      Array.isArray(p.imageBuffer)
        ? p.imageBuffer         
        : p.imageBuffer.data;    

    const blob = new Blob(
      [new Uint8Array(bytes)],
      { type: p.imageMime }
    );

    return URL.createObjectURL(blob);
  }

  return (
    p.imageUrl ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='32' fill='%2394a3b8'%3E?%3C/text%3E%3C/svg%3E"
  );
}
