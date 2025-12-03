import { useRouter } from "@/src/i18n/navigation";
import { CategoryResponse } from "@/types/categories";
import { useLocale } from "next-intl";

export default function CategoryItem({
  item,
  onSelect,
}: {
  item: CategoryResponse;
  onSelect: () => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  return (
    <div
      className="cursor-pointer py-1 text-base hover:text-secondary flex gap-2 items-center"
      onClick={() => {
        onSelect?.(); // đóng drawer
        router.push(`/category/${item.slug}`, { locale });
      }}
    >
      <div className="w-2 h-2 rounded-full bg-secondary"></div>
      {item.name}
    </div>
  );
}
