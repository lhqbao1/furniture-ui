export function getCountryName(code: string): string {
  const normalized = code?.toUpperCase();

  switch (normalized) {
    case "DE":
      return "Deutschland"; // Nước Đức
    case "AT":
      return "Österreich"; // Nước Áo
    case "SCHWEIZ":
      return "Schweiz";
    default:
      return ""; // hoặc return code nếu muốn
  }
}
