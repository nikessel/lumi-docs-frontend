export const createUrlWithParams = (basePath: string, searchParams: URLSearchParams) => {
    const params = searchParams.toString();
    return `${basePath}${params ? `?${params}` : ''}`;
};

export const stripQueryParams = (path: string) => {
    return path.split('?')[0]; // Remove everything after and including "?"
};

export const isActiveLink = (link: string, pathname: string) => {
    return stripQueryParams(link) === pathname;
};
