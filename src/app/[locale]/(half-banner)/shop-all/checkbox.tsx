"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function BrandCheckbox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const brandValue = "Prestige Home Living Indoor";

  const isChecked = searchParams.getAll("brand").includes(brandValue);

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentBrands = params.getAll("brand");

    params.delete("brand");

    if (!currentBrands.includes(brandValue)) {
      // thêm brand mới
      currentBrands.push(brandValue);
    }

    // append lại toàn bộ brand
    currentBrands.forEach((b) => params.append("brand", b));

    // reset page khi filter đổi
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
      />
      <span>Wohnwagen Zubehör</span>
    </label>
  );
}
