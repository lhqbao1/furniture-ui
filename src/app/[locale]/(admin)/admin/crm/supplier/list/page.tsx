"use client";

import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AddSupplierDialog from "@/components/layout/admin/supplier/add-or-edit-dialog";
import AddOrEditSupplierForm from "@/components/layout/admin/supplier/add-or-edit-form";
import { supplierColumns } from "@/components/layout/admin/supplier/columns";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { useGetSuppliers } from "@/features/supplier/hook";
import React, { useState } from "react";

const SupplierListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data, isLoading, isError } = useGetSuppliers();

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-12">
      <div className="section-header">Supplier</div>
      <div>
        <div className="flex justify-end">
          <AddSupplierDialog />
        </div>

        {isLoading || !data ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            data={data ? data : []}
            columns={supplierColumns}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            totalItems={data.length}
            totalPages={data.length / pageSize}
            addButtonText="Add Supplier"
            isAddButtonModal
            addButtonModalContent={<AddOrEditSupplierForm />}
            hasHeaderBackGround
          />
        )}
      </div>
    </div>
  );
};

export default SupplierListPage;
