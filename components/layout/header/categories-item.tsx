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
    <button
      type="button"
      className="group w-full cursor-pointer rounded-xl px-2.5 py-2 text-left text-[15px] font-medium text-slate-700 transition-all duration-200 hover:bg-white hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35"
      onClick={() => {
        onSelect?.(); // đóng drawer
        router.push(`/category/${item.slug}`, { locale });
      }}
    >
      <span className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-secondary/80 transition-transform duration-200 group-hover:scale-125" />
        <span>{item.name}</span>
      </span>
    </button>
  );
}
