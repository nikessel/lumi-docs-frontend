import React from 'react';
import { Table } from 'antd';
import RequirementGroupRow from './requirement-group-row';
import { SectionAssessment, RequirementAssessment } from '@wasm';

interface SectionRowProps {
    sectionAssessments: Map<string, SectionAssessment>;
    onRequirementClick: (requirement: RequirementAssessment) => void;
}

const SectionRow: React.FC<SectionRowProps> = ({ sectionAssessments, onRequirementClick }) => {
    const data = Array.from(sectionAssessments.entries()).map(([key, value]) => ({
        id: key,
        ...value,
    }));

    return (
        <Table
            dataSource={data}
            rowKey={(record) => record.id}
            pagination={false}
            expandable={{
                expandedRowRender: (record) => (
                    <RequirementGroupRow
                        group={record.requirement_assessments}
                        onRequirementClick={onRequirementClick}
                    />
                ),
            }}
            columns={[
                {
                    title: 'Title',
                    dataIndex: 'abstract_text',
                    key: 'abstract_text',
                },
                {
                    title: 'Compliance Rating',
                    dataIndex: 'compliance_rating',
                    key: 'compliance_rating',
                },
            ]}
        />
    );
};

export default SectionRow;
