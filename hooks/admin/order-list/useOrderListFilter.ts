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

export function useOrderListFilters() {
  const searchParams = useSearchParams();

  return {
    page: Number(searchParams.get("page")) || 1,

    status: parseStatusParam(searchParams.get("status")), // 🔥 uppercase

    channel: parseChannelParam(searchParams.get("channel")), // 🔥 sẽ uppercase trước

    fromDate: searchParams.get("from_date") || undefined,
    toDate: searchParams.get("to_date") || undefined,
    search: searchParams.get("search") || "",
    isB2B: parseIsB2BParam(searchParams.get("is_b2b")),
    isClaimedFactory: parseBooleanParam(searchParams.get("is_claimed_factory")),
    isClaimedMarketplace: parseBooleanParam(
      searchParams.get("is_claimed_marketplace"),
    ),
  };
}
