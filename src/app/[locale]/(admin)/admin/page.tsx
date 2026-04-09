"use client";
import EcommerceDashboard from "@/components/layout/admin/dashboard/ecommerce-dashboard";
import OrderB2BFilter from "@/components/layout/admin/orders/order-list/filter/filter-order-b2b";
import OrderDateFilter from "@/components/layout/admin/orders/order-list/filter/filter-order-date";
import { useOrderListFilters } from "@/hooks/admin/order-list/useOrderListFilter";
import { Building2, CalendarRange } from "lucide-react";
import React from "react";

const AdminPage = () => {
  const filters = useOrderListFilters();

  return (
    <div className="space-y-6 pb-8">
      <div className="mt-6 rounded-2xl border bg-card p-4 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Admin Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Prestige Home GmbH
            </h1>
          </div>

          <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-[920px]">
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                Date Range
              </div>
              <OrderDateFilter />
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Customer Segment
              </div>
              <OrderB2BFilter showRevenue={false} />
            </div>
          </div>
        </div>
      </div>

      <EcommerceDashboard
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        isB2B={filters.isB2B}
      />
    </div>
  );
};

export default AdminPage;
