"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import BrandSelect from "./brand-select";
import { useGetBrands } from "@/features/brand/hook";

const BrandFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brand, setBrand] = useState(searchParams.get("brand_id") ?? "");

  const { data: brands } = useGetBrands();
  if (!brands) return <>Loading...</>;

  const handleChange = (value: string) => {
    setBrand(value);

    const params = new URLSearchParams(searchParams.toString());

    // supplier filter
    if (!value) params.delete("brand_id");
    else params.set("brand_id", value);

    // ✅ reset page
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-2">
      <Label>Select Brand</Label>
      <BrandSelect brands={brands} brand={brand} setBrand={handleChange} />
    </div>
  );
};

export default BrandFilter;
