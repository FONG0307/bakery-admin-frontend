import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

type FetchFn = (params: any) => Promise<{
  data: any[];
  meta: any;
}>;

export function usePaginatedFetch(fetchFn: FetchFn, options?: {
  debounce?: number;
}) {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const dPage = useDebounce(page, options?.debounce ?? 400);
  const dPerPage = useDebounce(perPage, options?.debounce ?? 400);
  const dSearch = useDebounce(search, options?.debounce ?? 400);
  const dFilters = useDebounce(filters, options?.debounce ?? 400);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetchFn({
        page: dPage,
        per_page: dPerPage,
        q: dSearch,
        ...dFilters,
      });
      setData(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [dPage, dPerPage, dSearch, dFilters]);

  return {
    data,
    meta,
    loading,

    // state
    page,
    perPage,
    search,
    filters,

    // setters
    setPage,
    setPerPage,
    setSearch,
    setFilters,

    // manual reload (delete/create)
    reload,
  };
}
