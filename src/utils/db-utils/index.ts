export const dbVersion = 1
export const dbName = "lumi-docs"

const REQUIRED_STORE_NAMES = ["files", "reports", "sections", "requirement_groups", "requirements", "meta", "user", "tasks"];

const openConnections: IDBDatabase[] = [];

export async function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = request.result;

            REQUIRED_STORE_NAMES.forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const keyPath = storeName === "meta" ? "key" : "id";
                    db.createObjectStore(storeName, { keyPath });
                }
            });
        };

        request.onsuccess = () => {
            const db = request.result;
            openConnections.push(db); // Track the connection
            db.onclose = () => {
                // Remove connection from the list when it's closed
                const index = openConnections.indexOf(db);
                if (index > -1) {
                    openConnections.splice(index, 1);
                }
            };
            resolve(db);
        };
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

    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    if (clearStore) {
        store.clear();
    }

    data.forEach((item) => {
        store.put(item);
    });

    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
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

    const transaction = db.transaction(storeName, "readonly");

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
    const db = await openDatabase();

    const transaction = db.transaction("meta", "readwrite");
    const store = transaction.objectStore("meta");

    // Perform the put operation
    store.put({ key, value });

    // Ensure transaction completion is logged
    await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
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
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Failed to clear store "${storeName}".`, event);
                reject(request.error);
            };
        }
    });
}

export async function deleteDatabase(): Promise<void> {
    // Close all open connections before deleting
    openConnections.forEach((db) => {
        db.close(); // Close the connection
    });
    openConnections.length = 0; // Clear the connections array

    return new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);

        deleteRequest.onsuccess = () => {
            console.log(`Database "${dbName}" deleted successfully.`);
            resolve();
        };

        deleteRequest.onerror = (event) => {
            console.error(`Failed to delete database "${dbName}".`, event);
            reject(deleteRequest.error);
        };

        deleteRequest.onblocked = () => {
            console.warn(
                `Deletion of database "${dbName}" is blocked. Ensure all connections are closed.`
            );
        };
    });
}



