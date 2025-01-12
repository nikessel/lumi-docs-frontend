import React from 'react';
import { Card, Typography, Avatar } from 'antd';

interface JiraCardProps {
    title: string;
    storyPoints: number;
    id: string;
    assigneeId: number;
}

const JiraCard: React.FC<JiraCardProps> = ({ title, storyPoints, id, assigneeId }) => (
    <Card style={{ marginBottom: '8px' }}>
        <Typography.Text>{title}</Typography.Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size={16} style={{ backgroundColor: '#2984FF', marginRight: '5px' }} />
                <Typography.Text>{id}</Typography.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography.Text style={{ marginRight: '8px' }}>{storyPoints} SP</Typography.Text>
                <Avatar size={24} src={`https://mui.com/static/images/avatar/${assigneeId}.jpg`} />
            </div>
        </div>
    </Card>
);

export default JiraCard;
