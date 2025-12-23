"use client";

import * as React from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { Link, useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { useProductsAlgoliaSearch } from "@/features/products/hook";
import { useAtomValue, useSetAtom } from "jotai";
import { addSearchKeywordAtom, searchHistoryAtom } from "@/store/search";

/* ---------------------------------- */

export default function ProductSearch({
  height,
  isAdmin = false,
}: {
  height?: boolean;
  isAdmin?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isShopAllPage = pathname.includes("shop-all");

  /* ---------------- STATE ---------------- */

  const searchFromUrl = searchParams.get("search") ?? "";

  const [query, setQuery] = React.useState(searchFromUrl);
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchFromUrl);
  const [open, setOpen] = React.useState(false);

  const history = useAtomValue(searchHistoryAtom);
  const addSearchKeyword = useSetAtom(addSearchKeywordAtom);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  /* ----------- SYNC URL → STATE (ONLY shop-all) ----------- */

  React.useEffect(() => {
    if (!isShopAllPage) return;

    setQuery(searchFromUrl);
    setDebouncedQuery(searchFromUrl);
  }, [searchFromUrl, isShopAllPage]);

  /* ---------------- DEBOUNCE ---------------- */

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  /* ---------------- FETCH ---------------- */

  const { data, isLoading } = useProductsAlgoliaSearch({
    query: debouncedQuery,
    is_econelo: false,
  });

  const results = data?.items ?? [];

  /* ----------- SYNC STATE → URL (shop-all only) ----------- */

  React.useEffect(() => {
    if (!isShopAllPage) return;

    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("search") ?? "";

    if (current === debouncedQuery) return;

    if (debouncedQuery) {
      params.set("search", debouncedQuery);
    } else {
      params.delete("search");
    }

    router.replace(`/shop-all?${params.toString()}`, { locale });
  }, [debouncedQuery, isShopAllPage]);

  /* ---------------- DROPDOWN ---------------- */

  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>(
    {},
  );

  React.useEffect(() => {
    if (!open || !inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [open, query]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- ENTER SEARCH ---------------- */

  function handleSubmit() {
    const value = query.trim();
    if (!value) return;

    addSearchKeyword(value);
    setOpen(false);

    if (!isShopAllPage) {
      router.push(
        { pathname: "/shop-all", query: { search: value } },
        { locale },
      );
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center gap-2"
    >
      <div
        className={cn(
          "relative flex w-3/4 flex-col",
          height && "mr-0",
          isAdmin && "w-full",
        )}
      >
        <div className="relative flex">
          <Input
            ref={inputRef}
            value={query}
            placeholder={`${t("search")}...`}
            className="h-10 w-full rounded-full border bg-white pl-4 xl:h-12"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          <Search
            size={22}
            className="absolute right-4 top-2.5 text-black xl:top-3"
          />
        </div>
      </div>

      {/* ---------------- DROPDOWN ---------------- */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="z-50 rounded-md bg-white shadow"
          >
            <Command
              shouldFilter={false}
              className="max-h-[300px]"
            >
              <CommandList>
                {!query && history.length > 0 && (
                  <CommandGroup heading={t("recentSearch")}>
                    {history.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() => {
                          setQuery(item);
                          inputRef.current?.focus();
                        }}
                      >
                        <Search className="mr-2 h-4 w-4 text-gray-400" />
                        {item}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {query && (
                  <>
                    <CommandEmpty>
                      {isLoading ? `${t("loading")}...` : t("noResult")}
                    </CommandEmpty>

                    {results.length > 0 && (
                      <CommandGroup>
                        {results.map((p: ProductItem) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            asChild
                          >
                            <Link
                              href={`/product/${p.url_key}`}
                              locale={locale}
                              className="flex w-full items-center gap-3"
                              onClick={() => {
                                setOpen(false);
                                setQuery("");
                              }}
                            >
                              <Image
                                src={
                                  p.static_files[0]?.url ??
                                  "/placeholder-product.webp"
                                }
                                width={48}
                                height={48}
                                alt=""
                                unoptimized
                              />
                              <span className="font-medium">{p.name}</span>
                            </Link>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </div>,
          document.body,
        )}
    </div>
  );
}
