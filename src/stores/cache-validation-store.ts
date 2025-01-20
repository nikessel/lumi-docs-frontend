import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CacheInvalidationState {
    staleIds: string[];
    addStaleId: (id: string) => void;
    removeStaleIds: (ids: string[]) => void;
    lastUpdated: Record<string, number>;
    triggerUpdate: (storeName: string) => void;
    beingRefetched: Record<string, boolean>;
    setBeingRefetched: (storeName: string, status: boolean) => void;
}

const useCacheInvalidationStore = create<CacheInvalidationState>()(
    persist(
        (set) => ({
            // Stale ID management
            staleIds: [],
            addStaleId: (id: string) =>
                set((state) => ({
                    staleIds: state.staleIds.includes(id)
                        ? state.staleIds // Avoid duplicates
                        : [...state.staleIds, id],
                })),
            removeStaleIds: (ids: string[]) =>
                set((state) => ({
                    staleIds: state.staleIds.filter((staleId) => !ids.includes(staleId)), // Remove matching IDs
                })),

            // Cache update triggers
            lastUpdated: {}, // Tracks the last update timestamp for each store
            triggerUpdate: (storeName: string) =>
                set((state) => ({
                    lastUpdated: {
                        ...state.lastUpdated,
                        [storeName]: Date.now(), // Update the timestamp for the store
                    },
                })),

            // Refetch status tracking
            beingRefetched: {}, // Tracks if a specific store is being refetched
            setBeingRefetched: (storeName: string, status: boolean) =>
                set((state) => ({
                    beingRefetched: {
                        ...state.beingRefetched,
                        [storeName]: status,
                    },
                })),
        }),
        {
            name: 'cache-invalidation-store', // Key for storage
            storage: createJSONStorage(() => localStorage), // Use localStorage
        }
    )
);

export default useCacheInvalidationStore;