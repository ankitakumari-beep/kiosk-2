self.onmessage = (event) => {
  const { orderId, items, createdAt } = event.data;

  const lines = [];
  let totalAmount=0;
  lines.push("HYPER KITCHEN HUB");
  lines.push("----------------------------");
  lines.push(`Order ID : ${orderId}`);
  lines.push(`Date     : ${new Date(createdAt).toLocaleString()}`);
  lines.push("");
  lines.push("Items:");

  items.forEach((item) => {
   const lineTotal = item.price * item.quantity;
   totalAmount+=lineTotal;
    lines.push(
     `${item.name ?? item.productId}  x${item.quantity}  = ₹${lineTotal}`
    );
  });
 
  lines.push("");
  lines.push("----------------------------");
  lines.push(`TOTAL: ₹${totalAmount}`);
  lines.push("----------------------------");
  lines.push("Thank you for your order 🙏");

  const receiptText = lines.join("\n");

  self.postMessage({
    type: "RECEIPT_READY",
    receiptText,
  });
};
