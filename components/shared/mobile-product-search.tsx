"use client";

import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Search, X } from "lucide-react";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { ProductItem } from "@/types/products";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSetAtom } from "jotai";
import { addSearchKeywordAtom } from "@/store/search";
import { useSearchParams } from "next/navigation";

export default function MobileProductSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const addSearchKeyword = useSetAtom(addSearchKeywordAtom);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isShopAllPage = pathname.includes("shop-all");

  // debounce query
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: products, isLoading } = useGetProductsSelect({
    search: debouncedQuery,
    is_econelo: false,
    all_products: true,
  });
  const results = products ?? [];

  function handleSubmit() {
    const value = query.trim();
    if (!value) return;

    addSearchKeyword(value);
    setOpen(false);

    // clone params hiện tại
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);

    if (isShopAllPage) {
      // ✅ đang ở /shop-all → chỉ update query
      router.replace(`/shop-all?${params.toString()}`, { locale });
    } else {
      // ✅ chưa ở /shop-all → điều hướng sang
      router.push(`/shop-all?${params.toString()}`, { locale });
    }
  }

  return (
    <div className="lg:hidden">
      <Drawer
        open={open}
        onOpenChange={setOpen}
        direction="left"
      >
        <DrawerTrigger asChild>
          <div
            aria-label={t("searchProduct")}
            className=""
          >
            <Search
              stroke="#4D4D4D"
              className="cursor-pointer hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
            />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full h-full flex flex-col p-0 data-[vaul-drawer-direction=left]:w-full duration-500 overflow-hidden">
          <DrawerTitle className="border-b-2 p-4 flex justify-between">
            <div className="uppercase font-bold text-xl">
              {t("searchProduct")}
            </div>
            <DrawerClose>
              <X />
            </DrawerClose>
          </DrawerTitle>
          <Command
            className="h-full w-full"
            shouldFilter={false}
          >
            <div className="p-2 border-b">
              <CommandInput
                placeholder={t("searchProduct")}
                value={query}
                onValueChange={setQuery}
                autoFocus
                className="border-b-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
            <CommandList className="flex-1 overflow-auto pt-2">
              {isLoading && <CommandEmpty>{t("loading")}...</CommandEmpty>}
              {!isLoading && results.length === 0 && (
                <CommandEmpty>{t("noResult")}</CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup>
                  {results.map((product: ProductItem) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => {
                        router.push(`/product/${product.url_key}`, { locale });
                        setQuery("");
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex gap-3 flex-1 items-center">
                          <Image
                            src={
                              product.static_files &&
                              product.static_files.length > 0
                                ? product.static_files[0].url
                                : "/placeholder-product.webp"
                            }
                            height={50}
                            width={50}
                            alt=""
                            className="h-12 w-12"
                            unoptimized
                          />
                          <div className="font-semibold line-clamp-2">
                            {product.name}
                          </div>
                        </div>
                        <div className="text-[#666666]">
                          {product.id_provider}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
