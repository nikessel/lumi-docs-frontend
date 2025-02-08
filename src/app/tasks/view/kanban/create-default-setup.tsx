import React from 'react';
import { Button } from 'antd';
import Typography from '@/components/typography';

interface DefaultSetupComponentProps {
    onDefaultSetup: () => void;
}

const DefaultSetupComponent: React.FC<DefaultSetupComponentProps> = ({
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
                You do not have any columns setup for your kanban board. Please click the button below to create the default setup.
            </Typography>
            <div style={{ display: 'flex', gap: '16px' }}>
                <Button type="primary" onClick={onDefaultSetup}>
                    Create Default Setup
                </Button>
            </div>
        </div>
    );
};

export default DefaultSetupComponent;
