// utils/date.ts

export function formatDateTime(dateString: Date) {
  return new Date(dateString).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTimeString(dateString: any) {
  if (!dateString) return "";

  // Nếu backend trả chuỗi không có Z → thêm Z để parse đúng UTC.
  const normalized = dateString.endsWith("Z") ? dateString : dateString + "Z";

  const date = new Date(normalized);

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Berlin", // luôn convert sang GMT+1 / GMT+2 (DST)
  });
}

export function formatDateString(dateString: any) {
  if (!dateString) return "";

  // Nếu backend trả chuỗi không có Z → thêm Z để parse đúng UTC.
  const normalized = dateString.endsWith("Z") ? dateString : dateString + "Z";

  const date = new Date(normalized);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// utils/date.ts
export function formatDate(dateString: Date) {
  return new Date(dateString).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
