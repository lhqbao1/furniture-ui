"use client";
export const ssr = false;
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import { useGetCheckOutByCheckOutId } from "@/features/checkout/hook";

import { formatDate, formatDateTimeString } from "@/lib/date-formated";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import SupplierOrderDetailsSkeleton from "@/components/layout/dsp/admin/order/order-details/skeleton";
import OrderOverviewSupplier from "@/components/layout/dsp/admin/order/order-details/order-overview";
import OrderDetailsShipmentSupplier from "@/components/layout/dsp/admin/order/order-details/order-shipment";
import { orderDetailItemColumnSupplier } from "@/components/layout/dsp/admin/order/order-details/order-details-items-columns";
import ShipmentInput from "@/components/layout/dsp/admin/order/order-details/shipment-input";

const SupplierOrderDetails = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const params = useParams<{ id: string }>(); // type-safe
  const checkoutId = params?.id;

  const {
    data: order,
    isLoading,
    isError,
  } = useGetCheckOutByCheckOutId(checkoutId);

  if (isLoading) return <SupplierOrderDetailsSkeleton />;
  if (isError) return <div>Error loading order</div>;
  if (!order) return <div>Error loading order</div>;

  const createdAt = formatDate(order.created_at);
  const updatedAt = formatDateTimeString(order.updated_at);

  return (
    <div className="space-y-12 pb-20 mt-6">
      <div>
        <AdminBackButton />
        <div className="text-center text-3xl text-secondary font-semibold">
          Order Details
        </div>
      </div>
      <div className="grid lg:grid-cols-12 grid-cols-2 lg:gap-12 gap-4 items-stretch">
        <div className="col-span-4 h-full">
          <OrderOverviewSupplier order={order} />
        </div>

        <div className="col-span-8 h-full">
          <OrderDetailsShipmentSupplier order={order} />
        </div>
      </div>

      <ProductTable
        data={order.cart.items}
        columns={orderDetailItemColumnSupplier(order)}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={order.cart.items.length}
        totalPages={1}
        hasPagination={false}
        hasCount={false}
        hasHeaderBackGround
      />

      {!order.shipment && (
        <div className="col-span-4">
          <ShipmentInput checkoutId={order.id} />
        </div>
      )}
      {/* <div className="flex justify-between w-full">
        {order.status !== "Pending" ? (
          <div className="flex gap-12">
            <DocumentTable
              order={order}
              invoiceCode={invoice?.invoice_code}
            />
          </div>
        ) : (
          ""
        )}
        <OrderSummary
          language={order.checkouts[0].user.language ?? ""}
          sub_total={order.total_amount_item}
          shipping_amount={order.total_shipping}
          discount_amount={Math.abs(order.voucher_amount)}
          tax={calculateVAT({
            items: invoice?.total_amount_item,
            shipping: invoice?.total_shipping,
            discount: invoice?.voucher_amount,
            taxPercent: order.tax ?? 19,
          })}
          total_amount={order.total_amount}
          payment_method={order.payment_method}
          entry_date={order.created_at}
          is_Ebay={order.from_marketplace === "ebay" ? true : false}
        />
      </div>
      <OrderDeliveryOrder data={order.checkouts} /> */}
    </div>
  );
};

export default SupplierOrderDetails;
