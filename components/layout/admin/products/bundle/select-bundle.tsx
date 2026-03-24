"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductItem } from "@/types/products";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetAllProducts } from "@/features/products/hook";
import RemoveBundleDialog from "./remove-dialog";

type SelectedProduct = {
  product: ProductItem;
  amount: number;
  length: number;
  width: number;
  height: number;
  weight: number;
};

type PackageSize = {
  length: number;
  width: number;
  height: number;
  weight: number;
};

const toFiniteNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const hasPositivePackageValue = (pkg: PackageSize) =>
  pkg.length > 0 && pkg.width > 0 && pkg.height > 0 && pkg.weight > 0;

const getPreferredPackageSize = (product: ProductItem): PackageSize => {
  const packageCandidates = Array.isArray(product.packages)
    ? product.packages.map((pkg) => ({
        length: toFiniteNumber(pkg?.length),
        width: toFiniteNumber(pkg?.width),
        height: toFiniteNumber(pkg?.height),
        weight: toFiniteNumber(pkg?.weight),
      }))
    : [];

  const firstValidPackage = packageCandidates.find(hasPositivePackageValue);
  if (firstValidPackage) return firstValidPackage;

  const directPackage = {
    length: toFiniteNumber(product.length),
    width: toFiniteNumber(product.width),
    height: toFiniteNumber(product.height),
    weight: toFiniteNumber(product.weight),
  };

  if (hasPositivePackageValue(directPackage)) return directPackage;

  return {
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  };
};

interface SelectBundleComponentProps {
  currentProduct?: Partial<ProductItem>;
}

const SelectBundleComponent = ({
  currentProduct,
}: SelectBundleComponentProps) => {
  const form = useFormContext();
  const { setValue } = form;
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);
  const [queryParams, setQueryParams] = useState("");
  const [open, setOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetAllProducts({
    search: queryParams,
    page_size: 100,
  });

  const handleSelectProduct = (product: ProductItem) => {
    const preferredPackage = getPreferredPackageSize(product);

    setListProducts((prev) => {
      if (prev.some((p) => p.product.id === product.id)) return prev;
      return [
        ...prev,
        {
          product,
          amount: 1,
          length: preferredPackage.length,
          width: preferredPackage.width,
          height: preferredPackage.height,
          weight: preferredPackage.weight,
        },
      ];
    });
  };

  const handleAmountChange = (id: string, value: number) => {
    setListProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, amount: value } : item,
      ),
    );
  };

  const filteredProducts = useMemo(() => {
    if (!products?.items) return [];
    return products.items
      .filter((p) => p.id !== currentProduct?.id)
      .filter(
        (p: ProductItem) => !listProducts.some((lp) => lp.product.id === p.id),
      );
  }, [currentProduct?.id, products?.items, listProducts]);

  const maxParentStock = useMemo(() => {
    if (listProducts.length === 0) return 0;

    // Tính số lượng tối đa có thể tạo cho từng bundle item
    const possibleCounts = listProducts.map(({ product, amount }) => {
      if (!product.stock || amount <= 0) return 0;
      return Math.floor(product.stock / amount);
    });

    // Lấy giá trị nhỏ nhất làm giới hạn chung
    return Math.min(...possibleCounts);
  }, [listProducts]);

  // ✅ Khởi tạo listProducts từ currentProduct.bundles (nếu có)
  useEffect(() => {
    if (currentProduct?.bundles?.length) {
      const initialBundles: SelectedProduct[] = currentProduct.bundles.map(
        (b) => {
          const preferredPackage = getPreferredPackageSize(b.bundle_item);

          return {
            product: b.bundle_item,
            amount: b.quantity,
            length: preferredPackage.length,
            width: preferredPackage.width,
            height: preferredPackage.height,
            weight: preferredPackage.weight,
          };
        },
      );

      setListProducts(initialBundles);
    }
  }, [currentProduct]);

  // ✅ Cập nhật vào form mỗi khi listProducts thay đổi
  useEffect(() => {
    const bundles = listProducts.map((item) => ({
      product_id: item.product.id,
      quantity: item.amount,
      length: item.length,
      width: item.width,
      height: item.height,
      weight: item.weight,
      cost: item.product.cost,
    }));
    setValue("bundles", bundles);
  }, [listProducts, setValue]);

  useEffect(() => {
    if (maxParentStock > 0) {
      setValue("stock", maxParentStock);
    }
  }, [maxParentStock, setValue]);

  return (
    <div className="space-y-6">
      <div className="col-span-2 flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="flex-1 justify-between py-1 h-12"
            >
              Select Products
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] z-[80] pointer-events-auto">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search product..."
                value={queryParams}
                onValueChange={(value) => setQueryParams(value)}
              />
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup className="h-[400px] overflow-y-scroll">
                {isLoading ||
                  (!products && <CommandItem disabled>Loading...</CommandItem>)}
                {isError && (
                  <CommandItem disabled>Error loading products</CommandItem>
                )}
                {filteredProducts.length === 0 && !isLoading && (
                  <CommandItem disabled>All products added</CommandItem>
                )}

                {filteredProducts?.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id ?? ""}
                    onSelect={() => handleSelectProduct(product)}
                    className="flex w-full justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={
                          product.static_files.length > 0
                            ? product.static_files[0].url
                            : "/product-placeholder.png"
                        }
                        height={25}
                        width={25}
                        alt=""
                        className="rounded-"
                        unoptimized
                      />
                      <span>{product.name}</span>
                    </div>
                    <span>#{product.id_provider}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Danh sách sản phẩm đã chọn */}
      <div className="flex flex-col gap-3">
        {listProducts.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-3">
              <h3 className="text-sm font-medium text-muted-foreground col-span-3">
                Selected products
              </h3>
              <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                Amount
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {listProducts.map(({ product, amount }) => (
                <div
                  className="flex gap-3 items-center justify-between"
                  key={product.id}
                >
                  <div
                    key={product.id}
                    className="grid grid-cols-4 gap-3 flex-1"
                  >
                    <div className="flex lg:col-span-3 col-span-4 items-center gap-3 border rounded-md p-2 hover:bg-accent/40 transition">
                      <Image
                        src={
                          product.static_files?.[0]?.url ??
                          "/product-placeholder.png"
                        }
                        width={50}
                        height={50}
                        alt=""
                        className="rounded-sm !h-[40px] object-cover"
                        unoptimized
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          #{product.id_provider}
                        </span>
                      </div>
                      <Link
                        href={`/product/${product.url_key}`}
                        target="_blank"
                      >
                        <Eye
                          className="text-secondary cursor-pointer"
                          size={18}
                        />
                      </Link>
                    </div>

                    <Input
                      type="number"
                      min={1}
                      value={amount}
                      onChange={(e) =>
                        handleAmountChange(product.id, Number(e.target.value))
                      }
                      className="lg:h-full lg:col-span-1 col-span-4 h-10"
                    />
                  </div>
                  <RemoveBundleDialog
                    product={product}
                    setListProducts={setListProducts}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectBundleComponent;
