const clients = new Set();

export function addSSEClient(res) {
  clients.add(res);
}

export function removeSSEClient(res) {
  clients.delete(res);
}

export function broadcastSSE(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach((client) => client.write(payload));
}
