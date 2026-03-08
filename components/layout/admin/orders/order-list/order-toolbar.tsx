"use client";

import React, { useEffect, useState } from "react";
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
}

const FILTER_KEYS = ["search", "status", "channel", "from_date", "to_date"];

export default function OrderToolbar({
  pageSize,
  setPageSize,
  setPage,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  type,
  selectedOrders = [],
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
  const [prevParams, setPrevParams] = useState(
    Object.fromEntries(searchParams.entries()),
  );
  const [debouncedSearch] = useDebounce(searchValue, 600);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    const current = Object.fromEntries(searchParams.entries());

    // check filter changed
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
            search: debouncedSearch,
          },
        },
        { scroll: false },
      );
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 w-full flex-wrap lg:flex-nowrap">
      {/* Left group */}
      <div className="lg:flex items-center lg:gap-4 gap-2 flex-nowrap hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              Group action <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuItem>Delete Selected</DropdownMenuItem> */}
            <DropdownMenuItem>Export Selected</DropdownMenuItem>
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

        <div className="flex gap-2 text-sm font-medium">
          <ExportOrderExcelButton />
          <OrderImport />
        </div>
      </div>

      {/* Search (auto, no button) */}
      <div className="flex items-center w-full flex-1 flex-nowrap gap-2">
        <MultiSearch />
        <Input
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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
              <SelectItem value="300">300 rows</SelectItem>
              <SelectItem value="500">500 rows</SelectItem>
              <SelectItem value="1000">1000 rows</SelectItem>
              <SelectItem value="2000">2000 rows</SelectItem>
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
            {/* {type === ToolbarType.product && <FilterForm />} */}
            {type === ToolbarType.order && <OrderFilterForm />}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              View <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Compact</DropdownMenuItem>
            <DropdownMenuItem>Comfortable</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

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
