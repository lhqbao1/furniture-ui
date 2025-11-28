export function getCountryName(code: string): string {
  const normalized = code?.toUpperCase();

  switch (normalized) {
    case "DE":
      return "Deutschland"; // Nước Đức
    case "AT":
      return "Österreich"; // Nước Áo
    default:
      return ""; // hoặc return code nếu muốn
  }
}
