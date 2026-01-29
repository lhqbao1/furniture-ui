"use client";
import AddBrandDialog from "@/components/layout/admin/products/brand/add-brand-dialog";
import AddBrandForm from "@/components/layout/admin/products/brand/add-brand-form";
import { brandColumns } from "@/components/layout/admin/products/brand/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { Button } from "@/components/ui/button";
import { useGetBrands } from "@/features/brand/hook";
import React, { useState } from "react";
import ExportBrand from "@/components/layout/admin/products/brand/export-button";

const BrandListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetBrands();

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-12">
        <div className="section-header">Product Brands</div>
        <div>
          <div className="flex justify-end gap-2">
            <AddBrandDialog />
            {data && (
              <ExportBrand
                brands={data}
                isFetching={isLoading}
              />
            )}
          </div>
          {isLoading || !data ? (
            <ProductTableSkeleton />
          ) : (
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandListPage;
