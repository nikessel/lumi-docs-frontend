import React from 'react';
import { Button } from 'antd';
import { addKanbanColumn } from '@/utils/kanban-utils';
import { useWasm } from '@/components/WasmProvider';
import { TaskStatus } from '@wasm';
import Typography from '@/components/typography';

interface DefaultSetupComponentProps {
    onCustomSetup: () => void;
    onDefaultSetup: () => void;
}

const DefaultSetupComponent: React.FC<DefaultSetupComponentProps> = ({
    onCustomSetup,
    onDefaultSetup,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
            }}
        >
            <Typography textSize="h4" className="mb-4">
                No columns available
            </Typography>
            <Typography color='secondary' className="mb-4">
                You do not have any columns setup for your kanban board. Please select an option below.
            </Typography>
            <div style={{ display: 'flex', gap: '16px' }}>
                <Button type="primary" onClick={onDefaultSetup}>
                    Create Default Setup
                </Button>
                <Button onClick={onCustomSetup}>Create Custom Setup</Button>
            </div>
        </div>
    );
};

export default DefaultSetupComponent;
