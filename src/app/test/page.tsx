'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Navigation from '@/components/test/navigation';
import MainContent from '@/components/test/main-content';
import ToolBar from '@/components/test/tool-bar';

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
      <div className="p-4">
        <div className="mb-4">
          <ToolBar />
        </div>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} minSize={20}>
            <Navigation selectedSections={selectedSections} onSectionSelect={handleSectionSelect} />
          </Panel>
          <PanelResizeHandle className="w-1 hover:bg-gray-300 transition-colors" />
          <Panel defaultSize={75} minSize={30}>
            <MainContent selectedSections={selectedSections} selectedGroupId={selectedGroupId} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Page;
