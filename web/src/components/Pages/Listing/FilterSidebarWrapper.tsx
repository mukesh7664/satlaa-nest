"use client";

import { FilterSidebar, FilterData } from "./Filter";

interface FilterSidebarWrapperProps {
    filters: FilterData | null;
    loading?: boolean;
}

export function FilterSidebarWrapper({
    filters,
    loading = false,
}: FilterSidebarWrapperProps) {
    return (
        <FilterSidebar
            filters={filters}
            loading={loading}
        />
    );
}
