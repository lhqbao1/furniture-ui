// import { JSDOM } from 'jsdom';
// import createDOMPurify from 'isomorphic-dompurify';

// // Tạo đối tượng window giả lập từ JSDOM
// const { window } = new JSDOM('');

// // Khởi tạo DOMPurify với window giả lập
// const DOMPurify = createDOMPurify(window);

// // Hàm làm sạch mô tả HTML
// export function cleanDescription(html: string): string {
//   // Loại bỏ các thẻ không mong muốn
//   html = html.replace(/<(\/?)(div|h[1-6]|script|style)[^>]*>/gi, '');
  
//   // Loại bỏ các thuộc tính không mong muốn
//   html = html.replace(/\s*(class|style|id)="[^"]*"/gi, '');
  
//   // Thay thế &nbsp; bằng khoảng trắng
//   html = html.replace(/&nbsp;/gi, ' ');

//   // Chỉ giữ lại các thẻ hợp lệ
//   html = DOMPurify.sanitize(html, {
//     ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
//     ALLOWED_ATTR: []
//   });

//   // Trả về chuỗi đã được làm sạch
//   return html.trim();
// }

// // Hàm làm sạch tiêu đề
// export function cleanTitle(title: string): string {
//   return title.trim();
// }

export function cleanImageLink(url: string): string {
  // Loại bỏ dấu ? ở cuối URL nếu có
  return url.replace(/\?+$/g, '');
}

export function cleanDescription(desc: string) {
  return desc
    .replace(/<\/?(ul|li|table|tr|td|strong|em|div|span|script|style)[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n") // giữ xuống dòng
    .replace(/<[^>]+>/g, "")       // loại bỏ các thẻ còn lại
    .replace(/\s+/g, " ")          // gom khoảng trắng
    .trim()
}

export function formatHtmlDescription(desc: string): string {
  if (!desc) return "";

  return desc
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
    .replace(/<\s*p[^>]*>/gi, "")
    .replace(/<\s*\/\s*div\s*>/gi, "\n")
    .replace(/<\s*div[^>]*>/gi, "")
    .replace(/<\s*h([1-6])[^>]*>([\s\S]*?)<\s*\/\s*h\1\s*>/gi, "\n$2\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\s*\/\s*li\s*>/gi, "")
    .replace(/<\s*\/?\s*(ul|ol)[^>]*>/gi, "\n")
    .replace(/<\s*(strong|b)[^>]*>([\s\S]*?)<\s*\/\s*(strong|b)\s*>/gi, "**$2**")
    .replace(/<\s*(em|i)[^>]*>([\s\S]*?)<\s*\/\s*(em|i)\s*>/gi, "_$2_")
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
