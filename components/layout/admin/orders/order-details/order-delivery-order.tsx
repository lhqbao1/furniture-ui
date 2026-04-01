import React, { useCallback, useState } from "react";
import { ProductTable } from "../../products/products-list/product-table";
import { CheckOut, CheckOutShipmentProductReturn } from "@/types/checkout";
import { orderChildColumns } from "../order-list/column";
import { ColumnDef } from "@tanstack/react-table";
import { formatDateTimeString } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { getDeliveryOrderColumns } from "@/components/layout/cart/columns";

interface OrderDeliveryOrderProps {
  data: CheckOut[];
}

const shipmentProductReturnColumns: ColumnDef<CheckOutShipmentProductReturn>[] =
  [
    {
      accessorKey: "sku",
      header: () => <div className="text-left uppercase">SKU</div>,
      cell: ({ row }) => <div>{row.original.sku ?? "-"}</div>,
    },
    {
      accessorKey: "name",
      header: () => <div className="text-left uppercase">Name</div>,
      cell: ({ row }) => <div>{row.original.name ?? "-"}</div>,
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left uppercase">Quantity</div>,
      cell: ({ row }) => <div>{row.original.quantity ?? 0}</div>,
    },

    {
      accessorKey: "type",
      header: () => <div className="text-left uppercase">Type</div>,
      cell: ({ row }) => <div>{row.original.type ?? "-"}</div>,
    },

    {
      accessorKey: "created_at",
      header: () => <div className="text-left uppercase">Created At</div>,
      cell: ({ row }) => (
        <div>{formatDateTimeString(row.original.created_at) ?? "-"}</div>
      ),
    },
  ];

const OrderDeliveryOrder = ({ data }: OrderDeliveryOrderProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const transformCartItems = useCallback((cartItems: CartItem[]): CartItem[] => {
    return cartItems.flatMap((item) => {
      const product = item.products;

      if (product?.bundles && product.bundles.length > 0) {
        return product.bundles.map((bundle) => ({
          ...item,
          products: bundle.bundle_item,
          quantity: bundle.quantity * item.quantity,
        }));
      }

      return item;
    });
  }, []);

  const normalizeShipmentReturns = useCallback(
    (checkout: CheckOut): CheckOutShipmentProductReturn[] => {
      const productReturns = checkout?.shipment?.product_returns;
      if (!productReturns) return [];

      const normalizedReturns = Array.isArray(productReturns)
        ? productReturns
        : [productReturns];

      return normalizedReturns.filter(
        (item): item is CheckOutShipmentProductReturn =>
          Boolean(item) && typeof item === "object",
      );
    },
    [],
  );

  const renderRowSubComponent = useCallback(
    (row: { original: CheckOut }) => {
      const checkout = row.original;
      const cartItems = transformCartItems(checkout?.cart?.items ?? []);
      const productReturns = normalizeShipmentReturns(checkout);

      return (
        <div className="space-y-4">
          <ProductTable<CartItem, unknown>
            data={cartItems}
            columns={getDeliveryOrderColumns({
              is_multiple_delivery: checkout?.supplier?.delivery_multiple ?? false,
            })}
            page={1}
            pageSize={100}
            setPage={() => {}}
            setPageSize={() => {}}
            hasPagination={false}
            totalItems={cartItems.length}
            totalPages={1}
            hasCount={false}
          />

          {productReturns.length > 0 ? (
            <div className="rounded-md border border-red-200 bg-red-50/30 p-2">
              <ProductTable<CheckOutShipmentProductReturn, unknown>
                hasHeaderBackGround
                headerClassName="!bg-red-100"
                data={productReturns}
                columns={shipmentProductReturnColumns}
                page={1}
                pageSize={100}
                setPage={() => {}}
                setPageSize={() => {}}
                totalItems={productReturns.length}
                totalPages={1}
                hasPagination={false}
                hasCount={false}
              />
            </div>
          ) : null}
        </div>
      );
    },
    [normalizeShipmentReturns, transformCartItems],
  );

  return (
    <ProductTable
      hasHeaderBackGround
      data={data ? data : []}
      columns={orderChildColumns}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      totalItems={data.length ?? 0}
      totalPages={1}
      hasBackground
      hasExpanded
      allowMultipleExpandedRows
      hasPagination={false}
      hasCount={false}
      renderRowSubComponent={renderRowSubComponent}
      defaultExpandedRowPredicate={(checkout) =>
        normalizeShipmentReturns(checkout).length > 0
      }
    />
  );
};

export default OrderDeliveryOrder;
