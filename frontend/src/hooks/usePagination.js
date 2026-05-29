import { useMemo, useState } from "react";

export function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const updatePage = (nextPage) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return {
    page: safePage,
    totalPages,
    paginatedItems,
    setPage: updatePage,
    resetPage: () => setPage(1),
  };
}
