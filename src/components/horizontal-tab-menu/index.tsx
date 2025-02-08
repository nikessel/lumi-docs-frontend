import React, { useState } from 'react';
import Link from 'next/link';
import { Divider, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { isActiveLink } from '@/utils/url-utils';

type MenuItem = {
    label: string;
    link: string;
    description?: string;
};

type MenuProps = {
    items: MenuItem[];
    className?: string;
};

const HorizontalTabMenu: React.FC<MenuProps> = ({ items, className = '' }) => {
    const pathname = usePathname();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const getItemClasses = (link: string) => {
        const isSelected = isActiveLink(link, pathname);
        return isSelected
            ? "text-primary bg-bg_secondary font-medium"
            : "text-text_secondary bg-muted hover:text-primary";
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <div className={`flex items-center ${className}`}>
            {items.map((item, index) => (
                <React.Fragment key={item.link}>
                    <Link href={item.link}>
                        <div className={`cursor-pointer px-2 py-2 rounded-md ${getItemClasses(item.link)}`}>
                            {item.label}
                        </div>
                    </Link>
                    {index < items.length - 1 && <Divider type="vertical" />}
                </React.Fragment>
            ))}
            {/* Question Mark Icon */}
            {items.some(item => item.description) && (
                <div
                    className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-muted cursor-pointer hover:opacity-60"
                    onClick={handleOpenModal}
                >
                    <QuestionCircleOutlined style={{ fontSize: '16px', color: '#555' }} />
                </div>
            )}
            {/* Modal */}
            <Modal
                title="Menu Descriptions"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {items.map((item) => (
                    item.description && (
                        <div key={item.label} className="mb-4">
                            <h3 className="text-lg font-medium">{item.label}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                    )
                ))}
            </Modal>
        </div>
    );
};

export default HorizontalTabMenu;
