// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// interface GlobalActionsState {
//     archiving_ids: string[];
//     restoring_ids: string[];

//     setArchivingIds: (ids: string[]) => void;
//     setRestoringIds: (ids: string[]) => void;

//     addArchivingId: (id: string) => void;
//     addRestoringId: (id: string) => void;

//     removeArchivingId: (id: string) => void;
//     removeRestoringId: (id: string) => void;

//     resetState: () => void

// }

// export const useGlobalActionsStore = create<GlobalActionsState>()(
//     persist(
//         (set, get) => ({
//             // Initial state
//             archiving_ids: [],
//             restoring_ids: [],

//             // Setters
//             setArchivingIds: (ids) =>
//                 set(() => ({
//                     archiving_ids: ids,
//                 })),
//             setRestoringIds: (ids) =>
//                 set(() => ({
//                     restoring_ids: ids,
//                 })),

//             // Add single ID
//             addArchivingId: (id) =>
//                 set((state) => ({
//                     archiving_ids: [...new Set([...state.archiving_ids, id])], // Avoid duplicates
//                 })),
//             addRestoringId: (id) =>
//                 set((state) => ({
//                     restoring_ids: [...new Set([...state.restoring_ids, id])], // Avoid duplicates
//                 })),

//             // Remove single ID
//             removeArchivingId: (id) =>
//                 set((state) => ({
//                     archiving_ids: state.archiving_ids.filter((archivingId) => archivingId !== id),
//                 })),
//             removeRestoringId: (id) =>
//                 set((state) => ({
//                     restoring_ids: state.restoring_ids.filter((restoringId) => restoringId !== id),
//                 })),

//             resetState: () => set(() => ({ archiving_ids: [], restoring_ids: [], })),


//         }),
//         {
//             name: "global-actions-store", // Key for localStorage
//             storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
//         }
//     )
// );
