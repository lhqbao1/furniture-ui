type NamedEntity = {
  name?: unknown;
};

export const toTrackingString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).replaceAll(",", " ").trim();
};

export const toTrackingCsv = (values: unknown[]): string =>
  values.map(toTrackingString).filter(Boolean).join(",");

export const getTrackingId = (
  idProvider: unknown,
  fallbackId?: unknown,
): string => {
  const providerId = toTrackingString(idProvider);
  if (providerId) return providerId;
  return toTrackingString(fallbackId);
};

export const getFirstCategoryName = (categories: unknown): string => {
  if (!Array.isArray(categories)) return "";

  const firstWithName = categories.find((category) => {
    if (!category || typeof category !== "object") return false;
    const name = (category as NamedEntity).name;
    return typeof name === "string" && name.trim().length > 0;
  }) as NamedEntity | undefined;

  return toTrackingString(firstWithName?.name);
};

export const getBrandName = (brand: unknown): string => {
  if (!brand || typeof brand !== "object") return "";
  return toTrackingString((brand as NamedEntity).name);
};
