const DB_NAME = "hyper_kitchen_hub";
const DB_VERSION = 2; 

let db = null;

export function initStorage() {
  console.log("[Storage] Initializing IndexedDB...");

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      console.log("[Storage] Running database upgrade");
      const database = event.target.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        database.createObjectStore("products", { keyPath: "productId" });
        database.createObjectStore("categories", { keyPath: "categoryId" });
        database.createObjectStore("inventory", { keyPath: "productId" });
        database.createObjectStore("priceRules", { keyPath: "priceRuleId" });
        database.createObjectStore("orders", { keyPath: "orderId" });
        database.createObjectStore("orderStatus", { keyPath: "orderId" });
        database.createObjectStore("syncQueue", { keyPath: "queueId" });
      }

      if (oldVersion < 2) {
        if (database.objectStoreNames.contains("offlineOrders")) {
          database.deleteObjectStore("offlineOrders");
        }
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("[Storage] IndexedDB ready");
      resolve();
    };

    request.onerror = () => {
      reject("[Storage] IndexedDB failed to open");
    };
  });
}


function getObjectStore(storeName, mode = "readonly") {
  if (!db) {
    throw new Error("[Storage] Database not initialized");
  }

  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

export function addRecord(storeName, record) {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, "readwrite");
      const request = store.add(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function updateRecord(storeName, record) {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, "readwrite");
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, "readonly");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function deleteRecord(storeName, key) {
  return new Promise((resolve, reject) => {
    try {
      const store = getObjectStore(storeName, "readwrite");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}


export function hasAnyRecord(storeName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("[Storage] Database not initialized"));
      return;
    }

    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.count();

    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => reject(req.error);
  });
}
export function hasRecord(storeName, key) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("[Storage] Database not initialized"));
      return;
    }

    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(key);

    req.onsuccess = () => {
      resolve(!!req.result);
    };

    req.onerror = () => reject(req.error);
  });
}
