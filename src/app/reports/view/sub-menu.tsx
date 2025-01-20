import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Divider, Modal } from 'antd';
import { createUrlWithParams, isActiveLink } from '@/utils/url-utils';
import { QuestionCircleOutlined } from '@ant-design/icons';

const SubMenu = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const menuItems = [
        {
            label: "Overview",
            link: createUrlWithParams("/reports/view/overview", searchParams),
            description:
                "The Overview tab provides a graphical summary of the selected reports. Explore key metrics and visualize compliance status across associated regulatory frameworks in a tree view.",
        },
        {
            label: "All Requirements",
            link: createUrlWithParams("/reports/view/all_requirements", searchParams),
            description:
                "This tab presents a structured view of your compliance status, organized by the associated regulatory frameworks. The structure aligns with the standards, ensuring consistency across all reports for a specific framework.",
        },
        {
            label: "Key Findings",
            link: createUrlWithParams("/reports/view/key_findings", searchParams),
            description:
                "Extracts requirements from the selected reports and highlights the assessments with the lowest compliance ratings, prioritizing areas requiring immediate attention.",
        },
    ];

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
        <div className="flex items-center">
            {menuItems.map((item, index) => (
                <React.Fragment key={item.link}>
                    <Link href={item.link}>
                        <div className={`cursor-pointer px-2 py-2 rounded-md ${getItemClasses(item.link)}`}>
                            {item.label}
                        </div>
                    </Link>
                    {index < menuItems.length - 1 && <Divider type="vertical" />}
                </React.Fragment>
            ))}
            {/* Question Mark Icon */}
            <div
                className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-muted cursor-pointer hover:opacity-60"
                onClick={handleOpenModal}
            >
                <QuestionCircleOutlined style={{ fontSize: '16px', color: '#555' }} />
            </div>

            {/* Modal */}
            <Modal
                title="Menu Descriptions"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {menuItems.map((item) => (
                    <div key={item.label} className="mb-4">
                        <h3 className="text-lg font-medium">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                ))}
            </Modal>
        </div>
    );
};

export default SubMenu;
