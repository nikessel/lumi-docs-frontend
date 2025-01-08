import React from 'react';
import { Table } from 'antd';
import { RequirementAssessment } from '@wasm';

interface RequirementRowProps {
    requirement: RequirementAssessment;
    onRequirementClick: (requirement: RequirementAssessment) => void;
}

const RequirementRow: React.FC<RequirementRowProps> = ({ requirement, onRequirementClick }) => {
    const data = [requirement];

    return (
        <Table
            dataSource={data}
            rowKey={(record) => record.applicability_rating.toString()}
            pagination={false}
            columns={[
                {
                    title: 'Title',
                    dataIndex: 'objective_research_summary',
                    key: 'objective_research_summary',
                },
                {
                    title: 'Compliance Rating',
                    dataIndex: 'compliance_rating',
                    key: 'compliance_rating',
                },
                {
                    title: 'Details',
                    dataIndex: 'details',
                    key: 'details',
                },
                {
                    title: '',
                    render: (_, record) => (
                        <a onClick={() => onRequirementClick(record)}>View Details</a>
                    ),
                },
            ]}
        />
    );
};

export default RequirementRow;
