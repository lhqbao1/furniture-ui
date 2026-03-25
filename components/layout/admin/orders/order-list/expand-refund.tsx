"use client";

import React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { RefundOrderItem, RefundOrderProduct } from "@/types/checkout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i.test(url);
}

function getFileNameFromUrl(url: string) {
  const path = url.split("?")[0] ?? "";
  const fileName = path.split("/").pop() ?? "file";
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

export default function OrderExpandRefund({
  row,
}: {
  row: Row<RefundOrderItem>;
}) {
  const checkout = row.original;
  const refundProducts = Array.isArray(checkout?.product_refund)
    ? checkout.product_refund
    : [];
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = React.useState(false);
  const [documentDialogTitle, setDocumentDialogTitle] = React.useState("Product");
  const [documentDialogFiles, setDocumentDialogFiles] = React.useState<
    NonNullable<RefundOrderProduct["files"]>
  >([]);

  const documentEntries = React.useMemo(
    () =>
      (documentDialogFiles ?? [])
        .map((file, index) => {
          const url = (file?.url ?? "").trim();
          if (!url) return null;

          return {
            key: `${url}-${file?.id ?? index}`,
            url,
            name: getFileNameFromUrl(url),
            isImage: isImageUrl(url),
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [documentDialogFiles],
  );

  const photoEntries = React.useMemo(
    () => documentEntries.filter((entry) => entry.isImage),
    [documentEntries],
  );
  const fileEntries = React.useMemo(
    () => documentEntries.filter((entry) => !entry.isImage),
    [documentEntries],
  );

  const refundColumns = React.useMemo<ColumnDef<RefundOrderProduct>[]>(
    () => [
      {
        accessorKey: "name",
        header: "PRODUCT",
        cell: ({ row }) => <div>{row.original.name || "-"}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => <div>{row.original.sku || "-"}</div>,
      },
      {
        accessorKey: "quantity",
        header: "QTY",
        cell: ({ row }) => <div>{Number(row.original.quantity || 0)}</div>,
      },
      {
        accessorKey: "refund_amount",
        header: "REFUND",
        cell: ({ row }) => (
          <div className="font-medium text-red-600">
            €{formatCurrency(row.original.refund_amount)}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "REASON",
        cell: ({ row }) => <div>{row.original.reason || "-"}</div>,
      },
      {
        accessorKey: "type",
        header: "TYPE",
        cell: ({ row }) => <div>{row.original.type || "-"}</div>,
      },
      {
        id: "documents",
        header: "DOCUMENTS",
        cell: ({ row }) => {
          const files = Array.isArray(row.original.files) ? row.original.files : [];
          const count = files.filter((file) => (file?.url ?? "").trim()).length;

          if (count === 0) return <div>-</div>;

          return (
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => {
                setDocumentDialogTitle(row.original.name || "Product");
                setDocumentDialogFiles(files);
                setIsDocumentDialogOpen(true);
              }}
            >
              View ({count})
            </button>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="rounded-md border bg-white p-4">
      {refundProducts.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          No refund products found.
        </div>
      ) : (
        <ProductTable<RefundOrderProduct, unknown>
          data={refundProducts}
          columns={refundColumns}
          page={1}
          pageSize={20}
          setPage={() => {}}
          setPageSize={() => {}}
          hasPagination={false}
          totalItems={refundProducts.length}
          totalPages={1}
          hasCount={false}
          hasHeaderBackGround
        />
      )}

      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Documents</DialogTitle>
            <DialogDescription>{documentDialogTitle}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Photos</div>
              {photoEntries.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  No photos
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {photoEntries.map((entry) => (
                    <a
                      key={entry.key}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-md border hover:bg-muted/20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.url}
                        alt={entry.name}
                        className="h-44 w-full object-cover"
                      />
                      <div className="border-t px-3 py-2 text-sm">{entry.name}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Files</div>
              {fileEntries.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  No files
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {fileEntries.map((entry) => (
                    <a
                      key={entry.key}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm hover:bg-muted/20"
                    >
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="line-clamp-2">{entry.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
