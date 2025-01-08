import React from 'react';
import { Table } from 'antd';
import RequirementRow from './requirement-row';
import { RequirementOrRequirementGroupAssessment, RequirementAssessment } from '@wasm';

interface RequirementGroupRowProps {
    group: Map<string, RequirementOrRequirementGroupAssessment> | undefined;
    onRequirementClick: (requirement: RequirementAssessment) => void;
}

const RequirementGroupRow: React.FC<RequirementGroupRowProps> = ({ group, onRequirementClick }) => {
    if (!group) return null;

    const data = Array.from(group.entries()).map(([key, value]) => ({
        id: key,
        ...value,
    }));

    return (
        <Table
            dataSource={data}
            rowKey={(record) => record.id}
            pagination={false}
            expandable={{
                expandedRowRender: (record) => {
                    if ('requirement' in record) {
                        return (
                            <RequirementRow
                                requirement={record.requirement}
                                onRequirementClick={onRequirementClick}
                            />
                        );
                    }
                    return null;
                },
            }}
            columns={[
                {
                    title: 'Requirement Group Title',
                    dataIndex: 'summary',
                    key: 'summary',
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

export default RequirementGroupRow;
