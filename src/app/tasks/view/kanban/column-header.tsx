import React from 'react';
import { Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface ColumnHeaderProps {
    title: string;
    cardsCount: number;
    removeColumn: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ title, cardsCount, removeColumn }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px' }}>
        <Typography.Text>
            {title} ({cardsCount})
        </Typography.Text>
        <Button type="text" icon={<CloseOutlined />} onClick={removeColumn} />
    </div>
);

export default ColumnHeader;
