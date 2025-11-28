"use client";
import { orderDetailColumn } from "@/components/layout/admin/orders/order-details/columns";
import DocumentTable from "@/components/layout/admin/orders/order-details/document/document-table";
import OrderDeliveryOrder from "@/components/layout/admin/orders/order-details/order-delivery-order";
import OrderSummary from "@/components/layout/admin/orders/order-details/order-summary";
import OrderDetailOverView from "@/components/layout/admin/orders/order-details/order-overview";
import OrderDetailUser from "@/components/layout/admin/orders/order-details/order-customer";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/shared/admin-back-button";
import { useGetMainCheckOutByMainCheckOutId } from "@/features/checkout/hook";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { calculateVAT } from "@/lib/caculate-vat";
import { formatDate, formatDateTime } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOutMain } from "@/types/checkout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import OrderDetailsSkeleton from "./skeleton";

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
  // const { data: order, isLoading, isError } = useGetCheckOutByCheckOutId(checkoutId)
  const {
    data: order,
    isLoading,
    isError,
  } = useGetMainCheckOutByMainCheckOutId(checkoutId);

  const {
    data: invoice,
    isLoading: isLoadingInvoice,
    isError: isErrorInvoice,
  } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkoutId,
    retry: false,
  });

  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError) return <div>Error loading order</div>;
  if (!order) return <div>Error loading order</div>;

  return (
    <div className="space-y-12 pb-20 mt-6">
      <AdminBackButton />
      <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-12 gap-4">
        <OrderDetailOverView
          order={order}
          created_at={formatDate(order.created_at)}
          updated_at={formatDateTime(order.updated_at)}
          status={order.status}
        />
        <OrderDetailUser
          user={order.checkouts[0].user}
          shippingAddress={order.checkouts[0].shipping_address}
          invoiceAddress={order.checkouts[0].invoice_address}
        />
      </div>
      <ProductTable
        data={extractCartItemsFromMain(order)}
        columns={orderDetailColumn}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={extractCartItemsFromMain(order).length}
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
      <OrderDeliveryOrder data={order.checkouts} />
    </div>
  );
};

export default OrderDetails;
