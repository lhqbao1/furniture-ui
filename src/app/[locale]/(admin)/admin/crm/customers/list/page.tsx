"use client";
import { customerColumns } from "@/components/layout/admin/customers/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/shared/admin-back-button";
import ProductTableSkeleton from "@/components/shared/table-skeleton";
import { useGetAllCustomers } from "@/features/users/hook";
import React, { useState } from "react";
import CustomerListSkeleton from "./skeleton";
import CustomerToolbar, {
  ToolbarType,
} from "@/components/layout/admin/customers/customer-toolbar";

const CustomerListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetAllCustomers();

  if (isError) return <div>No data</div>;
  if (isLoading) return <CustomerListSkeleton />;

  return (
    <div className="space-y-6">
      <AdminBackButton />
      <div className="space-y-6">
        <div className="text-3xl text-secondary font-bold text-center">
          Customers List
        </div>
        <CustomerToolbar
          pageSize={pageSize}
          setPageSize={setPageSize}
          setPage={setPage}
          type={ToolbarType.customer}
        />
        {isLoading || !data ? (
          <ProductTableSkeleton />
        ) : (
          <ProductTable
            data={data ? data : []}
            columns={customerColumns}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            totalItems={data?.length}
            totalPages={Math.ceil((data?.length ?? 0) / pageSize)}
            addButtonText="none"
            hasHeaderBackGround
          />
        )}
      </div>
    </div>
  );
};

export default CustomerListPage;
