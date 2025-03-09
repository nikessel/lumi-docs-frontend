import React from 'react';
import { Select } from 'antd';
import { useStyle, FontSize } from '@/contexts/style-context';
import { FontSizeOutlined } from '@ant-design/icons';

const FontSizeSelector: React.FC = () => {
    const { fontSize, setFontSize } = useStyle();

    return (
        <Select
            value={fontSize}
            onChange={(value: FontSize) => setFontSize(value)}
            size="small"
            style={{ width: '100%' }}
            options={[
                { value: 'xs', label: 'Small' },
                { value: 'normal', label: 'Normal' },
                { value: 'large', label: 'Large' },
            ]}
            prefix={<FontSizeOutlined />}
            className="[&_.ant-select-selector]:!h-6 text-xs"
        />
    );
};

export default FontSizeSelector; 