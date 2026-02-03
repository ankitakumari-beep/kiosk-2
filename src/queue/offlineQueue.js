import {
  getAllRecords,
  deleteRecord,
  updateRecord,
} from "../storage/storage.js";
import { isOnline } from "../network/connectivity.js";

let isSyncing = false;
let pendingCount = 0;
let isNetworkOnline = isOnline();
const listeners = new Set();

function notify() {
  listeners.forEach((cb) => cb(getSyncState()));
}

export function subscribeToSyncState(cb) {
  listeners.add(cb);
  cb(getSyncState()); 
  return () => listeners.delete(cb);
}

export function getSyncState() {
  return {
    isSyncing,
    pendingCount,
    isOnline: isNetworkOnline,
  };
}

export async function enqueueOrder(order) {
  console.log("[Queue] Order enqueued:", order.orderId);
}

export async function syncQueue() {
  if (isSyncing) return;

  if (!isOnline()) {
    console.log("[Queue] Offline — sync postponed");
    isNetworkOnline = false;
    notify();
    return;
  }

  isNetworkOnline = true;
  isSyncing = true;
  notify();

  try {
    const jobs = await getAllRecords("syncQueue");
    pendingCount = jobs.length;
    notify();

    for (const job of jobs) {
      const success = await sendOrderToServer(job.payload);

      if (!success) {
        console.log("[Queue] Sync failed, stopping");
        break;
      }

      await updateOrderSyncState(job.orderId);

      await deleteRecord("syncQueue", job.queueId);

      pendingCount--;
      notify();
    }
  } finally {
    isSyncing = false;
    notify();
  }
}

async function updateOrderSyncState(orderId) {
  const orders = await getAllRecords("orders");
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) return;

  // order.status = "synced";
  order.synced = true;
  order.updatedAt = Date.now();

  await updateRecord("orders", order);
}

async function sendOrderToServer(order) {
    const res = await fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  return res.ok;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
