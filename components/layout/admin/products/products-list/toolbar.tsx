"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilterForm from "./toolbar/filter";
import ImportDialog from "./toolbar/import";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import OrderFilterForm from "../../orders/order-list/filter/filter-form";
import { useSearchParams } from "next/navigation";
import FilterExportForm from "./toolbar/filter-export-dialog";
import { cn } from "@/lib/utils";
import UpdateStatusDialog from "./toolbar/bulk-update/status-dialog";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface TableToolbarProps {
  searchQuery?: string;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  type: ToolbarType;
  product_ids?: string[];
  columnOptions?: { id: string; label: string; alwaysVisible?: boolean }[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
}

type ImageFile = {
  url: string;
};

const FILTER_KEYS = ["search", "status", "channel", "from_date", "to_date"];

export default function TableToolbar({
  searchQuery,
  pageSize,
  setPageSize,
  setPage,
  setSearchQuery,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  type,
  product_ids,
  columnOptions,
  columnVisibility,
  onColumnVisibilityChange,
}: TableToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasShownSpaceToast, setHasShownSpaceToast] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);

  const pathname = usePathname();
  const defaultSearch = searchParams.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [prevParams, setPrevParams] = useState(
    Object.fromEntries(searchParams.entries()),
  );
  // debounce inputValue
  const [debouncedSearch] = useDebounce(searchValue, 600);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    const current = Object.fromEntries(searchParams.entries());

    const filterChanged = FILTER_KEYS.some((k) => current[k] !== prevParams[k]);

    if (filterChanged) {
      router.push(
        {
          pathname,
          query: { ...current, page: 1 },
        },
        { scroll: false },
      );
      setPage(1);
    }

    setPrevParams(current);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentSearch) {
      router.push(
        {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            search: debouncedSearch || "",
          },
        },
        { scroll: false },
      );
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 w-full flex-wrap lg:flex-nowrap">
      {/* Left group */}
      <div className="flex items-center lg:gap-4 gap-2 flex-wrap lg:flex-nowrap ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              Group action <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setOpenUpdateStatus(true)}>
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem>Export Selected</DropdownMenuItem>
          </DropdownMenuContent>
          <UpdateStatusDialog
            open={openUpdateStatus}
            onOpenChange={setOpenUpdateStatus}
            productIds={product_ids ?? []}
          />
        </DropdownMenu>

        <div className="flex gap-2 text-sm font-medium">
          {/* <Button variant="ghost" className="">Export</Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Export <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[600px] p-4 space-y-4">
              {/* Filter here */}
              <FilterExportForm />
            </DropdownMenuContent>
          </DropdownMenu>
          <ImportDialog setIsImporting={setIsImporting} isSupplier />
        </div>
      </div>

      {/* Search (auto, no button) */}
      <div className="flex items-center w-full flex-1 flex-wrap lg:flex-nowrap">
        <Input
          placeholder="Search"
          className={cn(
            searchValue.includes(" ") &&
              "border-yellow-400 focus-visible:ring-yellow-400",
          )}
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;

            // ✅ nếu có dấu cách
            if (value.includes(" ")) {
              if (!hasShownSpaceToast) {
                toast.warning(
                  "Your search contains spaces. Please check your keyword.",
                );
                setHasShownSpaceToast(true);
              }
            } else {
              // reset khi user xoá hết dấu cách
              setHasShownSpaceToast(false);
            }

            setSearchValue(value);
          }}
        />
      </div>

      {/* Right group */}
      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap justify-center lg:justify-start">
        <div>
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
            <Button variant="ghost" className="flex items-center gap-1">
              Filter <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[800px] px-8 py-4">
            {type === ToolbarType.product && <FilterForm />}
            {type === ToolbarType.order && <OrderFilterForm />}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              View <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columnOptions && columnOptions.length > 0 ? (
              <>
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columnOptions.map((column) => {
                  const checked = columnVisibility?.[column.id] ?? true;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={checked}
                      disabled={column.alwaysVisible}
                      onCheckedChange={(value) => {
                        onColumnVisibilityChange?.(column.id, Boolean(value));
                      }}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </>
            ) : (
              <>
                <DropdownMenuItem>Compact</DropdownMenuItem>
                <DropdownMenuItem>Comfortable</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {!columnOptions?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Stock</DropdownMenuItem>
              <DropdownMenuItem>Price</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {addButtonText && (
          <Button
            className="bg-primary hover:bg-primary font-semibold"
            onClick={() => {
              if (addButtonUrl) {
                router.push(addButtonUrl, { locale });
              } else if (isAddButtonModal) {
                setOpenAddModal(true);
              }
            }}
          >
            {addButtonText}
          </Button>
        )}
      </div>
      {/* <Button
        variant={"secondary"}
        onClick={() => handleDownloadZip()}
      >
        Download images
      </Button> */}

      {isAddButtonModal && (
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogContent className="w-1/3">
            <DialogHeader>
              <DialogTitle>{addButtonText}</DialogTitle>
            </DialogHeader>
            {addButtonModalContent &&
              React.cloneElement(
                addButtonModalContent as React.ReactElement<{
                  onClose?: () => void;
                }>,
                { onClose: () => setOpenAddModal(false) },
              )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
