import { InvoicePDF } from "@/components/layout/pdf/file";
import { Button } from "@/components/ui/button";
import {
  getMainCheckOutByMainCheckOutId,
  getProductRefundByMainCheckoutId,
} from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { DownloadCloud, Loader2, Trash2 } from "lucide-react";
import { PackageSlipPdf } from "@/components/layout/pdf/package-slip-pdf";
import { BauhausReturnSlipPdf } from "@/components/layout/pdf/bauhaus-return-slip";
import UploadInvoicePdfDialog from "./upload-invoice-pdf-dialog";
import { toast } from "sonner";
import { useDeleteCheckoutPdfFile } from "@/features/checkout/hook";
import { CheckOutMain } from "@/types/checkout";
import B2BInvoiceDrawer from "../../order-list/b2b-invoice-drawer";

interface DownloadInvoiceProps {
  checkoutId: string;
  type: string;
  order?: CheckOutMain;
  invoicePdfFile?: string | null;
  invoicePdfFile2?: string | null;
  mainCheckoutId?: string;
}

const DownloadInvoice = ({
  checkoutId,
  type,
  order,
  invoicePdfFile,
  invoicePdfFile2,
  mainCheckoutId,
}: DownloadInvoiceProps) => {
  const deleteCheckoutPdfFileMutation = useDeleteCheckoutPdfFile();
  const [openB2BDrawer, setOpenB2BDrawer] = React.useState(false);
  const [b2bMarketplace, setB2BMarketplace] = React.useState("");
  const normalizedType = String(type ?? "").toLowerCase();
  const isInvoiceType = normalizedType === "invoice";
  const isPackageType = normalizedType === "package";
  const isRefundInvoiceType = normalizedType === "refund-invoice";
  const isB2BInvoiceOrder = isInvoiceType && Boolean(order?.is_b2b);
  const uploadedPackageSlipFiles = React.useMemo(
    () =>
      [
        { key: "url" as const, url: invoicePdfFile?.trim() ?? "" },
        { key: "url_2" as const, url: invoicePdfFile2?.trim() ?? "" },
      ].filter((file): file is { key: "url" | "url_2"; url: string } =>
        Boolean(file.url),
      ),
    [invoicePdfFile, invoicePdfFile2],
  );
  const hasUploadedPackageSlipFile =
    isPackageType && uploadedPackageSlipFiles.length > 0;
  const needsGeneratedDocument =
    !hasUploadedPackageSlipFile && !isB2BInvoiceOrder;
  const effectiveMainCheckoutId = mainCheckoutId || checkoutId;
  const isDeletingPackageSlip = deleteCheckoutPdfFileMutation.isPending;
  const selectedB2BOrders = React.useMemo(
    () => (order ? [order] : []),
    [order],
  );

  const {
    data: checkout,
    isLoading: isCheckoutLoading,
  } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    queryFn: () => getMainCheckOutByMainCheckOutId(checkoutId as string),
    enabled: !!checkoutId && needsGeneratedDocument,
  });

  const {
    data: invoice,
    isLoading: isInvoiceLoading,
  } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkoutId && needsGeneratedDocument,
    retry: false,
  });

  const { data: productRefundData, isLoading: isProductRefundLoading } =
    useQuery({
      queryKey: ["product-refund", effectiveMainCheckoutId],
      queryFn: () => getProductRefundByMainCheckoutId(effectiveMainCheckoutId),
      enabled: Boolean(
        effectiveMainCheckoutId && isRefundInvoiceType && needsGeneratedDocument,
      ),
      retry: false,
    });

  const normalizedProductRefundData = React.useMemo(
    () =>
      Array.isArray(productRefundData)
        ? productRefundData.filter((item) => item && typeof item === "object")
        : [],
    [productRefundData],
  );

  const defaultGeneratedFileName = isRefundInvoiceType
    ? checkout?.checkout_code
      ? `RK${checkout.checkout_code}.pdf`
      : `refund-invoice-${effectiveMainCheckoutId}.pdf`
    : invoice?.invoice_code
      ? `${invoice.invoice_code}.pdf`
      : isPackageType
        ? `package-slip-${effectiveMainCheckoutId}.pdf`
        : `invoice-${effectiveMainCheckoutId}.pdf`;

  const downloadUploadedInvoiceFile = async (url: string, fileIndex?: number) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      const suffix = typeof fileIndex === "number" ? `-${fileIndex + 1}` : "";
      a.download = `package-slip-${effectiveMainCheckoutId}${suffix}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleDeleteUploadedPackageSlip = async (
    targetKey: "url" | "url_2",
  ) => {
    if (!effectiveMainCheckoutId) {
      toast.error("Missing checkout id");
      return;
    }

    if (!targetKey) {
      toast.error("Missing file key");
      return;
    }

    if (!window.confirm("Delete this package slip PDF?")) return;

    const toastId = toast.loading("Deleting package slip PDF...");
    try {
      await deleteCheckoutPdfFileMutation.mutateAsync({
        main_checkout_id: effectiveMainCheckoutId,
        urls: [targetKey],
      });
      toast.success("Package slip PDF deleted", { id: toastId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete file";
      toast.error("Failed to delete package slip PDF", {
        id: toastId,
        description: message,
      });
    }
  };

  const handleOpenB2BInvoiceDrawer = () => {
    if (!order) {
      toast.error("Cannot create B2B invoice", {
        description: "Order data is missing.",
      });
      return;
    }

    const errors: string[] = [];

    if (!order.marketplace_order_id?.trim()) {
      errors.push(`Missing external ID: ${order.checkout_code || order.id}`);
    }

    if (!order.from_marketplace?.trim()) {
      errors.push(`Missing marketplace: ${order.checkout_code || order.id}`);
    }

    if (errors.length > 0) {
      toast.error("Cannot create B2B invoice", {
        description: (
          <div className="flex flex-col gap-1">
            {errors.map((error) => (
              <div key={error}>- {error}</div>
            ))}
          </div>
        ),
      });
      return;
    }

    setB2BMarketplace(order.from_marketplace.trim());
    setOpenB2BDrawer(true);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {isPackageType && hasUploadedPackageSlipFile ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {uploadedPackageSlipFiles.map((file, index) => (
            <div
              key={`${file.key}-${file.url}-${index}`}
              className="flex items-center gap-1"
            >
              <Button
                variant={"outline"}
                size="sm"
                type="button"
                onClick={() => void downloadUploadedInvoiceFile(file.url, index)}
                disabled={isDeletingPackageSlip}
                className="gap-1.5"
              >
                <DownloadCloud className="size-4" />
                PDF {index + 1}
              </Button>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => void handleDeleteUploadedPackageSlip(file.key)}
                disabled={isDeletingPackageSlip}
              >
                {isDeletingPackageSlip ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4 text-red-500" />
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : isB2BInvoiceOrder ? (
        <Button variant={"outline"} type="button" onClick={handleOpenB2BInvoiceDrawer}>
          <DownloadCloud />
        </Button>
      ) : isCheckoutLoading ||
        isInvoiceLoading ||
        (isRefundInvoiceType && isProductRefundLoading) ||
        !checkout ||
        !invoice ? (
        <Button variant={"outline"} disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button variant={"outline"} type="button">
          {type === "package" ? (
            <PDFDownloadLink
              document={
                checkout.from_marketplace?.toLowerCase() === "bauhaus" ? (
                  <BauhausReturnSlipPdf checkout={checkout} invoice={invoice} />
                ) : (
                  <PackageSlipPdf checkout={checkout} invoice={invoice} />
                )
              }
              fileName={defaultGeneratedFileName}
            >
              {({ loading }) =>
                loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="cursor-pointer">
                    <DownloadCloud />
                  </div>
                )
              }
            </PDFDownloadLink>
          ) : isRefundInvoiceType ? (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  checkout={checkout}
                  invoice={invoice}
                  variant="refund"
                  refundProducts={normalizedProductRefundData}
                />
              }
              fileName={defaultGeneratedFileName}
            >
              {({ loading }) =>
                loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="cursor-pointer">
                    <DownloadCloud />
                  </div>
                )
              }
            </PDFDownloadLink>
          ) : (
            <PDFDownloadLink
              document={<InvoicePDF checkout={checkout} invoice={invoice} />}
              fileName={defaultGeneratedFileName}
            >
              {({ loading }) =>
                loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="cursor-pointer">
                    <DownloadCloud />
                  </div>
                )
              }
            </PDFDownloadLink>
          )}
        </Button>
      )}

      {isPackageType ? (
        <UploadInvoicePdfDialog
          mainCheckoutId={effectiveMainCheckoutId}
          existingUrls={uploadedPackageSlipFiles.map((file) => file.url)}
        />
      ) : null}

      <B2BInvoiceDrawer
        open={openB2BDrawer}
        onOpenChange={setOpenB2BDrawer}
        marketplace={b2bMarketplace}
        selectedOrders={selectedB2BOrders}
      />
    </div>
  );
};

export default DownloadInvoice;
