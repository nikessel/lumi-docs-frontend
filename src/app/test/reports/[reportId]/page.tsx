"use client";

import ReportViewer from "@/components/test/ReportViewer";
import WasmProvider from "@/components/WasmProvider";
import type { FC } from 'react';

const ReportPage: FC = () => {
  return (
    <WasmProvider>
      <ReportViewer />
    </WasmProvider>
  );
};

export default ReportPage;
