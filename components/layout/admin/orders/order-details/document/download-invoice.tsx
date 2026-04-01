import { InvoicePDF } from "@/components/layout/pdf/file";
import { Button } from "@/components/ui/button";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";
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

interface DownloadInvoiceProps {
  checkoutId: string;
  type: string;
  invoicePdfFile?: string | null;
  mainCheckoutId?: string;
}

const DownloadInvoice = ({
  checkoutId,
  type,
  invoicePdfFile,
  mainCheckoutId,
}: DownloadInvoiceProps) => {
  const deleteCheckoutPdfFileMutation = useDeleteCheckoutPdfFile();
  const normalizedType = String(type ?? "").toLowerCase();
  const isPackageType = normalizedType === "package";
  const hasUploadedPackageSlipFile =
    isPackageType && Boolean(invoicePdfFile && invoicePdfFile.trim().length > 0);
  const needsGeneratedDocument = !hasUploadedPackageSlipFile;
  const effectiveMainCheckoutId = mainCheckoutId || checkoutId;
  const isDeletingPackageSlip = deleteCheckoutPdfFileMutation.isPending;

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

  const defaultGeneratedFileName = invoice?.invoice_code
    ? `${invoice.invoice_code}.pdf`
    : isPackageType
      ? `package-slip-${effectiveMainCheckoutId}.pdf`
      : `invoice-${effectiveMainCheckoutId}.pdf`;

  const downloadUploadedInvoiceFile = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `package-slip-${effectiveMainCheckoutId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleDeleteUploadedPackageSlip = async () => {
    if (!effectiveMainCheckoutId) {
      toast.error("Missing checkout id");
      return;
    }

    if (!window.confirm("Delete uploaded package slip PDF?")) return;

    const toastId = toast.loading("Deleting package slip PDF...");
    try {
      await deleteCheckoutPdfFileMutation.mutateAsync({
        main_checkout_id: effectiveMainCheckoutId,
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

  return (
    <div className="flex items-center justify-center gap-2">
      {hasUploadedPackageSlipFile ? (
        <>
          <Button
            variant={"outline"}
            type="button"
            onClick={() => void downloadUploadedInvoiceFile(invoicePdfFile!)}
            disabled={isDeletingPackageSlip}
          >
            <DownloadCloud />
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => void handleDeleteUploadedPackageSlip()}
            disabled={isDeletingPackageSlip}
          >
            {isDeletingPackageSlip ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4 text-red-500" />
            )}
          </Button>
        </>
      ) : isCheckoutLoading || isInvoiceLoading || !checkout || !invoice ? (
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

      {isPackageType && !hasUploadedPackageSlipFile ? (
        <UploadInvoicePdfDialog mainCheckoutId={effectiveMainCheckoutId} />
      ) : null}
    </div>
  );
};

export default DownloadInvoice;
