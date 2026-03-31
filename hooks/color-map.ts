// utils/color-map.ts
export const COLOR_MAP: Record<string, string> = {
  // basic
  weiß: "#ffffff",
  weiss: "#ffffff",
  white: "#ffffff",

  grau: "#9ca3af",
  hellgrau: "#d1d5db",
  dunkelgrau: "#4b5563",
  taupe: "#8b7d6b",
  gray: "#9ca3af",
  grey: "#9ca3af",

  anthrazit: "#2f2f2f",
  schwarz: "#000000",
  black: "#000000",

  blau: "#2563eb",
  dunkelblau: "#1e3a8a",
  hellblau: "#60a5fa",
  navy: "#1e3a8a",
  rot: "#dc2626",
  dunkelrot: "#7f1d1d",
  bordeaux: "#7f1d1d",
  braun: "#92400e",
  dunkelbraun: "#5b3a29",
  hellbraun: "#b07a4f",
  beige: "#f5f5dc",
  creme: "#fffdd0",
  elfenbein: "#fffff0",
  gelb: "#facc15",
  orange: "#f97316",
  rosa: "#f9a8d4",
  pink: "#ec4899",
  lila: "#a855f7",
  violett: "#7c3aed",
  silber: "#d1d5db",
  gold: "#d4af37",
  kupfer: "#b87333",
  chrom: "#e5e7eb",
  grün: "#16a34a",
  gruen: "#16a34a",
  dunkelgrün: "#064e3b",
  mint: "#6ee7b7",
  oliv: "#6b8e23",
  türkis: "#14b8a6",
  tuerkis: "#14b8a6",
  petrol: "#0f766e",
  koralle: "#ff7f50",

  apfelgrün: "#7cb342",
  apfelgruen: "#7cb342",
  camouflage:
    "repeating-linear-gradient(45deg,#556b2f,#556b2f 10px,#6b8e23 10px,#6b8e23 20px)",
  transparent: "transparent",
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
