"use client";

import { POColumns } from "@/components/layout/admin/incoming-inventory/po-columns";
import InventoryTableToolbar from "@/components/layout/admin/inventory/inventory-table-toolbar";
import PurchaseOrderSearch from "@/components/layout/admin/inventory/purchase-order-search";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllInventoryPo } from "@/features/incoming-inventory/inventory/hook";
import { useGetAllPurchaseOrders } from "@/features/incoming-inventory/po/hook";
import { useRouter } from "@/src/i18n/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { InventoryPOItem } from "@/types/po";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Image from "next/image";
import { format, getISOWeek } from "date-fns";

const formatISOWeek = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const week = getISOWeek(date);
  return `CW ${String(week).padStart(2, "0")} - ${format(date, "MMMM d")}`;
};

const IncomingInventoryList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [inventoryPoPage, setInventoryPoPage] = useState(1);
  const [inventoryPoPageSize, setInventoryPoPageSize] = useState(50);
  const [activeTab, setActiveTab] = useState("purchase-orders");

  const searchParams = useSearchParams();
  const router = useRouter();

  // ⚡ Cập nhật URL mỗi khi page thay đổi
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // 🧩 Khi user back lại (hoặc reload), đọc page từ URL
  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    setPage(urlPage);
  }, [searchParams]);

  const search = searchParams.get("search") ?? undefined;
  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = React.useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [multiSearchRaw],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetAllPurchaseOrders({
    search: multiSearchValues.length > 0 ? multiSearchValues : undefined,
  });
  const {
    data: inventoryPoData,
    isLoading: isInventoryPoLoading,
    isError: isInventoryPoError,
  } = useAllInventoryPo(search);

  const inventoryPoColumns: ColumnDef<InventoryPOItem>[] = [
    {
      accessorKey: "static_files",
      header: "IMAGE",
      cell: ({ row }) => {
        const image =
          row.original.product.static_files &&
          row.original.product.static_files.length > 0
            ? row.original.product.static_files[0].url
            : "";

        return (
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="w-12 h-12 relative cursor-pointer">
                {image ? (
                  <Image
                    src={image}
                    fill
                    alt="icon"
                    className="object-contain rounded-md"
                    sizes="60px"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md" />
                )}
              </div>
            </HoverCardTrigger>

            {image && (
              <HoverCardContent className="p-2 w-55 h-55 flex items-center justify-center">
                <Image
                  src={image}
                  alt="preview"
                  width={200}
                  height={200}
                  className="object-contain rounded-md"
                  unoptimized
                />
              </HoverCardContent>
            )}
          </HoverCard>
        );
      },
    },
    {
      accessorKey: "product.id_provider",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product?.id_provider ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "product.name",
      // meta: { width: 400 },
      header: () => <div className="text-center">Product</div>,
      cell: ({ row }) => (
        <div className="text-start">{row.original.product?.name ?? "—"}</div>
      ),
    },

    {
      accessorKey: "product.sku",
      header: () => <div className="text-center">SKU</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.product?.sku ?? "—"}</div>
      ),
    },
    {
      accessorKey: "product.ean",
      header: () => <div className="text-center">EAN</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.product?.ean ?? "—"}</div>
      ),
    },
    {
      accessorKey: "product.po_number",
      header: () => <div className="text-center">PO Number</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.container.purchase_order.po_number ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "container.date_to_warehouse",
      header: () => <div className="text-center">Estimated arrived date</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {formatISOWeek(row.original.container?.date_to_warehouse)}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.quantity ?? 0}</div>
      ),
    },

    {
      accessorKey: "total_cost",
      header: () => <div className="text-center">Total Cost</div>,
      cell: ({ row }) => (
        <div className="text-right">
          €{Number(row.original.total_cost ?? 0).toFixed(2)}
        </div>
      ),
    },
  ];

  const inventoryPoItems = inventoryPoData ?? [];
  const purchaseOrderItems = data ?? [];
  const purchaseOrderPageStart = (page - 1) * pageSize;
  const purchaseOrderPageItems = purchaseOrderItems.slice(
    purchaseOrderPageStart,
    purchaseOrderPageStart + pageSize,
  );
  const inventoryPoTotal = inventoryPoItems.length;
  const inventoryPoTotalPages = Math.max(
    1,
    Math.ceil(inventoryPoTotal / inventoryPoPageSize),
  );
  const inventoryPoPageStart = (inventoryPoPage - 1) * inventoryPoPageSize;
  const inventoryPoPageItems = inventoryPoItems.slice(
    inventoryPoPageStart,
    inventoryPoPageStart + inventoryPoPageSize,
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const isPurchaseOrdersPending = isLoading || isFetching;
  const purchaseOrderTotalPages = Math.max(
    1,
    Math.ceil(purchaseOrderItems.length / pageSize),
  );

  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const wrapper = tableWrapRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const bottomPadding = 24; // matches pb-6
      const available = window.innerHeight - rect.top - bottomPadding;
      setTableHeight(Math.max(240, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [data, isLoading]);

  if (isError) return <div>No data</div>;

  return (
    <div className="h-screen flex flex-col gap-6 pb-6 overflow-hidden">
      <div className="text-3xl text-secondary font-bold text-center">
        Purchase Orders
      </div>

      <InventoryTableToolbar
        pageSize={activeTab === "purchase-orders" ? pageSize : inventoryPoPageSize}
        setPageSize={
          activeTab === "purchase-orders"
            ? setPageSize
            : setInventoryPoPageSize
        }
        addButtonText="Add Product"
        addButtonUrl="/admin/products/add"
        setPage={activeTab === "purchase-orders" ? setPage : setInventoryPoPage}
        searchContent={
          activeTab === "purchase-orders" ? <PurchaseOrderSearch /> : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="inventory-po">Incoming Items</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-orders">
          {isPurchaseOrdersPending ? (
            <ProductTableSkeleton />
          ) : (
            <div
              ref={tableWrapRef}
              className="min-h-0"
              style={tableHeight ? { height: `${tableHeight}px` } : undefined}
            >
              <ProductTable
                data={purchaseOrderPageItems}
                columns={POColumns}
                page={page}
                pageSize={pageSize}
                setPage={handlePageChange}
                setPageSize={setPageSize}
                totalItems={purchaseOrderItems.length}
                totalPages={purchaseOrderTotalPages}
                hasHeaderBackGround
                isSticky
                stickyContainerClassName="h-full"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory-po">
          {isInventoryPoError ? (
            <div>No data</div>
          ) : isInventoryPoLoading ? (
            <ProductTableSkeleton />
          ) : (
            <div
              ref={tableWrapRef}
              className="min-h-0"
              style={tableHeight ? { height: `${tableHeight}px` } : undefined}
            >
              <ProductTable
                data={inventoryPoPageItems}
                columns={inventoryPoColumns}
                page={inventoryPoPage}
                pageSize={inventoryPoPageSize}
                setPage={setInventoryPoPage}
                setPageSize={setInventoryPoPageSize}
                totalItems={inventoryPoTotal}
                totalPages={inventoryPoTotalPages}
                hasHeaderBackGround
                isSticky
                stickyContainerClassName="h-full"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncomingInventoryList;
