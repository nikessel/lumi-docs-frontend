'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import { VerticalAlignMiddleOutlined } from '@ant-design/icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navigation from '@/components/reports/report-view/navigation';
import MainContent from '@/components/reports/report-view/main-content';
import ToolBar from '@/components/reports/report-view/tool-bar';
import { useReportsContext } from '@/contexts/reports-context';
import { Alert } from 'antd';
import { extractProgress } from '@/utils/report-utils';

const Page = () => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const { filteredSelectedReports } = useReportsContext();

  const handleSectionSelect = (sections: Set<string>, groupId?: string) => {
    setSelectedSections(sections);
    setSelectedGroupId(groupId);
  };

  const processingReport = filteredSelectedReports.find(report => report.status === "processing");
  const progress = processingReport ? extractProgress(processingReport.title) : undefined;

  return (
    <div className="h-screen">
      <div className="">
        {!processingReport && (
          <div className="mb-4">
            <Alert
              message={`A report has only partially finished processing. Assessments will gradually be updated. ${progress ? `Progress: ${progress}%` : ""}`}
              type="info"
              closable
            />
          </div>
        )}
        <div className="mb-4">
          <ToolBar
            selectedSections={selectedSections}
            selectedGroupId={selectedGroupId}
          />
        </div>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} minSize={20}>
            <Navigation selectedSections={selectedSections} onSectionSelect={handleSectionSelect} />
          </Panel>
          <PanelResizeHandle className="w-1 hover:bg-gray-300 transition-colors flex justify-center  ">
            <div className="w-4 h-8 flex hover:bg-gray-200 rounded">
              <VerticalAlignMiddleOutlined rotate={90} className="text-gray-400" />
            </div>
          </PanelResizeHandle>
          <Panel defaultSize={75} minSize={30}>
            <MainContent selectedSections={selectedSections} selectedGroupId={selectedGroupId} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Page;
