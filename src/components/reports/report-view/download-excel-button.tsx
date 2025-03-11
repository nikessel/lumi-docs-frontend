import React, { useState, useMemo } from 'react';
import { Button, message } from 'antd';
import { FileExcelFilled } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { useDocumentsContext } from '@/contexts/documents-context';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';
import { formatRegulatoryFramework } from '@/utils/helpers';
import { extractAllRequirementAssessments } from '@/utils/report-utils';

const DownloadExcelButton: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { filteredSelectedRequirementGroups } = useRequirementGroupsContext();
    const { filteredSelectedRequirements } = useRequirementsContext();
    const { filteredSelectedReports } = useReportsContext();
    const { filteredSelectedReportsSections } = useSectionsContext();
    const { documents } = useDocumentsContext();

    const processDocuments = useMemo(() => {
        if (!filteredSelectedReports || !documents) {
            return [];
        }

        const allAssessments = extractAllRequirementAssessments(filteredSelectedReports);
        const documentSet = new Set<string>();

        allAssessments.forEach(assessment => {
            if (assessment.sources) {
                try {
                    const sources = Array.from(assessment.sources);
                    sources.forEach(source => {
                        if (source) {
                            documentSet.add(String(source));
                        }
                    });
                } catch (error) {
                    console.error('Error processing sources for assessment:', error);
                }
            }
        });

        const sortedDocuments = Array.from(documentSet).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        return sortedDocuments.map(docNumber => {
            const doc = documents.find(d => String(d.number) === docNumber);
            return {
                number: docNumber,
                title: doc?.meta.title || `Document ${docNumber}`
            };
        });
    }, [filteredSelectedReports, documents]);

    const generateExcel = async () => {
        try {
            setIsGenerating(true);

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Process reports data
            const reportsData = filteredSelectedReports.map(report => {
                const reportRows: any[] = [];
                const allAssessments = extractAllRequirementAssessments([report]);

                Array.from(report.section_assessments.keys()).forEach(sectionId => {
                    const section = filteredSelectedReportsSections.find(s => s.id === sectionId);
                    if (!section) return;

                    const sectionGroups = (filteredSelectedRequirementGroups as RequirementGroupWithSectionId[])
                        .filter(group => group.section_id === sectionId);

                    sectionGroups.forEach(group => {
                        const groupRequirements = (filteredSelectedRequirements as RequirementWithGroupId[])
                            .filter(req => req.group_id === group.id);

                        groupRequirements.forEach(requirement => {
                            const assessment = allAssessments.find(a => a.id === requirement.id);
                            if (!assessment) return;

                            reportRows.push({
                                'Report Title': report.title,
                                'Standard': formatRegulatoryFramework(report.regulatory_framework),
                                'Section': section.name,
                                'Section Compliance': report.section_assessments.get(sectionId)?.compliance_rating + '%',
                                'Group': group.name,
                                'Group Reference': group.reference || '',
                                'Requirement': requirement.name,
                                'Requirement Description': requirement.description || '',
                                'Compliance Rating': assessment.compliance_rating + '%',
                                'Findings': Array.isArray(assessment.negative_findings)
                                    ? (assessment.negative_findings as (string | number)[]).map(String).join('; ')
                                    : '',
                                'Documents': Array.isArray(assessment.sources)
                                    ? (assessment.sources as (string | number)[]).map(source => {
                                        const doc = documents.find(d => String(d.number) === String(source));
                                        return doc?.meta.title || String(source);
                                    }).join('; ')
                                    : ''
                            });
                        });
                    });
                });

                return reportRows;
            }).flat();

            // Create main report worksheet
            const ws = XLSX.utils.json_to_sheet(reportsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Compliance Report');

            // Create documents reference worksheet
            const documentsData = processDocuments.map(doc => ({
                'Document Number': doc.number,
                'Document Title': doc.title
            }));
            const documentsWs = XLSX.utils.json_to_sheet(documentsData);
            XLSX.utils.book_append_sheet(wb, documentsWs, 'Document References');

            // Generate Excel file
            XLSX.writeFile(wb, 'compliance-report.xlsx');
            message.success('Excel file generated successfully');
        } catch (error) {
            console.error('Error generating Excel:', error);
            message.error('Failed to generate Excel file. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            size="small"
            className="text-xs"
            icon={<FileExcelFilled style={{ color: '#1D6F42' }} />}
            onClick={generateExcel}
            loading={isGenerating}
        >
            {isGenerating ? 'Generating...' : 'Download Excel'}
        </Button>
    );
};

export default DownloadExcelButton; 