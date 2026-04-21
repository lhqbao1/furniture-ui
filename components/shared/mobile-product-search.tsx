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
import { ProductItem } from "@/types/products";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSetAtom } from "jotai";
import { addSearchKeywordAtom } from "@/store/search";
import { useSearchParams } from "next/navigation";
import { useProductsAlgoliaSearch } from "@/features/products/hook";

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

  const shouldFetch = open && debouncedQuery.length > 0;

  const { data: products, isLoading } = useProductsAlgoliaSearch(
    shouldFetch
      ? {
          query: debouncedQuery,
          is_econelo: undefined,
          is_active: true,
          page_size: 15,
        }
      : undefined,
  );
  const results = products?.items ?? [];

  function handleSubmit() {
    const value = query.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      setOpen(false);
      params.delete("search");
      params.set("page", "1");

      const nextUrl = params.toString()
        ? `/shop-all?${params.toString()}`
        : "/shop-all";

      if (isShopAllPage) {
        router.replace(nextUrl, { locale });
      } else {
        router.push(nextUrl, { locale });
      }
      return;
    }

    addSearchKeyword(value);
    setOpen(false);
    params.set("search", value);
    params.set("page", "1");

    const nextUrl = `/shop-all?${params.toString()}`;

    if (isShopAllPage) {
      // ✅ đang ở /shop-all → chỉ update query
      router.replace(nextUrl, { locale });
    } else {
      // ✅ chưa ở /shop-all → điều hướng sang
      router.push(nextUrl, { locale });
    }
  }

  return (
    <div className="lg:hidden">
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label={t("searchProduct")}
            className="cursor-pointer"
          >
            <Search
              stroke="#4D4D4D"
              className="hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
            />
          </button>
        </DrawerTrigger>
        <DrawerContent className="z-[1200] flex h-full w-full flex-col overflow-hidden p-0 data-[vaul-drawer-direction=left]:w-full">
          <DrawerTitle className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-bold uppercase tracking-tight text-slate-900">
                {t("searchProduct")}
              </div>
              <DrawerClose
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close search drawer"
              >
                <X className="h-4 w-4" />
              </DrawerClose>
            </div>
          </DrawerTitle>
          <Command
            className="h-full w-full bg-slate-50/65"
            shouldFilter={false}
          >
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/85">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <CommandInput
                  placeholder={t("searchProduct")}
                  value={query}
                  onValueChange={setQuery}
                  autoFocus
                  className="h-11 text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
            </div>
            <CommandList className="flex-1 overflow-auto px-2 py-2">
              {isLoading && (
                <CommandEmpty className="py-10 text-sm text-slate-500">
                  {t("loading")}...
                </CommandEmpty>
              )}
              {!isLoading && results.length === 0 && (
                <CommandEmpty className="py-10 text-sm text-slate-500">
                  {query.trim().length === 0
                    ? t("searchPrompt")
                    : t("noResult")}
                </CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup className="space-y-2 p-1">
                  {results.map((product: ProductItem) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => {
                        router.push(`/product/${product.url_key}`, { locale });
                        setQuery("");
                        setOpen(false);
                      }}
                      className="cursor-pointer rounded-xl border border-transparent bg-white px-2 py-2.5 mb-3 shadow-sm transition-all duration-200 hover:border-slate-200 hover:bg-white data-[selected=true]:border-slate-200 data-[selected=true]:bg-white"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Image
                            src={
                              product.static_files &&
                              product.static_files.length > 0
                                ? product.static_files[0].url
                                : "/placeholder-product.webp"
                            }
                            height={56}
                            width={56}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                            sizes="56px"
                          />
                          <div className="line-clamp-2 text-[14px] font-semibold leading-5 text-slate-800">
                            {product.name}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {product.id_provider ?? "-"}
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
