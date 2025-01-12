import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Divider } from 'antd';
import { createUrlWithParams, isActiveLink } from '@/utils/url-utils';

const SubMenu = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const menuItems = [
        {
            label: "Overview",
            link: createUrlWithParams("/reports/view/overview", searchParams),
        },
        {
            label: "All Requirements",
            link: createUrlWithParams("/reports/view/all_requirements", searchParams),
        },
        {
            label: "Key Findings",
            link: createUrlWithParams("/reports/view/key_findings", searchParams),
        },
    ];

    const getItemClasses = (link: string) => {
        const isSelected = isActiveLink(link, pathname);
        return isSelected
            ? "text-primary bg-bg_secondary font-medium"
            : "text-text_secondary bg-muted hover:text-primary";
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
        </div>
    );
};

export default SubMenu;
