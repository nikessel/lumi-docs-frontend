import React from 'react';
import { Menu } from 'antd';
import {
    FolderAddOutlined,
    FolderOpenOutlined,
} from '@ant-design/icons';

const FileContextMenu: React.FC<{
    x: number;
    y: number;
    onCreateFolder: () => void;
    onMove: () => void;
    onClose: () => void;
}> = ({ x, y, onCreateFolder, onMove, onClose }) => {
    return (
        <Menu
            style={{
                position: 'absolute',
                left: x,
                top: y,
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
            }}
            onClick={onClose} // Close menu on any action
        >
            <Menu.Item key="create-folder" icon={<FolderAddOutlined />} onClick={onCreateFolder}>
                Create Folder
            </Menu.Item>
            <Menu.Item key="move" icon={<FolderOpenOutlined />} onClick={onMove}>
                Move
            </Menu.Item>
        </Menu>
    );
};

export default FileContextMenu;
