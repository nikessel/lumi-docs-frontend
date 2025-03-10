'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import { VerticalAlignMiddleOutlined } from '@ant-design/icons';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navigation from '@/components/report-view/navigation';
import MainContent from '@/components/report-view/main-content';
import ToolBar from '@/components/report-view/tool-bar';

const { Content } = Layout;

const Page = () => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();

  const handleSectionSelect = (sections: Set<string>, groupId?: string) => {
    setSelectedSections(sections);
    setSelectedGroupId(groupId);
  };

  return (
    <div className="h-screen">
      <div className="">
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
