"use client";
import { orderColumns } from "@/components/layout/admin/orders/order-list/column";
import OrderExpandTable from "@/components/layout/admin/orders/order-list/expand-delivery";
import OrderToolbar from "@/components/layout/admin/orders/order-list/order-toolbar";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import TableToolbar, {
  ToolbarType,
} from "@/components/layout/admin/products/products-list/toolbar";
import { useGetCheckOutMain } from "@/features/checkout/hook";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { CheckOutMain } from "@/types/checkout";

const OrderList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedOrders, setSelectedOrders] = useState<CheckOutMain[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = useOrderListFilters();
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);
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

  const { data, isLoading, isFetching, isError } = useGetCheckOutMain({
    page,
    page_size: pageSize,
    status: filters.status, // <-- thêm
    channel: filters.channel, // <-- thêm
    from_date: filters.fromDate,
    to_date: filters.toDate,
    search: filters.search,
  });

  const multiSearchRaw = searchParams.get("multi_search") ?? "";
  const multiSearchValues = useMemo(
    () =>
      multiSearchRaw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    [multiSearchRaw],
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (multiSearchValues.length === 0) return data.items;

    const target = new Set(multiSearchValues);
    return data.items.filter((item) =>
      target.has((item.marketplace_order_id ?? "").trim().toLowerCase()),
    );
  }, [data?.items, multiSearchValues]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const wrapper = tableWrapRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const bottomPadding = 24; // matches pb-6
      const available = window.innerHeight - rect.top - bottomPadding;
      const isMobile = window.innerWidth < 768;
      setTableHeight(isMobile ? 580 : Math.max(500, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [data, isLoading]);

  if (!data && isError) {
    return <div>No data</div>;
  }

  return (
    <div className="relative flex flex-col gap-6 pb-4">
      <div className="space-y-6">
        <div className="text-3xl text-secondary font-bold text-center">
          Order List
        </div>
        <OrderToolbar
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          type={ToolbarType.order}
          selectedOrders={selectedOrders}
        />
        <ProductTable
          data={filteredItems}
          columns={orderColumns}
          page={page}
          setPage={handlePageChange}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalItems={
            multiSearchValues.length > 0
              ? filteredItems.length
              : (data?.pagination.total_items ?? 0)
          }
          totalPages={
            multiSearchValues.length > 0
              ? 1
              : (data?.pagination.total_pages ?? 0)
          }
          hasBackground
          hasExpanded
          allowMultipleExpandedRows
          renderRowSubComponent={(row) => <OrderExpandTable row={row} />}
          hasHeaderBackGround
          isSticky
          stickyContainerClassName="h-full"
          onSelectedRowsChange={(rows) => setSelectedOrders(rows)}
        />
      </div>

      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <Loader2 className="size-10 animate-spin text-secondary" />
        </div>
      )}
    </div>
  );
};

export default OrderList;
