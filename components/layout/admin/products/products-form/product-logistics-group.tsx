import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductItem } from "@/types/products";
import Image from "next/image";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

interface ProductLogisticsGroupProps {
  isDSP?: boolean;
}

function isValidPackage(pkg: any) {
  return (
    pkg?.length != null &&
    pkg?.width != null &&
    pkg?.height != null &&
    pkg?.weight != null
  );
}

const ProductLogisticsGroup = ({
  isDSP = false,
}: ProductLogisticsGroupProps) => {
  const form = useFormContext();
  const control = form.control;

  const carriers = [
    { id: "amm", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
  ];

  const DSPcarriers = [
    { id: "amm", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
    { id: "dhl", logo: "/dhl.png" },
    { id: "hermes", logo: "/hermes.png" },
    { id: "gls", logo: "/gls.png" },
    { id: "ups", logo: "/ups.png" },
  ];

  const deliveryTimes = ["1-3", "3-5", "5-8", "8-14", "14-20", "20-30"];

  // Lấy giá trị number_of_packages từ form
  const numberOfPackages = useWatch({
    control,
    name: "number_of_packages",
  });

  const isLoading = numberOfPackages === undefined || numberOfPackages === null;

  // Tạo field array cho packages
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  const bundleItems = form.watch("bundles");

  // Thêm effect để đồng bộ bundleItems → number_of_packages + packages
  useEffect(() => {
    if (!bundleItems || bundleItems.length === 0) return;

    // ✅ Set số lượng packages bằng số lượng bundleItems
    form.setValue("number_of_packages", bundleItems.length);

    // ✅ Fill từng gói từ bundle_items
    const filledPackages = bundleItems.map((b: ProductItem) => ({
      length: b?.length ?? null,
      height: b?.height ?? null,
      width: b?.width ?? null,
      weight: b?.weight ?? null,
    }));

    form.setValue("packages", filledPackages);
  }, [bundleItems, form]);

  useEffect(() => {
    const packages = form.getValues("packages") || [];

    const validCount = packages.filter(isValidPackage).length;

    form.setValue("number_of_packages", validCount, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [fields, form]);

  useEffect(() => {
    if (!bundleItems?.length && fields.length === 0) {
      append({
        length: null,
        height: null,
        width: null,
        weight: null,
      });
    }
  }, [fields.length, bundleItems, append]);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Carrier field */}
        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                Carrier
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    placeholderColor
                    className="border col-span-4 font-light"
                  >
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isDSP ? DSPcarriers : carriers).map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={c.logo}
                            alt={c.id}
                            width={30}
                            height={20}
                            className="object-contain"
                          />
                          <span className="uppercase">
                            {c.id === "amm" ? "Spedition" : c.id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery_time"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                Delivery time
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    if (val === "Deselect") field.onChange(null);
                    else field.onChange(val);
                  }}
                >
                  <SelectTrigger className="border col-span-4 font-light">
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Deselect"
                      className="text-gray-400 italic"
                    >
                      — Deselect —
                    </SelectItem>
                    {deliveryTimes.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                      >
                        {t} business days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product packaging number */}
        <FormField
          control={form.control}
          name="number_of_packages"
          render={({ field }) => (
            <FormItem className="flex flex-col col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Number of packages
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber,
                    )
                  }
                  disabled={true} // ✅ disable nếu có bundleItems
                />
              </FormControl>
              {bundleItems?.length > 0 && (
                <p className="text-xs text-gray-500 italic mt-1">
                  Number of packages is automatically set from bundle items.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Tariff Number */}
        <FormField
          control={form.control}
          name="tariff_number"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                Tariff Number
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="col-span-4"
                  placeholder=""
                  min={0}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/*Incoterm */}
        <FormField
          control={form.control}
          name="incoterm"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                Incoterm
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="col-span-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pallet unit input */}
        <FormField
          control={form.control}
          name="pallet_unit"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm">
                Pallet unit
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : e.target.value,
                    )
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* --- LOADING SKELETON --- */}
      {/* {isLoading && (
        <div className="flex flex-col gap-4 mt-2">
          <PackageSkeleton />
          <PackageSkeleton />
        </div>
      )} */}

      {/* --- REAL PACKAGE INPUTS --- */}
      {fields.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black font-semibold">
              Packaging (cm)
            </div>

            <button
              type="button"
              onClick={() => {
                append({
                  length: null,
                  height: null,
                  width: null,
                  weight: null,
                });
              }}
              disabled={bundleItems?.length > 0}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span className="text-lg leading-none">+</span>
              Add package
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {fields.map((pkg, index) => (
              <div
                key={pkg.id}
                className="flex flex-col w-full border p-3 rounded-2xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm text-gray-700">
                    Package #{index + 1}
                  </div>

                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={bundleItems?.length > 0}
                    className="text-xs"
                    size={"icon"}
                    variant={"red"}
                  >
                    X
                  </Button>
                </div>

                <div className="grid lg:grid-cols-4 grid-cols-2 gap-3 w-full">
                  {["length", "height", "width", "weight"].map((key) => (
                    <FormField
                      key={key}
                      control={control}
                      name={`packages.${index}.${key}`}
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col">
                          <div className="flex flex-col-reverse items-center ">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder=""
                                min={0}
                                step="0.01"
                                inputMode="decimal"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : e.target.valueAsNumber,
                                  )
                                }
                                disabled={bundleItems?.length > 0}
                              />
                            </FormControl>
                            <FormLabel className="text-black font-semibold text-sm capitalize">
                              {key}
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLogisticsGroup;

const PackageSkeleton = () => (
  <div className="flex flex-col w-full border p-3 rounded-2xl shadow-sm animate-pulse">
    <div className="h-4 w-1/3 bg-gray-300 rounded mb-3"></div>

    <div className="grid grid-cols-4 gap-3 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex flex-col-reverse items-center flex-1"
        >
          <div className="h-10 w-full bg-gray-300 rounded"></div>
          <div className="h-3 w-10 bg-gray-300 rounded mb-1"></div>
        </div>
      ))}
    </div>
  </div>
);
