import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface UrlParams {
    selectedReports: string[];
    sortByComplianceRating: {
        min: number | null;
        max: number | null;
    };
    acceptanceCriteria: number | null;
    selectedSections: string[];
    selectedGroups: string[];
    sorting: 'asc' | 'desc' | null;
    sortByGroup: boolean;
    sortBySection: boolean;
    searchQuery: string;
}

interface UseUrlParams {
    params: UrlParams;
    setParams: (newParams: Partial<UrlParams>) => void;
}

const defaultParams: UrlParams = {
    selectedReports: [],
    sortByComplianceRating: {
        min: null,
        max: null,
    },
    acceptanceCriteria: null,
    selectedSections: [],
    selectedGroups: [],
    sorting: null,
    sortByGroup: false,
    sortBySection: false,
    searchQuery: '',
};

export const useUrlParams = (): UseUrlParams => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [params, setParamsState] = useState<UrlParams>(defaultParams);

    useEffect(() => {
        const newParams: UrlParams = {
            selectedReports: searchParams.get('selectedReports')?.split(',').map(report => decodeURIComponent(report)).filter(Boolean) || [],
            sortByComplianceRating: {
                min: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null,
                max: searchParams.get('maxRating') ? Number(searchParams.get('maxRating')) : null,
            },
            acceptanceCriteria: searchParams.get('acceptanceCriteria') ? Number(searchParams.get('acceptanceCriteria')) : null,
            selectedSections: searchParams.get('selectedSections')?.split(',').map(section => decodeURIComponent(section)).filter(Boolean) || [],
            selectedGroups: searchParams.get('selectedGroups')?.split(',').map(group => decodeURIComponent(group)).filter(Boolean) || [],
            sorting: (searchParams.get('sorting') as 'asc' | 'desc') || null,
            sortByGroup: searchParams.get('sortByGroup') === 'true',
            sortBySection: searchParams.get('sortBySection') === 'true',
            searchQuery: searchParams.get('searchQuery') || '',
        };
        setParamsState(newParams);
    }, [searchParams]);

    const setParams = (newParams: Partial<UrlParams>) => {
        const updatedParams = { ...params, ...newParams };
        const searchParamsObj = new URLSearchParams();

        if (updatedParams.selectedReports.length > 0) {
            searchParamsObj.set('selectedReports', updatedParams.selectedReports.map(report => encodeURIComponent(report)).join(','));
        }

        if (updatedParams.sortByComplianceRating.min !== null) {
            searchParamsObj.set('minRating', updatedParams.sortByComplianceRating.min.toString());
        }
        if (updatedParams.sortByComplianceRating.max !== null) {
            searchParamsObj.set('maxRating', updatedParams.sortByComplianceRating.max.toString());
        }

        if (updatedParams.acceptanceCriteria !== null) {
            searchParamsObj.set('acceptanceCriteria', updatedParams.acceptanceCriteria.toString());
        }

        if (updatedParams.selectedSections.length > 0) {
            searchParamsObj.set('selectedSections', updatedParams.selectedSections.map(section => encodeURIComponent(section)).join(','));
        }

        if (updatedParams.selectedGroups.length > 0) {
            searchParamsObj.set('selectedGroups', updatedParams.selectedGroups.map(group => encodeURIComponent(group)).join(','));
        }

        if (updatedParams.sorting) {
            searchParamsObj.set('sorting', updatedParams.sorting);
        }

        if (updatedParams.sortByGroup) {
            searchParamsObj.set('sortByGroup', 'true');
        }

        if (updatedParams.sortBySection) {
            searchParamsObj.set('sortBySection', 'true');
        }

        if (updatedParams.searchQuery) {
            searchParamsObj.set('searchQuery', updatedParams.searchQuery);
        }

        const newUrl = searchParamsObj.toString() ? `?${searchParamsObj.toString()}` : '';
        router.push(newUrl);
    };

    return {
        params,
        setParams,
    };
};
