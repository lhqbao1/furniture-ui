import { useSearchParams } from "next/navigation";

function parseBooleanParam(param: string | null): boolean | undefined {
  if (!param) return undefined;
  const normalized = param.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

export function useProductInventoryFilters() {
  const searchParams = useSearchParams();

  return {
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("page_size")) || 50,
    all_products: searchParams.get("all_products") || null,
    search: searchParams.get("search") || "",
    is_inventory: searchParams.get("is_inventory") || "true",
    supplier_id: searchParams.get("supplier_id") || "",
    brand: searchParams.get("brand_id") || "",
    is_econelo: parseBooleanParam(searchParams.get("is_econelo")),
  };
}
