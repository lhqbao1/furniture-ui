export function stripHtmlRegex(html: string): string {
    return html.replace(/<br\s*\/?>/gi, "\n") // giữ xuống dòng
        .replace(/<[^>]*>/g, "")        // xóa tag
        .replace(/\s+/g, " ")           // gom khoảng trắng
        .trim()
  }