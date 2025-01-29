import React from 'react';
import { Button, Input, Select, Tooltip } from 'antd';
import Typography from '@/components/typography';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { TaskStatus } from '@wasm';

interface AddColumnSectionProps {
    newColumnName: string;
    setNewColumnName: (value: string) => void;
    selectedStatus: TaskStatus | null;
    setSelectedStatus: (value: TaskStatus | null) => void;
    handleAddColumn: () => void;
}

const AddColumnSection: React.FC<AddColumnSectionProps> = ({
    newColumnName,
    setNewColumnName,
    selectedStatus,
    setSelectedStatus,
    handleAddColumn,
}) => {
    return (
        <div style={{ padding: '16px', width: '250px' }}>
            <Typography className="mb-4" textSize="h6">
                Add New Column
            </Typography>
            <Typography className="mb-1" textSize="small" color="secondary">
                Column Name
            </Typography>
            <Input
                placeholder="Enter Column Name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                style={{ marginBottom: '8px' }}
            />
            <Typography className="mt-2 mb-1 flex items-center" textSize="small" color="secondary">
                Associated Task Status
                <Tooltip title="Tasks moved to this column will automatically be assigned the selected status.">
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: '#888' }} />
                </Tooltip>
            </Typography>
            <Select
                placeholder="Select Task Status"
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value as TaskStatus)}
                style={{ width: '100%', marginBottom: '16px' }}
            >
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="ignored">Ignored</Select.Option>
                <Select.Option value="open">Open</Select.Option>
            </Select>
            <Button type="primary" onClick={handleAddColumn}>
                Add Column
            </Button>
        </div>
    );
};

export default AddColumnSection;
