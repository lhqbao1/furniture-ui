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
import ImportInventoryDialog from "./dialog/import-dialog";
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
}

export default function InventoryTableToolbar({
  pageSize,
  setPageSize,
  setPage,
  isInventory,
  filterContent,
  searchContent,
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

  // push URL khi debounce hoàn thành
  useEffect(() => {
    if (usesCustomSearch) return;

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
    searchParams,
    setPage,
    usesCustomSearch,
  ]);

  return (
    <div className="w-full p-2">
      <div className="flex items-start justify-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex text-sm font-medium">
            <ImportStockSupplierDialog
              setIsImporting={setIsImporting}
              isSupplier
            />
          </div>

          {!isInventory && (
            <div className="flex text-sm font-medium">
              <ImportInventoryDialog setIsImporting={setIsImporting} />
            </div>
          )}
        </div>

        <div className="w-full min-w-0 max-w-2xl">
          {searchContent ?? (
            <Input
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
        </div>

        <div className="w-full sm:w-[140px]">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="border text-black cursor-pointer">
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
            <Button variant="outline" className="flex items-center gap-1">
              Filter <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[800px] px-8 py-4">
            {resolvedFilterContent}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isInventory && (
          <Button
            variant={"secondary"}
            onClick={() =>
              router.push("/admin/logistic/inventory/incoming/add")
            }
          >
            Add PO
          </Button>
        )}
      </div>
    </div>
  );
}
