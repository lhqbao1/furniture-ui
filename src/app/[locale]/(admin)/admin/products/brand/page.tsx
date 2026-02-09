"use client";
import AddBrandDialog from "@/components/layout/admin/products/brand/add-brand-dialog";
import AddBrandForm from "@/components/layout/admin/products/brand/add-brand-form";
import { brandColumns } from "@/components/layout/admin/products/brand/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetBrands } from "@/features/brand/hook";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ExportBrand from "@/components/layout/admin/products/brand/export-button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BrandListPage = () => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasShownSpaceToast, setHasShownSpaceToast] = useState(false);

  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);

  const defaultSearch = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(defaultSearch);

  const { data, isLoading, isError } = useGetBrands();

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
      setTableHeight(Math.max(240, available));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [data, isLoading]);

  if (isError) return <div>No data</div>;

  return (
    <div className="h-screen flex flex-col gap-6 pb-6 overflow-hidden">
      <div className="space-y-6">
        <div className="section-header">Brands List</div>
        <div>
          <div className="flex justify-end gap-2 mb-3">
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
            <AddBrandDialog />
            {data && <ExportBrand brands={data} isFetching={isLoading} />}
          </div>
          {isLoading || !data ? (
            <ProductTableSkeleton />
          ) : (
            <div
              ref={tableWrapRef}
              className="min-h-0"
              style={tableHeight ? { height: `${tableHeight}px` } : undefined}
            >
              <ProductTable
                data={data ? data : []}
                columns={brandColumns}
                page={page}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
                totalItems={data.length}
                totalPages={data.length / pageSize}
                addButtonText="Add Brand"
                isAddButtonModal
                addButtonModalContent={<AddBrandForm />}
                hasHeaderBackGround
                isSticky
                stickyContainerClassName="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandListPage;
