import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CacheInvalidationState {
    staleIds: string[];
    staleReportIds: string[];
    staleFileIds: string[];

    addStaleId: (id: string) => void;
    removeStaleIds: (ids: string[]) => void;

    addStaleReportId: (id: string) => void;
    removeStaleReportIds: (ids: string[]) => void;

    addStaleFileId: (id: string) => void;
    removeStaleFileIds: (ids: string[]) => void;
    clearStaleFileIds: () => void;

    lastUpdated: Record<string, number>;
    triggerUpdate: (storeName: string) => void;
    beingRefetched: Record<string, boolean>;
    setBeingRefetched: (storeName: string, status: boolean) => void;
    resetState: () => void
}

const useCacheInvalidationStore = create<CacheInvalidationState>()(
    persist(
        (set) => ({
            // Stale ID management
            staleIds: [],
            staleReportIds: [],
            staleFileIds: [],

            addStaleId: (id: string) =>
                set((state) => ({
                    staleIds: state.staleIds.includes(id)
                        ? state.staleIds // Avoid duplicates
                        : [...state.staleIds, id],
                })),

            addStaleReportId: (id: string) =>
                set((state) => ({
                    staleReportIds: state.staleReportIds.includes(id)
                        ? state.staleReportIds
                        : [...state.staleReportIds, id],
                })),

            addStaleFileId: (id: string) =>
                set((state) => ({
                    staleFileIds: state.staleFileIds.includes(id)
                        ? state.staleFileIds
                        : [...state.staleFileIds, id],
                })),

            removeStaleIds: (ids: string[]) =>
                set((state) => ({
                    staleIds: state.staleIds.filter((staleId) => !ids.includes(staleId)), // Remove matching IDs
                })),

            removeStaleReportIds: (ids: string[]) =>
                set((state) => ({
                    staleReportIds: state.staleReportIds.filter((staleId) => !ids.includes(staleId)), // Remove matching IDs
                })),

            removeStaleFileIds: (ids: string[]) =>
                set((state) => ({
                    staleFileIds: state.staleFileIds.filter((staleId) => !ids.includes(staleId)), // Remove matching IDs
                })),

            clearStaleFileIds: () =>
                set((state) => ({
                    staleFileIds: [], // Remove matching IDs
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

            resetState: () => set(() => ({ staleIds: [], staleReportIds: [], lastUpdated: {}, beingRefetched: {}, })),
        }),
        {
            name: 'cache-invalidation-store', // Key for storage
            storage: createJSONStorage(() => localStorage), // Use localStorage
        }
    )
);

export default useCacheInvalidationStore;