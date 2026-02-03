const DB_NAME = "hyper_kitchen_hub";
const STORE_NAME = "products";

const NEW_IMAGE_URL =
  "https://images.unsplash.com/photo-1606313564200-e75d5e30476c";

export async function seedTestData() {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(DB_NAME);

    openReq.onerror = () => reject(openReq.error);

    openReq.onsuccess = () => {
      const db = openReq.result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const getAllReq = store.getAll();

      getAllReq.onerror = () => reject(getAllReq.error);

      getAllReq.onsuccess = () => {
        const products = getAllReq.result;

        let updatedCount = 0;

        products.forEach((product) => {
          // add or overwrite imageUrl
          product.imageUrl = NEW_IMAGE_URL;
          store.put(product);
          updatedCount++;
        });

        tx.oncomplete = () => {
          console.log(
            `[Migration] Updated imageUrl for ${updatedCount} products`
          );
          resolve(updatedCount);
        };

        tx.onerror = () => reject(tx.error);
      };
    };
  });
}
