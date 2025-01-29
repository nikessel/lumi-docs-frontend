import React from 'react';
import { useSearchParams } from 'next/navigation';
import { createUrlWithParams } from '@/utils/url-utils';
import HorizontalTabMenu from '@/components/horizontal-tab-menu';

const SubMenu: React.FC = () => {
    const searchParams = useSearchParams();

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

    return <HorizontalTabMenu items={menuItems} />;
};

export default SubMenu;
