import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, message, Dropdown } from 'antd';
import { FilePdfFilled, DownOutlined } from '@ant-design/icons';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useRequirementGroupsContext } from '@/contexts/requirement-group-context';
import { useRequirementsContext } from '@/contexts/requirements-context';
import { useReportsContext } from '@/contexts/reports-context';
import { useSectionsContext } from '@/contexts/sections-context';
import { getComplianceColorCode } from '@/utils/formating';
import { RequirementGroupWithSectionId } from '@/hooks/requirement-group-hooks';
import { RequirementWithGroupId } from '@/hooks/requirement-hooks';
import { Section, Report, RegulatoryFramework, RequirementAssessment, Document as WasmDocument } from '@wasm';
import { formatRegulatoryFramework } from '@/utils/helpers';
import { extractAllRequirementAssessments } from '@/utils/report-utils';
import { useDocumentsContext } from '@/contexts/documents-context';
import { useUrlParams } from '@/hooks/url-hooks';

// Add color mapping for regulatory frameworks
const standardMap: Record<string, { label: string; color: { bg: string; text: string } }> = {
    iso13485: { label: 'ISO 13485', color: { bg: '#E6F4FF', text: '#0958D9' } }, // blue
    iso14155: { label: 'ISO 14155', color: { bg: '#F6FFED', text: '#389E0D' } }, // green
    iso14971: { label: 'ISO 14971', color: { bg: '#E6FFFB', text: '#08979C' } }, // cyan
    iec62304: { label: 'IEC 62304', color: { bg: '#F9F0FF', text: '#722ED1' } }, // purple
    iec62366: { label: 'IEC 62366', color: { bg: '#FFF0F6', text: '#EB2F96' } }, // magenta
    iso10993_10: { label: 'ISO 10993-10', color: { bg: '#FFFBE6', text: '#D48806' } }, // gold
};

const getFrameworkColors = (framework: string) => {
    const entry = standardMap[framework] || { label: framework, color: { bg: '#F5F5F5', text: '#666666' } };
    return entry.color;
};

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: '#666666',
    },
    groupTitle: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333333',
    },
    text: {
        fontSize: 12,
        marginBottom: 5,
    },
    table: {
        flexDirection: 'column',
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        minHeight: 30,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F5F5F5',
    },
    tableCol: {
        flex: 1,
        padding: 5,
    },
    complianceScore: {
        width: 80,
    },
    tag: {
        padding: 4,
        borderRadius: 4,
        fontSize: 10,
        backgroundColor: '#E6F4FF',
        color: '#0958D9',
        alignSelf: 'flex-start',
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 20,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    reportTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    frameworkTag: {
        padding: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    frameworkText: {
        fontSize: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 20,
    },
    sectionName: {
        flex: 1,
        fontSize: 14,
    },
    complianceRating: {
        fontSize: 12,
        marginRight: 10,
        color: '#666666',
    },
    compactTag: {
        backgroundColor: '#F5F5F5',
        padding: 3,
        borderRadius: 3,
    },
    compactTagText: {
        fontSize: 8,
        color: '#666666',
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingLeft: 40,
    },
    groupName: {
        flex: 1,
        fontSize: 12,
        color: '#333333',
    },
    groupReference: {
        fontSize: 10,
        marginRight: 10,
    },
    requirementTable: {
        marginLeft: 40,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    requirementRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        minHeight: 40,
        padding: 5,
    },
    requirementHeaderRow: {
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        padding: 5,
    },
    complianceCol: {
        width: 60,
        justifyContent: 'center',
    },
    descriptionCol: {
        flex: 3,
        paddingHorizontal: 5,
        justifyContent: 'center',
    },
    findingsCol: {
        flex: 2,
        paddingHorizontal: 5,
        justifyContent: 'center',
    },
    documentsCol: {
        width: 100,
        paddingHorizontal: 5,
        justifyContent: 'center',
    },
    documentReferenceTable: {
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    documentReferenceRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        minHeight: 30,
        padding: 5,
    },
    documentReferenceHeader: {
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        padding: 5,
        height: 35,
        alignItems: 'center',
    },
    documentIdCol: {
        width: 100,
        paddingHorizontal: 5,
    },
    documentTitleCol: {
        flex: 1,
        paddingHorizontal: 5,
    },
    headerText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333333',
    },
    requirementText: {
        fontSize: 9,
    },
    requirementName: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    requirementDescription: {
        fontSize: 9,
        marginTop: 2,
    },
    bulletPoint: {
        fontSize: 9,
        marginBottom: 2,
        textAlign: 'left',
    },
});

interface PDFDocumentProps {
    sections: Section[];
    requirementGroups: RequirementGroupWithSectionId[];
    requirements: RequirementWithGroupId[];
    reports: Report[];
    documentsList: WasmDocument[];
    processedDocuments: Array<{ number: string; title: string }>;
}

// Create PDF document component
const PDFDocument: React.FC<PDFDocumentProps> = ({
    sections,
    requirementGroups,
    requirements,
    reports,
    documentsList,
    processedDocuments
}) => {
    // Memoize all assessments
    const allAssessments = useMemo(() => {
        console.log('Starting assessment extraction from reports:', reports);
        const assessments = extractAllRequirementAssessments(reports);
        console.log('Extracted assessments:', {
            count: assessments.length,
            assessmentIds: assessments.map(a => a.id),
            firstFewAssessments: assessments.slice(0, 3)
        });
        return assessments;
    }, [reports]);

    const getSectionComplianceRating = (report: Report, sectionId: string) => {
        const sectionAssessment = report.section_assessments.get(sectionId);
        return sectionAssessment?.compliance_rating;
    };

    const getGroupComplianceRating = (report: Report, groupId: string) => {
        let rating: number | undefined;
        report.section_assessments.forEach(section => {
            if (section.sub_assessments) {
                const assessment = section.sub_assessments.get(groupId);
                if (assessment && 'requirement_group_assessment' in assessment) {
                    rating = assessment.requirement_group_assessment.compliance_rating;
                }
            }
        });
        return rating;
    };

    const getSectionReference = (sectionGroups: RequirementGroupWithSectionId[]) => {
        // Get the first group's reference and extract the part before the first dot
        const firstGroupRef = sectionGroups
            .map(group => group.reference || '')
            .sort((a, b) => {
                const aNum = parseFloat(a.split('.')[0]);
                const bNum = parseFloat(b.split('.')[0]);
                return aNum - bNum;
            })[0];

        return firstGroupRef ? firstGroupRef.split('.')[0] : '';
    };

    const sortByReference = <T extends { reference?: string }>(items: T[]): T[] => {
        return [...items].sort((a, b) => {
            const aRef = a.reference || '';
            const bRef = b.reference || '';
            const aNum = aRef.split('.').map(Number);
            const bNum = bRef.split('.').map(Number);

            for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
                const aVal = aNum[i] || 0;
                const bVal = bNum[i] || 0;
                if (aVal !== bVal) return aVal - bVal;
            }
            return 0;
        });
    };

    const renderRequirementTable = (report: Report, groupId: string) => {
        console.log('Rendering requirement table for group:', {
            groupId,
            reportId: report.id
        });

        // Get requirements that belong to this group and have assessments
        const groupRequirements = requirements.filter(req =>
            req.group_id === groupId &&
            allAssessments.some(assessment => assessment.id === req.id)
        );

        console.log('Found requirements for group:', {
            groupId,
            requirementCount: groupRequirements.length,
            requirements: groupRequirements.map(r => ({
                id: r.id,
                name: r.name
            }))
        });

        if (groupRequirements.length === 0) return null;

        return (
            <View style={styles.requirementTable}>
                <View style={styles.requirementHeaderRow}>
                    <View style={styles.complianceCol}>
                        <Text style={styles.headerText}>Rating</Text>
                    </View>
                    <View style={styles.descriptionCol}>
                        <Text style={styles.headerText}>Requirement</Text>
                    </View>
                    <View style={styles.findingsCol}>
                        <Text style={styles.headerText}>Key Findings</Text>
                    </View>
                    <View style={styles.documentsCol}>
                        <Text style={styles.headerText}>Documents</Text>
                    </View>
                </View>
                {groupRequirements.map(requirement => {
                    const assessment = allAssessments.find(a => a.id === requirement.id);
                    console.log('Requirement assessment:', {
                        requirementId: requirement.id,
                        hasAssessment: !!assessment,
                        sources: assessment?.sources,
                        findings: assessment?.negative_findings
                    });

                    const findings = assessment?.negative_findings as string[] | undefined;
                    const sources = assessment?.sources as string[] | undefined;

                    return (
                        <View key={requirement.id} style={styles.requirementRow}>
                            <View style={styles.complianceCol}>
                                <Text style={styles.requirementText}>
                                    {assessment?.compliance_rating ?? 'N/A'}%
                                </Text>
                            </View>
                            <View style={styles.descriptionCol}>
                                <Text style={styles.requirementName}>
                                    {requirement.name}
                                </Text>
                                {requirement.description && (
                                    <Text style={styles.requirementDescription}>
                                        {requirement.description}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.findingsCol}>
                                <View style={{ justifyContent: 'center' }}>
                                    {findings?.map((finding, index) => (
                                        <Text key={index} style={styles.bulletPoint}>
                                            • {finding}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.documentsCol}>
                                <View style={{ justifyContent: 'center' }}>
                                    <Text style={styles.requirementText}>
                                        {sources?.map(source => {
                                            console.log('Processing source in row:', {
                                                source,
                                                type: typeof source
                                            });
                                            const doc = documentsList.find(d => d.number.toString() === source);
                                            console.log('Found document:', {
                                                source,
                                                found: !!doc,
                                                title: doc?.meta.title
                                            });
                                            return doc?.meta.title || source;
                                        }).join(', ')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {reports.map(report => (
                    <View key={report.id}>
                        {/* Report Header with Framework Tag */}
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>{report.title}</Text>
                            <View style={[
                                styles.frameworkTag,
                                { backgroundColor: getFrameworkColors(report.regulatory_framework).bg }
                            ]}>
                                <Text style={[
                                    styles.frameworkText,
                                    { color: getFrameworkColors(report.regulatory_framework).text }
                                ]}>
                                    {formatRegulatoryFramework(report.regulatory_framework)}
                                </Text>
                            </View>
                        </View>

                        {/* Sections and their groups */}
                        {Array.from(report.section_assessments.keys()).map(sectionId => {
                            const section = sections.find(s => s.id === sectionId);
                            if (!section) return null;

                            const complianceRating = getSectionComplianceRating(report, sectionId);
                            const frameworkColors = getFrameworkColors(section.regulatory_framework);

                            // Get groups for this section that are in the report
                            const sectionGroups = requirementGroups
                                .filter(group => group.section_id === sectionId)
                                .filter(group => {
                                    const assessment = Array.from(report.section_assessments.values())
                                        .find(section => section.sub_assessments?.has(group.id));
                                    return assessment !== undefined;
                                });

                            const sectionRef = getSectionReference(sectionGroups);
                            const sortedGroups = sortByReference(sectionGroups);

                            return (
                                <View key={sectionId}>
                                    {/* Section Row */}
                                    <View style={styles.sectionRow}>
                                        <Text style={styles.sectionName}>{section.name}</Text>
                                        {complianceRating !== undefined && (
                                            <Text style={styles.complianceRating}>
                                                {complianceRating}%
                                            </Text>
                                        )}
                                        <View style={[
                                            styles.compactTag,
                                            { backgroundColor: frameworkColors.bg }
                                        ]}>
                                            <Text style={[
                                                styles.compactTagText,
                                                { color: frameworkColors.text }
                                            ]}>
                                                {`${formatRegulatoryFramework(section.regulatory_framework)}${sectionRef ? ` - ${sectionRef}` : ''}`}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Requirement Groups */}
                                    {sortedGroups.map(group => {
                                        const groupComplianceRating = getGroupComplianceRating(report, group.id);
                                        return (
                                            <View key={group.id}>
                                                <View style={styles.groupRow}>
                                                    <Text style={styles.groupName}>{group.name}</Text>
                                                    {group.reference && (
                                                        <Text style={[
                                                            styles.groupReference,
                                                            { color: frameworkColors.text }
                                                        ]}>
                                                            {group.reference}
                                                        </Text>
                                                    )}
                                                    {groupComplianceRating !== undefined && (
                                                        <Text style={styles.complianceRating}>
                                                            {groupComplianceRating}%
                                                        </Text>
                                                    )}
                                                </View>
                                                {renderRequirementTable(report, group.id)}
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        }).sort((a, b) => {
                            if (!a || !b) return 0;
                            const aGroups = requirementGroups.filter(g => g.section_id === a.key);
                            const bGroups = requirementGroups.filter(g => g.section_id === b.key);
                            const aRef = getSectionReference(aGroups);
                            const bRef = getSectionReference(bGroups);
                            return parseFloat(aRef) - parseFloat(bRef);
                        })}
                    </View>
                ))}

                {/* Document Reference Table */}
                <View style={styles.documentReferenceTable}>
                    <View style={styles.documentReferenceHeader}>
                        <View style={styles.documentIdCol}>
                            <Text style={styles.headerText}>Document Number</Text>
                        </View>
                        <View style={styles.documentTitleCol}>
                            <Text style={styles.headerText}>Document Title</Text>
                        </View>
                    </View>
                    {(() => {
                        console.log('Rendering document table with:', processedDocuments);
                        return processedDocuments.map((doc, index) => {
                            console.log('Rendering document row:', doc);
                            return (
                                <View key={index} style={styles.documentReferenceRow}>
                                    <View style={styles.documentIdCol}>
                                        <Text style={styles.requirementText}>{doc.number}</Text>
                                    </View>
                                    <View style={styles.documentTitleCol}>
                                        <Text style={styles.requirementText}>{doc.title}</Text>
                                    </View>
                                </View>
                            );
                        });
                    })()}
                </View>
            </Page>
        </Document>
    );
};

interface DownloadPDFButtonProps {
    selectedSections: Set<string>;
    selectedGroupId?: string;
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ selectedSections, selectedGroupId }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPendingGeneration, setPendingGeneration] = useState(false);
    const { filteredSelectedRequirementGroups } = useRequirementGroupsContext();
    const { filteredSelectedRequirements } = useRequirementsContext();
    const { filteredSelectedReports } = useReportsContext();
    const { filteredSelectedReportsSections } = useSectionsContext();
    const { documents } = useDocumentsContext();
    const { params, setParams } = useUrlParams();

    // Filter sections and groups based on selection
    const filteredSections = useMemo(() => {
        if (!selectedSections.size) return filteredSelectedReportsSections;
        return filteredSelectedReportsSections.filter(section => selectedSections.has(section.id));
    }, [filteredSelectedReportsSections, selectedSections]);

    const filteredGroups = useMemo(() => {
        let groups = filteredSelectedRequirementGroups as RequirementGroupWithSectionId[];

        // Filter by selected sections
        if (selectedSections.size) {
            groups = groups.filter(group => selectedSections.has(group.section_id));
        }

        // Filter by selected group if any
        if (selectedGroupId) {
            groups = groups.filter(group => group.id === selectedGroupId);
        }

        return groups;
    }, [filteredSelectedRequirementGroups, selectedSections, selectedGroupId]);

    const filteredRequirements = useMemo(() => {
        const groupIds = new Set(filteredGroups.map(g => g.id));
        return (filteredSelectedRequirements as RequirementWithGroupId[])
            .filter(req => groupIds.has(req.group_id));
    }, [filteredSelectedRequirements, filteredGroups]);

    // Filter reports to only include those that have sections in our selection
    const filteredReports = useMemo(() => {
        if (!selectedSections.size) return filteredSelectedReports;

        return filteredSelectedReports.filter(report => {
            // Get all section IDs from this report
            const reportSectionIds = Array.from(report.section_assessments.keys());
            // Check if any of these sections are in our selected sections
            return reportSectionIds.some(sectionId => selectedSections.has(sectionId));
        });
    }, [filteredSelectedReports, selectedSections]);

    const processDocuments = (downloadHighlighted: boolean) => {
        const reportsToUse = downloadHighlighted ? filteredReports : filteredSelectedReports;
        const requirementsToUse = downloadHighlighted ? filteredRequirements : filteredSelectedRequirements;

        if (!reportsToUse || !documents) {
            console.log('No reports or documents available');
            return [];
        }

        // Track state at each step
        let state = {
            initialDocuments: documents?.length || 0,
            validAssessments: 0,
            assessmentsWithSources: 0,
            sourcesFound: 0,
            validSources: 0
        };

        console.log('Starting document processing...');
        console.log('Initial state:', state);

        // Get all assessments
        const allAssessments = extractAllRequirementAssessments(reportsToUse);

        // Filter assessments to only include those for our filtered requirements
        const filteredAssessments = allAssessments.filter(assessment => {
            return requirementsToUse.some(req => req.id === assessment.id);
        });

        console.log('Extracted assessments:', {
            totalCount: allAssessments.length,
            filteredCount: filteredAssessments.length,
            assessmentIds: filteredAssessments.map(a => a.id)
        });

        const documentSet = new Set<string>();

        // Collect all sources from assessments
        filteredAssessments.forEach(assessment => {
            state.validAssessments++;

            console.log('Processing assessment:', {
                id: assessment.id,
                hasSources: !!assessment.sources,
                sourceType: assessment.sources ? typeof assessment.sources : 'undefined',
                isIterable: assessment.sources ? Symbol.iterator in Object(assessment.sources) : false
            });

            if (assessment.sources) {
                state.assessmentsWithSources++;
                try {
                    const sources = Array.from(assessment.sources);
                    console.log('Sources from assessment:', {
                        assessmentId: assessment.id,
                        sourcesCount: sources.length,
                        sources: sources
                    });

                    sources.forEach(source => {
                        state.sourcesFound++;
                        if (source) {
                            state.validSources++;
                            console.log('Adding valid source:', {
                                source,
                                type: typeof source
                            });
                            documentSet.add(String(source));
                        }
                    });
                } catch (error) {
                    console.error('Error processing sources for assessment:', {
                        assessmentId: assessment.id,
                        error: error
                    });
                }
            }
        });

        console.log('Document collection state:', state);
        console.log('Unique documents found:', Array.from(documentSet));

        // Document mapping process
        console.log('Starting document mapping process...');
        console.log('Available documents:', {
            count: documents?.length || 0,
            sample: documents?.slice(0, 3).map(d => ({
                number: d.number,
                title: d.meta.title
            }))
        });

        const sortedDocuments = Array.from(documentSet).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        let mappingStats = {
            totalToMap: sortedDocuments.length,
            successfullyMapped: 0,
            failedToMap: 0
        };

        const result = sortedDocuments.map(docNumber => {
            const doc = documents.find(d => String(d.number) === docNumber);
            if (doc) {
                mappingStats.successfullyMapped++;
            } else {
                mappingStats.failedToMap++;
            }

            const title = doc?.meta.title || `Document ${docNumber}`;
            console.log(`Mapping document ${docNumber}:`, {
                found: !!doc,
                doc: doc ? { number: doc.number, title: doc.meta.title } : 'not found',
                finalTitle: title
            });

            return {
                number: docNumber,
                title: title
            };
        });

        console.log('Document mapping stats:', mappingStats);
        console.log('Final document mapping result:', {
            count: result.length,
            documents: result
        });

        return result;
    };

    // Effect to handle delayed PDF generation after search query is cleared
    useEffect(() => {
        const generatePendingPDF = async () => {
            if (!isPendingGeneration || params.searchQuery) return;

            try {
                const processedDocs = processDocuments(false);
                console.log('Starting PDF generation with processed documents:', processedDocs);

                const blob = await pdf(
                    <PDFDocument
                        sections={filteredSelectedReportsSections}
                        requirementGroups={filteredSelectedRequirementGroups as RequirementGroupWithSectionId[]}
                        requirements={filteredSelectedRequirements as RequirementWithGroupId[]}
                        reports={filteredSelectedReports}
                        documentsList={documents}
                        processedDocuments={processedDocs}
                    />
                ).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'compliance-report.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error generating PDF:', error);
                message.error('Failed to generate PDF. Please try again.');
            } finally {
                setIsGenerating(false);
                setPendingGeneration(false);
            }
        };

        generatePendingPDF();
    }, [
        isPendingGeneration,
        params.searchQuery,
        filteredSelectedReportsSections,
        filteredSelectedRequirementGroups,
        filteredSelectedRequirements,
        filteredSelectedReports,
        documents
    ]);

    const generatePDF = async (downloadHighlighted: boolean) => {
        try {
            if (!downloadHighlighted && params.searchQuery) {
                setPendingGeneration(true);
                setParams({ searchQuery: "" });
                return;
            }

            // For highlighted content or when no search query needs clearing
            const processedDocs = processDocuments(downloadHighlighted);
            console.log('Starting PDF generation with processed documents:', processedDocs);

            const blob = await pdf(
                <PDFDocument
                    sections={downloadHighlighted ? filteredSections : filteredSelectedReportsSections}
                    requirementGroups={downloadHighlighted ? filteredGroups : (filteredSelectedRequirementGroups as RequirementGroupWithSectionId[])}
                    requirements={downloadHighlighted ? filteredRequirements : (filteredSelectedRequirements as RequirementWithGroupId[])}
                    reports={downloadHighlighted ? filteredReports : filteredSelectedReports}
                    documentsList={documents}
                    processedDocuments={processedDocs}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'compliance-report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error('Failed to generate PDF. Please try again.');
        } finally {
            if (!isPendingGeneration) {
                setIsGenerating(false);
            }
        }
    };

    const items = [
        {
            key: 'all',
            label: <div className="text-xs">Download All</div>,
            onClick: () => {
                setIsGenerating(true);
                generatePDF(false);
            }
        },
        {
            key: 'highlighted',
            label: <div className="text-xs">Download Highlighted</div>,
            onClick: () => {
                setIsGenerating(true);
                generatePDF(true);
            }
        }
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']}>
            <Button
                size="small"
                className="text-xs"
                icon={<FilePdfFilled style={{ color: '#F40F02' }} />}
                loading={isGenerating}
            >
                {isGenerating ? 'Generating...' : 'Download PDF'} <DownOutlined />
            </Button>
        </Dropdown>
    );
};

export default DownloadPDFButton; 