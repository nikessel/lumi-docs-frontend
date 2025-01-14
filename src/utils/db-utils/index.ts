export const dbVersion = 1
export const dbName = "lumi-docs"

const REQUIRED_STORE_NAMES = ["files", "reports", "sections", "requirement_groups", "requirements", "meta", "user", "tasks"];

export async function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = request.result;
            console.log("Upgrading database...");

            REQUIRED_STORE_NAMES.forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const keyPath = storeName === "meta" ? "key" : "id";
                    db.createObjectStore(storeName, { keyPath });
                    console.log(`Created object store: ${storeName}`);
                }
            });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveData<T>(
    dbName: string,
    storeName: string,
    data: T[],
    dbVersion: number,
    clearStore = false
): Promise<void> {
    const db = await openDatabase();

    console.log("userrr !!!! saveData", data, dbName, storeName)


    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    if (clearStore) {
        console.log(`Clearing store: ${storeName}`);
        store.clear();
    }

    data.forEach((item) => {
        console.log("Saving item:", item);
        store.put(item);
    });

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
            console.log("Transaction completed.");
            resolve();
        };
        transaction.onerror = (event) => {
            console.error("Transaction error:", event);
            reject(transaction.error);
        };
    });
}


export async function getData<T>(
    dbName: string,
    storeName: string,
    dbVersion: number
): Promise<T[]> {

    const db = await openDatabase();

    console.log("Before transaction", dbName, storeName, dbVersion)

    const transaction = db.transaction(storeName, "readonly");

    console.log("After transaction", transaction, dbName, storeName, dbVersion)

    const store = transaction.objectStore(storeName);



    const result: T[] = [];
    return new Promise((resolve) => {
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest)?.result;
            if (cursor) {
                result.push(cursor.value);
                cursor.continue();
            } else {
                resolve(result);
            }
        };

        cursorRequest.onerror = () => resolve([]);
    });
}

export async function getMetadata(
    dbName: string,
    key: string,
    dbVersion: number
): Promise<any | null> {
    const db = await openDatabase();

    const transaction = db.transaction("meta", "readonly");
    const store = transaction.objectStore("meta");

    return new Promise((resolve) => {
        const request = store.get(key);

        request.onsuccess = () => {
            const result = request.result ? request.result.value : null;
            console.log(`Metadata retrieved for key "${key}":`, result);
            resolve(result);
        };
        request.onerror = () => {
            console.error(`Failed to retrieve metadata for key "${key}"`);
            resolve(null);
        };
    });
}


export async function saveMetadata(
    dbName: string,
    key: string,
    value: any,
    dbVersion: number
): Promise<void> {
    console.log("saveMetadata started")
    const db = await openDatabase();

    const transaction = db.transaction("meta", "readwrite");
    console.log("transaction", transaction)
    const store = transaction.objectStore("meta");
    console.log("store", store)
    console.log(`Saving metadata: { key: ${key}, value:`, value, "}");

    // Perform the put operation
    store.put({ key, value });

    // Ensure transaction completion is logged
    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
            console.log(`Metadata successfully saved: { key: ${key}, value:`, value, "}");
            resolve();
        };
        transaction.onerror = (event) => {
            console.error(`Failed to save metadata: { key: ${key}, value:`, value, "}", event);
            reject(transaction.error);
        };
    });
}

export async function deleteData(
    dbName: string,
    storeName: string,
    dbVersion: number,
    key?: string | number
): Promise<void> {
    const db = await openDatabase();

    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        if (key !== undefined) {
            // Delete a specific record by key
            const request = store.delete(key);
            request.onsuccess = () => {
                console.log(`Record with key "${key}" successfully deleted from store "${storeName}".`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Failed to delete record with key "${key}" from store "${storeName}".`, event);
                reject(request.error);
            };
        } else {
            // Clear all records in the store
            const request = store.clear();
            request.onsuccess = () => {
                console.log(`All data cleared from store "${storeName}".`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Failed to clear store "${storeName}".`, event);
                reject(request.error);
            };
        }
    });
}




