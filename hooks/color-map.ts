// utils/color-map.ts
export const COLOR_MAP: Record<string, string> = {
  // basic
  weiß: "#ffffff",
  weiss: "#ffffff",
  white: "#ffffff",

  grau: "#9ca3af",
  gray: "#9ca3af",
  grey: "#9ca3af",

  anthrazit: "#2f2f2f",
  schwarz: "#000000",
  black: "#000000",

  blau: "#2563eb",
  rot: "#dc2626",
  braun: "#92400e",
  beige: "#f5f5dc",
  silber: "#d1d5db",
  chrom: "#e5e7eb",
  grün: "#16a34a",
  gruen: "#16a34a",
  dunkelgrün: "#064e3b",

  apfelgrün: "#7cb342",
  camouflage:
    "repeating-linear-gradient(45deg,#556b2f,#556b2f 10px,#6b8e23 10px,#6b8e23 20px)",
};

// normalize helper
export function getColorStyle(label: string): string {
  const key = label.toLowerCase().trim();

  // nếu là màu ghép → lấy màu đầu
  const parts = key
    .replace("and", "und")
    .split("und")
    .map((p) => p.trim());

  return COLOR_MAP[parts[0]] ?? "#e5e7eb"; // fallback gray
}
