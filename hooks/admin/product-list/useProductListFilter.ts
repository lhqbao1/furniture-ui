import { useSearchParams } from "next/navigation";

export function useProductListFilters() {
  const searchParams = useSearchParams();

  return {
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("page_size")) || 50,
    all_products: searchParams.get("all_products") || null,
    search: searchParams.get("search") || "",
    sort_by_stock: searchParams.get("sort_by_stock") || undefined,
    supplier_id: searchParams.get("supplier_id") || "",
  };
}
