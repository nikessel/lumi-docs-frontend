'use client';

import React from 'react';
import KanbanBoard from './kanban-board';

const Page: React.FC = () => {
    return (
        <div style={{ height: '100vh' }}>
            <KanbanBoard />
        </div>
    );
};

export default Page;
