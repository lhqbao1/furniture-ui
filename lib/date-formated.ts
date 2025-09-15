// utils/date.ts
export function formatDateTime(dateString: Date) {
    return new Date(dateString).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

// utils/date.ts
export function formatDate(dateString: Date) {
    return new Date(dateString).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}