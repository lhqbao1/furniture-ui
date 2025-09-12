// export function slugify(name: string): string {
//   return name
//     .toLowerCase()
//     // giữ nguyên ký tự đặc biệt có dấu
//     .replace(/\s*&\s*/g, "-&-")       // khoảng trắng quanh & → -&-
//     .replace(/[^a-z0-9äöüß&]+/gi, "-") // chấp nhận cả ký tự có dấu Đức
//     .replace(/^-+|-+$/g, "");          // bỏ dấu - ở đầu/cuối
// }

import slugify from "react-slugify";


export function fromSlug(slug: string): string {
  return slug
    .replace(/-&-/g, " & ")   // đổi -&- lại thành " & "
    .replace(/-/g, " ");      // các dấu - còn lại → " "
}


export function decodeSlug(slug: string): string {
  return decodeURIComponent(fromSlug(slug)).replace(/-/g, " ");
}

export function textToBinary(text: string): string {
  return text
    .split("")
    .map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, "0")
    })
    .join(" ");
}

export function binaryToText(binary: string): string {
  return binary
    .split(" ")
    .map(bin => String.fromCharCode(parseInt(bin, 2)))
    .join("");
}

export function deslugify(slug: string): string {
  // B1: decode các ký tự %xx
  let decoded = decodeURIComponent(slug)

  // B2: thay dấu - thành khoảng trắng (chỉ nếu bạn dùng slugify theo kiểu này)
  decoded = decoded.replace(/-/g, " ")

  return decoded
}

export function generateMultiLanguageSlug(text: string) {
  // Example: 'en' for English, 'fr' for French, 'de' for German, etc.
  return slugify(text, {
    delimiter: '-',  // replace spaces with replacement character, defaults to `-`  lower: false,      // convert to lower case, defaults to `false`
  // strict: false, 
  locale: 'ger',      // language code of the locale to use
  // trim: true         // trim leading and trailing replacement chars, defaults to `true`
  });
}