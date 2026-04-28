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
import OrderFilterForm from "../../orders/order-list/filter/filter-form";
import { useSearchParams } from "next/navigation";
import FilterExportForm from "./toolbar/filter-export-dialog";
import { cn } from "@/lib/utils";
import UpdateStatusDialog from "./toolbar/bulk-update/status-dialog";
import ExportSelectedProducts from "./toolbar/bulk-update/export-selected";
import EANDrawer from "./toolbar/bulk-update/ean-drawer";
import MultiSearch from "./toolbar/multi-search";

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
  selectedProducts?: ProductItem[];
  columnOptions?: { id: string; label: string; alwaysVisible?: boolean }[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  isDSP?: boolean;
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
  selectedProducts,
  columnOptions,
  columnVisibility,
  onColumnVisibilityChange,
  isDSP = false,
}: TableToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasShownSpaceToast, setHasShownSpaceToast] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [openEanDrawer, setOpenEanDrawer] = useState(false);

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
    <div className="w-full rounded-2xl border border-secondary/15 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-1 items-center gap-2 rounded-xl border border-secondary/10 bg-muted/20 p-1.5">
            <MultiSearch />
            <Input
              placeholder="Search"
              className={cn(
                "h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                searchValue.includes(" ") &&
                  "border-yellow-400 focus-visible:ring-yellow-400",
              )}
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;

                if (value.includes(" ")) {
                  if (!hasShownSpaceToast) {
                    toast.warning(
                      "Your search contains spaces. Please check your keyword.",
                    );
                    setHasShownSpaceToast(true);
                  }
                } else {
                  setHasShownSpaceToast(false);
                }

                setSearchValue(value);
              }}
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-secondary/10 bg-muted/20 p-1.5 xl:w-auto xl:justify-end">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-10 w-[120px] cursor-pointer border bg-white text-black">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 rows</SelectItem>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
                <SelectItem value="2000">2000 rows</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-10 bg-secondary text-white hover:bg-secondary/90 flex items-center gap-1"
                >
                  Filter <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[95vw] max-w-[920px] p-4 md:p-6">
                {type === ToolbarType.product && <FilterForm isDSP={isDSP} />}
                {type === ToolbarType.order && <OrderFilterForm />}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 bg-white hover:bg-white/90 flex items-center gap-1"
                >
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
                  <Button
                    variant="outline"
                    className="h-10 bg-white hover:bg-white/90 flex items-center gap-1"
                  >
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
                className="h-10 bg-primary hover:bg-primary font-semibold px-4 shadow-sm"
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
        </div>

        {!isDSP && (
          <div className="flex flex-col gap-2 rounded-xl border border-secondary/10 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bulk Actions
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 bg-white hover:bg-white/90 flex items-center gap-1"
                  >
                    Group action <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setOpenUpdateStatus(true)}
                    className="cursor-pointer"
                  >
                    Update Status
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <ExportSelectedProducts
                      product_ids={product_ids ?? []}
                      products={selectedProducts ?? []}
                    />
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => setOpenEanDrawer(true)}
                  >
                    EAN
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2 text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuContent className="w-150 p-4 space-y-4">
                    <FilterExportForm />
                  </DropdownMenuContent>
                </DropdownMenu>

                <ImportDialog setIsImporting={setIsImporting} isSupplier />
              </div>
            </div>
          </div>
        )}

        <UpdateStatusDialog
          open={openUpdateStatus}
          onOpenChange={setOpenUpdateStatus}
          productIds={product_ids ?? []}
        />
        <EANDrawer
          product_ids={product_ids ?? []}
          open={openEanDrawer}
          onOpenChange={setOpenEanDrawer}
        />

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
    </div>
  );
}
