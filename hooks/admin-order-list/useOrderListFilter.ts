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

export function useOrderListFilters() {
  const searchParams = useSearchParams();

  return {
    page: Number(searchParams.get("page")) || 1,

    status: parseStatusParam(searchParams.get("status")), // 🔥 uppercase

    channel: parseChannelParam(searchParams.get("channel")), // 🔥 sẽ uppercase trước

    fromDate: searchParams.get("from_date") || undefined,
    toDate: searchParams.get("to_date") || undefined,
    search: searchParams.get("search") || "",
  };
}
