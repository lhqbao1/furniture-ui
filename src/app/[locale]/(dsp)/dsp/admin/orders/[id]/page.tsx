"use client";
export const ssr = false;

import { orderDetailColumn } from "@/components/layout/admin/orders/order-details/columns";
import DocumentTable from "@/components/layout/admin/orders/order-details/document/document-table";
import OrderDeliveryOrder from "@/components/layout/admin/orders/order-details/order-delivery-order";
import OrderSummary from "@/components/layout/admin/orders/order-details/order-summary";
import OrderDetailOverView from "@/components/layout/admin/orders/order-details/order-overview";
import OrderDetailUser from "@/components/layout/admin/orders/order-details/order-customer";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/shared/admin-back-button";
import {
  useGetCheckOutByCheckOutId,
  useGetMainCheckOutByMainCheckOutId,
} from "@/features/checkout/hook";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { calculateVAT } from "@/lib/caculate-vat";
import { formatDate, formatDateTimeString } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOutMain } from "@/types/checkout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import SupplierOrderDetailsSkeleton from "@/components/layout/dsp/admin/order/order-details/skeleton";
import OrderOverviewSupplier from "@/components/layout/dsp/admin/order/order-details/order-overview";
import OrderDetailsShipmentSupplier from "@/components/layout/dsp/admin/order/order-details/order-shipment";

function extractCartItemsFromMain(checkOutMain: CheckOutMain): CartItem[] {
  if (!checkOutMain?.checkouts) return [];

  return (
    checkOutMain.checkouts
      // lọc bỏ exchange + cancel_exchange
      .filter((checkout) => {
        const status = checkout.status?.toLowerCase();
        return status !== "exchange" && status !== "cancel_exchange";
      })
      // sau đó mới lấy cart items
      .flatMap((checkout) =>
        checkout.cart.items.flatMap((cartGroup) => cartGroup),
      )
  );
}

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

  console.log(order);

  //   const cartItems = useMemo(() => {
  //     if (!order) return [];
  //     return extractCartItemsFromMain(order);
  //   }, [order]);

  if (isLoading) return <SupplierOrderDetailsSkeleton />;
  if (isError) return <div>Error loading order</div>;
  if (!order) return <div>Error loading order</div>;

  const createdAt = formatDate(order.created_at);
  const updatedAt = formatDateTimeString(order.updated_at);

  return (
    <div className="space-y-12 pb-20 mt-6">
      <AdminBackButton />
      <div className="grid lg:grid-cols-12 grid-cols-2 lg:gap-12 gap-4 items-stretch">
        <div className="col-span-4 h-full">
          <OrderOverviewSupplier order={order} />
        </div>

        <div className="col-span-8 h-full">
          <OrderDetailsShipmentSupplier order={order} />
        </div>
      </div>
      {/* <ProductTable
        data={cartItems}
        columns={orderDetailColumn}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={cartItems.length}
        totalPages={Math.ceil(
          extractCartItemsFromMain(order).length / pageSize,
        )}
        hasPagination={false}
        hasCount={false}
        hasHeaderBackGround
      /> */}
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
