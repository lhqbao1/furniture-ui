"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGetBrands } from "@/features/brand/hook";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GpsrInput = () => {
  const form = useFormContext();
  const { data: brands, isLoading: isLoadingBrand } = useGetBrands();

  const brandId = form.watch("brand_id");
  const isEconelo = form.watch("is_econelo");

  // Lấy brand đang chọn (memo để tránh re-render không cần thiết)
  const selectedBrand = useMemo(() => {
    return brands?.find((b) => b.id === brandId);
  }, [brandId, brands]);

  // ✅ Chỉ setValue khi giá trị thật sự thay đổi
  useEffect(() => {
    if (!selectedBrand) return;

    const isBrandEconelo = selectedBrand.name
      ?.toLowerCase()
      .includes("econelo");

    // chỉ update nếu khác giá trị hiện tại để tránh vòng lặp
    if (isEconelo !== isBrandEconelo) {
      form.setValue("is_econelo", isBrandEconelo);
    }
  }, [selectedBrand, isEconelo, form]);

  return (
    <FormField
      control={form.control}
      name="brand_id"
      render={({ field }) => (
        <FormItem className="grid grid-cols-6 w-full">
          <FormLabel className="text-black font-semibold text-sm col-span-6">
            Brand
          </FormLabel>
          <FormControl className="col-span-6">
            <div>
              {brands ? (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full border font-light">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Loader2 className="animate-spin" />
              )}

              {/* Hiển thị thông tin brand */}
              {selectedBrand && (
                <ul className="list-disc list-inside mt-2 ml-2 text-sm text-black space-y-1">
                  <li>{selectedBrand.company_email}</li>
                  <li>{selectedBrand.company_address}</li>
                </ul>
              )}
            </div>
          </FormControl>
          <FormMessage className="col-span-6" />
        </FormItem>
      )}
    />
  );
};

export default GpsrInput;
