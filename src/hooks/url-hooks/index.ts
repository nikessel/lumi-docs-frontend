import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseUrlSelectedReports {
    selectedReports: string[];
    selectedCount: number;
}

export const useUrlSelectedReports = (): UseUrlSelectedReports => {
    const searchParams = useSearchParams();
    const [selectedReports, setSelectedReports] = useState<string[]>([]);

    useEffect(() => {
        const urlSelectedReports = searchParams.get('selectedReports');
        if (urlSelectedReports) {
            const decodedReports = urlSelectedReports
                .split(',')
                .map(report => decodeURIComponent(report))
                .filter(Boolean); // Remove empty strings
            setSelectedReports(decodedReports);
        } else {
            setSelectedReports([]);
        }
    }, [searchParams]);

    return {
        selectedReports,
        selectedCount: selectedReports.length,
    };
};
