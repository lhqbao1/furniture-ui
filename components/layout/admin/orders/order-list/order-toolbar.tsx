"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import OrderFilterForm from "../../orders/order-list/filter/filter-form";
import { useSearchParams } from "next/navigation";
import ExportOrderExcelButton from "./export-button";
import OrderImport from "./order-import";
import { CheckOutMain } from "@/types/checkout";
import { toast } from "sonner";
import MultiSearch from "../../products/products-list/toolbar/multi-search";
import B2BInvoiceDrawer from "./b2b-invoice-drawer";
import OrderB2BFilter from "./filter/filter-order-b2b";
import { exportOrderListTemplateToExcel } from "./export-order-template";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface OrderToolbarProps {
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  type: ToolbarType;
  selectedOrders?: CheckOutMain[];
  showB2BRevenue?: boolean;
  exportPresetStatuses?: string[];
  lockExportStatuses?: boolean;
  expandExportByRefundItems?: boolean;
}

const FILTER_KEYS = [
  "search",
  "status",
  "channel",
  "from_date",
  "to_date",
  "is_b2b",
];

export default function OrderToolbar({
  pageSize,
  setPageSize,
  setPage,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  type,
  selectedOrders = [],
  showB2BRevenue = true,
  exportPresetStatuses,
  lockExportStatuses = false,
  expandExportByRefundItems = false,
}: OrderToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openB2BDrawer, setOpenB2BDrawer] = useState(false);
  const [b2bMarketplace, setB2BMarketplace] = useState<string>("");
  const defaultSearch = searchParams.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(defaultSearch);
  const prevParamsRef = useRef(Object.fromEntries(searchParams.entries()));
  const [debouncedSearch] = useDebounce(searchValue, 600);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    const current = Object.fromEntries(searchParams.entries());
    const previous = prevParamsRef.current;

    // check filter changed
    const filterChanged = FILTER_KEYS.some((k) => current[k] !== previous[k]);

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

    prevParamsRef.current = current;
  }, [pathname, router, searchParams, setPage]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentSearch) {
      router.push(
        {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            search: debouncedSearch,
          },
        },
        { scroll: false },
      );
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  return (
    <div className="w-full rounded-2xl border border-secondary/15 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-1 items-center gap-2">
            <MultiSearch />
            <Input
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[120px] border text-black cursor-pointer">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 rows</SelectItem>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="300">300 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
                <SelectItem value="1000">1000 rows</SelectItem>
                <SelectItem value="2000">2000 rows</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-1">
                  Filter <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[95vw] max-w-[920px] p-4 md:p-6">
                {type === ToolbarType.order && <OrderFilterForm />}
              </DropdownMenuContent>
            </DropdownMenu>

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
        </div>

        {type === ToolbarType.order ? (
          <div className="rounded-xl border border-secondary/10 bg-muted/20 p-3 w-full xl:w-1/2">
            <OrderB2BFilter showRevenue={showB2BRevenue} />
          </div>
        ) : null}

        <div className="flex w-full flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Group action <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  if (selectedOrders.length === 0) {
                    toast.info("No order selected");
                    return;
                  }

                  exportOrderListTemplateToExcel(
                    selectedOrders,
                    "order_export_selected.xlsx",
                  );
                }}
              >
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  if (selectedOrders.length === 0) {
                    toast.info("No order selected");
                    return;
                  }

                  const missingExternalId = selectedOrders.filter(
                    (order) => !order.marketplace_order_id?.trim(),
                  );
                  const missingMarketplace = selectedOrders.filter(
                    (order) => !order.from_marketplace?.trim(),
                  );

                  const marketplaces = Array.from(
                    new Set(
                      selectedOrders
                        .map((order) => order.from_marketplace?.trim())
                        .filter((value): value is string => Boolean(value)),
                    ),
                  );

                  const errors: string[] = [];

                  if (missingExternalId.length > 0) {
                    errors.push(
                      `Missing external ID: ${missingExternalId
                        .map((order) => order.checkout_code || order.id)
                        .join(", ")}`,
                    );
                  }

                  if (missingMarketplace.length > 0) {
                    errors.push(
                      `Missing marketplace: ${missingMarketplace
                        .map((order) => order.checkout_code || order.id)
                        .join(", ")}`,
                    );
                  }

                  if (marketplaces.length > 1) {
                    errors.push(
                      `Orders must be in one marketplace. Found: ${marketplaces.join(", ")}`,
                    );
                  }

                  if (errors.length > 0) {
                    toast.error("Cannot create B2B invoice", {
                      description: (
                        <div className="flex flex-col gap-1">
                          {errors.map((error) => (
                            <div key={error}>- {error}</div>
                          ))}
                        </div>
                      ),
                    });
                    return;
                  }

                  const marketplace = marketplaces[0] ?? "";
                  setB2BMarketplace(marketplace);
                  setOpenB2BDrawer(true);
                }}
              >
                Create B2B Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <ExportOrderExcelButton
              presetStatuses={exportPresetStatuses}
              lockStatusSelection={lockExportStatuses}
              expandByProductRefund={expandExportByRefundItems}
            />
            <OrderImport />
          </div>
        </div>
      </div>

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

      <B2BInvoiceDrawer
        open={openB2BDrawer}
        onOpenChange={setOpenB2BDrawer}
        marketplace={b2bMarketplace}
        selectedOrders={selectedOrders}
      />
    </div>
  );
}
