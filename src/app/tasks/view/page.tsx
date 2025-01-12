'use client';

import React from 'react';
import KanbanBoard from './kanban-board';

const Page: React.FC = () => {
    return (
        <div style={{ height: '100vh', background: '#f4f5f7' }}>
            <KanbanBoard />
        </div>
    );
};

export default Page;
