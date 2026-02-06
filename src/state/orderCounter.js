import { getLastRecordByCreatedAt } from "../storage/storage.js";

let lastOrderNumber = null;

export async function initOrderCounterFromDB() {
  const lastOrder = await getLastRecordByCreatedAt("orders");

  lastOrderNumber = lastOrder?.orderNumber ?? 1000;

  console.log(
    "[OrderCounter] Initialized from IndexedDB:",
    lastOrderNumber
  );
}

export function getNextOrderNumber() {
  if (lastOrderNumber === null) {
    lastOrderNumber = 1000;
  }
  lastOrderNumber += 1;
  return lastOrderNumber;
}
