"use client";
export const ssr = false;

import DocumentTable from "@/components/layout/admin/orders/order-details/document/document-table";
import OrderDeliveryOrder from "@/components/layout/admin/orders/order-details/order-delivery-order";
import OrderSummary from "@/components/layout/admin/orders/order-details/order-summary";
import OrderDetailOverView from "@/components/layout/admin/orders/order-details/order-overview";
import OrderDetailUser from "@/components/layout/admin/orders/order-details/order-customer";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import { useGetMainCheckOutByMainCheckOutId } from "@/features/checkout/hook";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { formatDate, formatDateTimeString } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOutMain } from "@/types/checkout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import OrderDetailsSkeleton from "./skeleton";
import { calculateOrderTaxWithDiscount } from "@/lib/caculate-vat";
import { getOrderDetailColumns } from "@/components/layout/admin/orders/order-details/columns";

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

const OrderDetails = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const params = useParams<{ id: string }>(); // type-safe
  const checkoutId = params?.id;

  const {
    data: order,
    isLoading,
    isError,
  } = useGetMainCheckOutByMainCheckOutId(checkoutId);

  const { data: invoice } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkoutId,
    retry: false,
  });

  const cartItems = useMemo(() => {
    if (!order) return [];
    return extractCartItemsFromMain(order);
  }, [order]);

  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError) return <div>Error loading order</div>;
  if (!order) return <div>Error loading order</div>;

  const createdAt = formatDate(order.created_at);
  const updatedAt = formatDateTimeString(order.updated_at);

  const calc = calculateOrderTaxWithDiscount(
    order.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [],
    order?.voucher_amount ?? 0,
    order.checkouts?.[0]?.shipping_address?.country ?? "DE",
    order.checkouts?.[0]?.user?.tax_id,
  );
  // fallback = "0,00"
  const val = Number(calc?.totalNetWithoutShipping ?? 0);

  console.log(val);
  return (
    <div className="space-y-12 pb-20 mt-6">
      <AdminBackButton />
      <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-12 gap-4">
        <OrderDetailOverView
          order={order}
          created_at={createdAt}
          updated_at={updatedAt}
          status={order.status}
        />
        <OrderDetailUser
          user={order.checkouts[0].user}
          shippingAddress={order.checkouts[0].shipping_address}
          invoiceAddress={order.checkouts[0].invoice_address}
        />
      </div>
      <ProductTable
        data={cartItems}
        columns={getOrderDetailColumns({
          country_code:
            invoice?.main_checkout.checkouts[0].shipping_address.country,
          tax_id: invoice?.main_checkout.checkouts[0].user.tax_id,
        })}
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
      />
      <div className="flex justify-between w-full">
        {order.status !== "Pending" ? (
          <div className="flex gap-12">
            <DocumentTable
              order={order}
              invoiceCode={invoice?.invoice_code}
            />
            {/* <DocumentTable /> */}
          </div>
        ) : (
          ""
        )}
        <OrderSummary
          language={order.checkouts[0].user.language ?? ""}
          sub_total={order.total_amount_item}
          shipping_amount={order.total_shipping}
          discount_amount={Math.abs(order.voucher_amount)}
          tax={
            calculateOrderTaxWithDiscount(
              invoice?.main_checkout.checkouts
                .flatMap((c) => c.cart)
                .flatMap((c) => c.items) ?? [],
              invoice?.voucher_amount,
              invoice?.main_checkout.checkouts[0].shipping_address.country,
              invoice?.main_checkout.checkouts[0].user.tax_id,
              order.total_shipping,
            ).totalVat
          }
          total_amount={order.total_amount}
          payment_method={order.payment_method}
          entry_date={order.created_at}
          is_Ebay={order.from_marketplace === "ebay" ? true : false}
        />
      </div>
      <OrderDeliveryOrder data={order.checkouts} />
    </div>
  );
};

export default OrderDetails;
