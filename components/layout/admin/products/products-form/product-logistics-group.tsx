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
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  aggregatePackages,
  calcDeliveryCost,
} from "@/lib/shipping/delivery-cost";

interface ProductLogisticsGroupProps {
  isDSP?: boolean;
}

type PackageValue = {
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
};

function isValidPackage(pkg: PackageValue | null | undefined) {
  return (
    pkg?.length != null &&
    pkg?.width != null &&
    pkg?.height != null &&
    pkg?.weight != null
  );
}

const toFiniteNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePackage = (value: unknown): PackageValue => {
  const source = (value ?? {}) as Record<string, unknown>;

  return {
    length: toFiniteNumberOrNull(source.length),
    width: toFiniteNumberOrNull(source.width),
    height: toFiniteNumberOrNull(source.height),
    weight: toFiniteNumberOrNull(source.weight),
  };
};

const hasPositivePackageValue = (pkg: PackageValue) =>
  (pkg.length ?? 0) > 0 &&
  (pkg.width ?? 0) > 0 &&
  (pkg.height ?? 0) > 0 &&
  (pkg.weight ?? 0) > 0;

const pickPreferredPackage = (packages: unknown): PackageValue | null => {
  if (!Array.isArray(packages) || packages.length === 0) return null;

  const normalizedPackages = packages.map((item) => normalizePackage(item));
  const firstValidWithPositiveValue = normalizedPackages.find((pkg) =>
    isValidPackage(pkg) && hasPositivePackageValue(pkg),
  );
  if (firstValidWithPositiveValue) return firstValidWithPositiveValue;

  return normalizedPackages.find((pkg) => isValidPackage(pkg)) ?? null;
};

const getBundleMappedPackage = (bundle: unknown): PackageValue => {
  const bundleSource = (bundle ?? {}) as Record<string, unknown>;
  const bundleItem = (bundleSource.bundle_item ?? {}) as Record<string, unknown>;

  const packageFromBundleItem = pickPreferredPackage(bundleItem.packages);
  if (packageFromBundleItem) return packageFromBundleItem;

  const packageFromBundle = pickPreferredPackage(bundleSource.packages);
  if (packageFromBundle) return packageFromBundle;

  return normalizePackage({
    length: bundleSource.length ?? bundleItem.length,
    width: bundleSource.width ?? bundleItem.width,
    height: bundleSource.height ?? bundleItem.height,
    weight: bundleSource.weight ?? bundleItem.weight,
  });
};

const ProductLogisticsGroup = ({
  isDSP = false,
}: ProductLogisticsGroupProps) => {
  const form = useFormContext();
  const control = form.control;

  const carriers = [
    { id: "amm", logo: "/amm.jpeg" },
    { id: "spedition", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
    { id: "dhl", logo: "/dhl.png" },
    { id: "gls", logo: "/gls-new.png" },
    { id: "ups", logo: "/ups.png" },
    { id: "hermes", logo: "/hermes.png" },
    { id: "fexed", logo: "/fedex.png" },
  ];

  const DSPcarriers = [
    { id: "amm", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
    { id: "dhl", logo: "/dhl.png" },
    { id: "hermes", logo: "/hermes.png" },
    { id: "gls", logo: "/gls-new.png" },
    { id: "ups", logo: "/ups.png" },
  ];

  const deliveryTimes = ["1-3", "3-5", "5-8", "8-14", "14-20", "20-30"];
  const packageTypes = ["carton", "palletized", "crated", "bagged", "bulk"];
  const EMPTY_PACKAGE_TYPE = "__none__";

  // Tạo field array cho packages
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  const bundleItems = useWatch({ control, name: "bundles" });
  const watchedCarrier = useWatch({ control, name: "carrier" });
  const watchedPackages = useWatch({ control, name: "packages" });
  const watchedBundles = bundleItems;
  const hasMountedWarningRef = useRef(false);
  const lastWarningKeyRef = useRef("");

  // Thêm effect để đồng bộ bundleItems → number_of_packages + packages
  useEffect(() => {
    if (!bundleItems || bundleItems.length === 0) return;

    // ✅ Fill từng gói từ bundle_items (ưu tiên bundle_item.packages)
    const filledPackages = bundleItems.map((bundle) =>
      getBundleMappedPackage(bundle),
    );

    form.setValue("number_of_packages", filledPackages.length);

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

  useEffect(() => {
    const mergedPackage = aggregatePackages(
      watchedPackages ?? [],
      watchedBundles ?? [],
    );
    const normalizedCarrier = String(watchedCarrier ?? "")
      .toLowerCase()
      .trim();
    const mergedWeight = Number(mergedPackage?.weight ?? 0);
    const isAmmOrSpeditionCarrier =
      normalizedCarrier.includes("amm") ||
      normalizedCarrier.includes("spedition");

    const { error } = calcDeliveryCost(
      mergedPackage ? [mergedPackage] : [],
      watchedCarrier,
    );

    let warningKey = "";
    let warningMessage = "";

    if (
      Number.isFinite(mergedWeight) &&
      mergedWeight > 31 &&
      !isAmmOrSpeditionCarrier
    ) {
      warningKey = `over-31-${normalizedCarrier}`;
      warningMessage = `This product is over 31kg and carrier "${watchedCarrier || "unknown"}" is selected. Please make sure this is the intended carrier.`;
    } else if (error) {
      warningKey = `delivery-error-${normalizedCarrier}`;
      warningMessage = `Carrier "${watchedCarrier || "unknown"}" has a shipping warning: ${error}. Please make sure this is the intended carrier.`;
    }

    if (!hasMountedWarningRef.current) {
      hasMountedWarningRef.current = true;
      lastWarningKeyRef.current = warningKey;
      return;
    }

    if (warningKey && warningKey !== lastWarningKeyRef.current) {
      toast.info(warningMessage);
    }

    lastWarningKeyRef.current = warningKey;
  }, [watchedCarrier, watchedPackages, watchedBundles]);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Carrier field */}
        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => {
            let value = field.value;
            if (value === "spedition") value = "amm"; // normalize import/DB

            const mergedCarriers = (isDSP ? DSPcarriers : carriers)
              .filter((c) => c.id !== "spedition") // hide legacy
              .map((c) =>
                c.id === "amm"
                  ? { ...c, label: "Spedition" } // UI label
                  : { ...c, label: c.id.toUpperCase() },
              );

            return (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-black font-semibold text-sm col-span-2">
                  Carrier
                </FormLabel>
                <FormControl>
                  <Select
                    value={value ?? ""}
                    onValueChange={(val) => {
                      // normalize output canonical
                      if (val === "spedition") val = "amm";
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger
                      placeholderColor
                      className="border col-span-4 font-light"
                    >
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {mergedCarriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={c.logo}
                              alt={c.id}
                              width={30}
                              height={20}
                              className="object-contain"
                            />
                            <span className="uppercase">{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
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
                  value={
                    deliveryTimes.includes(field.value ?? "")
                      ? (field.value ?? "")
                      : ""
                  }
                  onValueChange={(val) => {
                    if (val === "Deselect") field.onChange(null);
                    else field.onChange(val);
                  }}
                >
                  <SelectTrigger className="border font-light">
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryTimes.map((t) => (
                      <SelectItem key={t} value={t}>
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

        <FormField
          control={form.control}
          name="package_type"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm">
                Package Type
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? EMPTY_PACKAGE_TYPE}
                  onValueChange={(val) =>
                    field.onChange(val === EMPTY_PACKAGE_TYPE ? null : val)
                  }
                >
                  <SelectTrigger className="border font-light">
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_PACKAGE_TYPE}>None</SelectItem>
                    {packageTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
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
                  {["length", "width", "height", "weight"].map((key) => (
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
