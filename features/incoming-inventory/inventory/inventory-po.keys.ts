// inventory-po.keys.ts
export const inventoryPoKeys = {
  all: ["inventory-po"] as const,

  container: (containerId: string) =>
    [...inventoryPoKeys.all, "container", containerId] as const,

  detail: (id: string) => [...inventoryPoKeys.all, "detail", id] as const,
};
