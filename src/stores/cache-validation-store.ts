import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CacheInvalidationState {
    staleIds: string[];
    staleReportIds: string[];
    staleFileIds: string[];
    staleTaskIds: string[];

    addStaleId: (id: string) => void;
    removeStaleIds: (ids: string[]) => void;

    addStaleReportId: (id: string) => void;
    removeStaleReportIds: (ids: string[]) => void;

    addStaleFileId: (id: string) => void;
    removeStaleFileIds: (ids: string[]) => void;
    clearStaleFileIds: () => void;

    addStaleTaskId: (id: string) => void;
    removeStaleTaskIds: (ids: string[]) => void;
    clearStaleTaskIds: () => void;

    lastUpdated: Record<string, number | null>;
    triggerUpdate: (storeName: string, updateComplete?: boolean) => void;

    beingRefetched: Record<string, boolean>;
    setBeingRefetched: (storeName: string, status: boolean) => void;
    resetState: () => void;
}

const useCacheInvalidationStore = create<CacheInvalidationState>()(
    persist(
        (set) => ({
            staleIds: [],
            staleReportIds: [],
            staleFileIds: [],
            staleTaskIds: [],

            // ✅ Add Stale IDs
            addStaleId: (id: string) =>
                set((state) => ({
                    staleIds: state.staleIds.includes(id) ? state.staleIds : [...state.staleIds, id],
                })),

            addStaleTaskId: (id: string) =>
                set((state) => ({
                    staleTaskIds: state.staleTaskIds.includes(id) ? state.staleTaskIds : [...state.staleTaskIds, id],
                })),

            addStaleReportId: (id: string) =>
                set((state) => ({
                    staleReportIds: state.staleReportIds.includes(id) ? state.staleReportIds : [...state.staleReportIds, id],
                })),

            addStaleFileId: (id: string) =>
                set((state) => ({
                    staleFileIds: state.staleFileIds.includes(id) ? state.staleFileIds : [...state.staleFileIds, id],
                })),

            // ✅ Remove Stale IDs
            removeStaleIds: (ids: string[]) =>
                set((state) => ({
                    staleIds: state.staleIds.filter((staleId) => !ids.includes(staleId)),
                })),

            removeStaleTaskIds: (ids: string[]) =>
                set((state) => ({
                    staleTaskIds: state.staleTaskIds.filter((staleId) => !ids.includes(staleId)),
                })),

            removeStaleReportIds: (ids: string[]) =>
                set((state) => ({
                    staleReportIds: state.staleReportIds.filter((staleId) => !ids.includes(staleId)),
                })),

            removeStaleFileIds: (ids: string[]) =>
                set((state) => ({
                    staleFileIds: state.staleFileIds.filter((staleId) => !ids.includes(staleId)),
                })),

            // ✅ Clear Stale IDs
            clearStaleFileIds: () => set(() => ({ staleFileIds: [] })),
            clearStaleTaskIds: () => set(() => ({ staleTaskIds: [] })),

            // ✅ Cache update triggers
            lastUpdated: {}, // Tracks the last update timestamp for each store

            triggerUpdate: (storeName, setToNull) =>
                set((state) => ({
                    lastUpdated: {
                        ...state.lastUpdated,
                        [storeName]: setToNull ? null : Date.now(),
                    },
                })),

            // ✅ Refetch status tracking
            beingRefetched: {}, // Tracks if a specific store is being refetched

            setBeingRefetched: (storeName: string, status: boolean) =>
                set((state) => ({
                    beingRefetched: {
                        ...state.beingRefetched,
                        [storeName]: status,
                    },
                })),

            // ✅ Reset state
            resetState: () =>
                set(() => ({
                    staleIds: [],
                    staleReportIds: [],
                    staleFileIds: [],
                    staleTaskIds: [],
                    lastUpdated: {},
                    beingRefetched: {},
                })),
        }),
        {
            name: 'cache-invalidation-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCacheInvalidationStore;
