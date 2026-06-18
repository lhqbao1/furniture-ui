import type { CategoryResponse } from "@/types/categories";

export type CategoryOption = {
  id: string;
  name: string;
};

export function flattenCategoryOptions(
  categories: CategoryResponse[] = [],
  parentName = "",
): CategoryOption[] {
  return categories.flatMap((category) => {
    const name = parentName ? `${parentName} / ${category.name}` : category.name;

    return [
      {
        id: category.id,
        name,
      },
      ...flattenCategoryOptions(category.children ?? [], name),
    ];
  });
}
