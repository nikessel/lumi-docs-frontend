'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import Navigation from '@/components/test/navigation';
import MainContent from '@/components/test/main-content';
import ToolBar from '@/components/test/tool-bar';

const { Content } = Layout;

const Page = () => {
  const { filteredSelectedReports, loading: reportsLoading } = useReportsContext();
  const { filteredSelectedReportsSections, loading: sectionsLoading } = useSectionsContext();
  const { filteredSelectedRequirements, loading: requirementsLoading } = useRequirementsContext();
  const { filteredSelectedRequirementGroups, loading: groupsLoading } = useRequirementGroupsContext();
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  const isLoading = reportsLoading || sectionsLoading || requirementsLoading || groupsLoading;

  return (
    <div className="h-full">
      {/* Top Toolbar - Spans full width */}
      <div className="h-16 bg-white border-b px-4 flex items-center justify-between w-full">
        <ToolBar />
      </div>

      {/* Resizable Panels */}
      <div className="h-[calc(100vh-4rem)]">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Navigation Panel */}
          <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-white border-r">
            <Navigation selectedSections={selectedSections} onSectionSelect={setSelectedSections} />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-0.2 bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* Main Content Panel */}
          <Panel defaultSize={80} className="bg-white">
            <MainContent selectedSections={selectedSections} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Page;
