import { CategoryResponse } from "@/types/categories";

export default function CategoryItem({ item }: { item: CategoryResponse }) {
  return (
    <div className="cursor-pointer py-1 text-base hover:text-secondary flex gap-2 items-center">
      <div className="w-2 h-2 rounded-full bg-secondary"></div>
      {item.name}
    </div>
  );
}
