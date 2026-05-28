import { useSearchParams } from "next/navigation";

// 🔥 STATUS → UPPERCASE
function parseStatusParam(param: string | null) {
  if (!param || param.trim() === "") return [];
  return param.split(",").map((s) => s.trim().toUpperCase());
}

// 🔥 CHANNEL → giữ nguyên (không uppercase)
function parseChannelParam(param: string | null) {
  if (!param || param.trim() === "") return [];

  const arr = param.split(",").map((s) => s.trim());

  return arr;
}

function parseCountryParam(param: string | null): string | undefined {
  if (!param) return undefined;

  const normalized = param.trim().toUpperCase();

  if (!normalized) return undefined;
  if (normalized === "UK") return "GB";

  return normalized;
}

function parseIsB2BParam(param: string | null): boolean | undefined {
  if (!param) return undefined;
  const normalized = param.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function parseBooleanParam(param: string | null): boolean | undefined {
  if (!param) return undefined;
  const normalized = param.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function parseShipmentFilterParam(param: string | null): boolean | undefined {
  if (!param) return undefined;
  return param.trim().toLowerCase() === "true" ? true : undefined;
}

export function useOrderListFilters() {
  const searchParams = useSearchParams();

  return {
    page: Number(searchParams.get("page")) || 1,

    status: parseStatusParam(searchParams.get("status")), // 🔥 uppercase

    channel: parseChannelParam(searchParams.get("channel")), // 🔥 sẽ uppercase trước

    fromDate: searchParams.get("from_date") || undefined,
    toDate: searchParams.get("to_date") || undefined,
    search: searchParams.get("search") || "",
    country: parseCountryParam(searchParams.get("country")),
    isB2B: parseIsB2BParam(searchParams.get("is_b2b")),
    filterByShipment: parseShipmentFilterParam(
      searchParams.get("filter_by_shipment"),
    ),
    isClaimedFactory: parseBooleanParam(searchParams.get("is_claimed_factory")),
    isClaimedMarketplace: parseBooleanParam(
      searchParams.get("is_claimed_marketplace"),
    ),
  };
}
