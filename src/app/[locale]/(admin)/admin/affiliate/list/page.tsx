"use client";

import { useMemo, useState } from "react";
import AddOrEditAffiliateDialog from "@/components/layout/admin/affiliate/add-or-edit-dialog";
import { affiliateColumns } from "@/components/layout/admin/affiliate/columns";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";
import { Input } from "@/components/ui/input";
import { useGetAffiliates } from "@/features/affiliate/hook";

export default function AffiliateListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, isError } = useGetAffiliates();

  const filteredAffiliates = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return data;

    return data.filter((affiliate) =>
      [affiliate.name, affiliate.code, affiliate.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [data, searchValue]);

  if (isError) return <div>No data</div>;

  return (
    <div className="space-y-6">
      <div className="section-header">Affiliate Management</div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name, code or id"
          className="lg:max-w-sm"
        />

        <AddOrEditAffiliateDialog />
      </div>

      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          data={filteredAffiliates}
          columns={affiliateColumns}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          totalItems={filteredAffiliates.length}
          totalPages={Math.ceil(filteredAffiliates.length / pageSize)}
          hasHeaderBackGround
        />
      )}
    </div>
  );
}
