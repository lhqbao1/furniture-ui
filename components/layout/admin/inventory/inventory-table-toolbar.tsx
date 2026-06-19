"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import InventoryFilterForm from "./filter-form";
import ImportStockSupplierDialog from "./import-stock-supplier";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface InventoryTableToolbarProps {
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  isInventory?: boolean;
  filterContent?: React.ReactNode;
  searchContent?: React.ReactNode;
  searchByEnter?: boolean;
}

export default function InventoryTableToolbar({
  pageSize,
  setPageSize,
  setPage,
  isInventory,
  filterContent,
  searchContent,
  searchByEnter = false,
}: InventoryTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [, setIsImporting] = useState(false);
  const pathname = usePathname();
  const defaultSearch = searchParams.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(defaultSearch);
  const resolvedFilterContent = filterContent ?? <InventoryFilterForm />;
  const usesCustomSearch = Boolean(searchContent);

  // debounce inputValue
  const [debouncedSearch] = useDebounce(searchValue, 600);

  const applySearch = React.useCallback(() => {
    if (usesCustomSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    const normalizedSearch = searchValue.trim();
    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    } else {
      params.delete("search");
    }

    router.push(
      {
        pathname,
        query: Object.fromEntries(params.entries()),
      },
      { scroll: false },
    );

    setPage(1);
  }, [pathname, router, searchParams, searchValue, setPage, usesCustomSearch]);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    if (usesCustomSearch || searchByEnter) return;

    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch === currentSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    router.push(
      {
        pathname,
        query: Object.fromEntries(params.entries()),
      },
      { scroll: false },
    );

    setPage(1);
  }, [
    debouncedSearch,
    pathname,
    router,
    searchByEnter,
    searchParams,
    setPage,
    usesCustomSearch,
  ]);

  return (
    <div className="w-full rounded-2xl border border-secondary/15 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="w-full min-w-0 md:flex-1">
          {searchContent ?? (
            <Input
              placeholder={searchByEnter ? "Search (press Enter)" : "Search"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(event) => {
                if (!searchByEnter) return;
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
            />
          )}
        </div>

        <div className="grid w-full grid-cols-3 gap-2 md:w-fit md:grid-cols-[140px_110px_110px]">
          <div className="min-w-0">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-full cursor-pointer border bg-white text-black">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 rows</SelectItem>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex w-full items-center gap-1">
                Filter <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[80vh] w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:w-[800px] sm:px-8">
              {resolvedFilterContent}
            </DropdownMenuContent>
          </DropdownMenu>

          {isInventory ? (
            <div className="flex min-w-0 [&_button]:w-full">
              <ImportStockSupplierDialog
                setIsImporting={setIsImporting}
                isSupplier
              />
            </div>
          ) : (
            <Button
              variant={"secondary"}
              className="w-full"
              onClick={() =>
                router.push("/admin/logistic/inventory/incoming/add")
              }
            >
              Add PO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
