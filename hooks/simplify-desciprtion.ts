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
