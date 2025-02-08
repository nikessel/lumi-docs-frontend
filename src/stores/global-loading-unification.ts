// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';

// interface LoadingState {
//     loadingComponents: string[]; // List of components currently loading
//     addLoadingComponent: (component: string) => void; // Add a component to the loading list
//     removeLoadingComponent: (component: string) => void; // Remove a component from the loading list
//     isLoading: () => boolean; // Check if any components are loading
//     resetLoadingState: () => void; // Reset the loading state
// }

// const useLoadingStore = create<LoadingState>()(
//     persist(
//         (set, get) => ({
//             loadingComponents: [],

//             // Add a component to the loading array
//             addLoadingComponent: (component: string) =>
//                 set((state) => ({
//                     loadingComponents: state.loadingComponents.includes(component)
//                         ? state.loadingComponents // Avoid duplicates
//                         : [...state.loadingComponents, component],
//                 })),

//             // Remove a component from the loading array
//             removeLoadingComponent: (component: string) =>
//                 set((state) => ({
//                     loadingComponents: state.loadingComponents.filter(
//                         (comp) => comp !== component
//                     ),
//                 })),

//             // Check if any components are loading
//             isLoading: () => get().loadingComponents.length > 0,

//             // Reset the loading state
//             resetLoadingState: () => set(() => ({ loadingComponents: [] })),
//         }),
//         {
//             name: 'loading-store', // Key for storage
//             storage: createJSONStorage(() => localStorage), // Use localStorage
//         }
//     )
// );

// export default useLoadingStore;
