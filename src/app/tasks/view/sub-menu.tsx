import React from 'react';
import { useSearchParams } from 'next/navigation';
import { createUrlWithParams } from '@/utils/url-utils';
import HorizontalTabMenu from '@/components/horizontal-tab-menu';

const SubMenu: React.FC = () => {
    const searchParams = useSearchParams();

    const menuItems = [
        {
            label: "Overview",
            link: createUrlWithParams("/tasks/view/overview", searchParams),
            description:
                "The overview provides an aggregate overview of the tasks assocaited with the selected tasks",
        },
        {
            label: "Kanban",
            link: createUrlWithParams("/tasks/view/kanban", searchParams),
            description:
                "The Kanban board let's you move tasks between different stages of completion, add granular filters and track your progress",
        },
    ];

    return <HorizontalTabMenu items={menuItems} />;
};

export default SubMenu;
