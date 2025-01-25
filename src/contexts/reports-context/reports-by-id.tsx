// import React, { createContext, useContext, ReactNode } from "react";
// import { useReportsByIds } from "@/hooks/report-hooks";
// import { Report } from "@wasm";

// interface ReportsByIdsContextType {
//     reports: Report[];
//     loading: boolean;
//     error: string | null;
// }

// const ReportsByIdsContext = createContext<ReportsByIdsContextType | undefined>(undefined);

// export const ReportsByIdsProvider: React.FC<{ children: ReactNode; reportIds: string[] }> = ({ children, reportIds }) => {
//     const { reports, loading, error } = useReportsByIds(reportIds);

//     return (
//         <ReportsByIdsContext.Provider value={{ reports, loading, error }}>
//             {children}
//         </ReportsByIdsContext.Provider>
//     );
// };

// export const useReportsByIdsContext = () => {
//     const context = useContext(ReportsByIdsContext);
//     if (!context) {
//         throw new Error("useReportsByIdsContext must be used within a ReportsByIdsProvider");
//     }
//     return context;
// };
