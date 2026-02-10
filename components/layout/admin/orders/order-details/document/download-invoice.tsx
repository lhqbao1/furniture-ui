import { InvoicePDF } from "@/components/layout/pdf/file";
import { Button } from "@/components/ui/button";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { DownloadCloud, Loader2 } from "lucide-react";
import { PackageSlipPdf } from "@/components/layout/pdf/package-slip-pdf";

interface DownloadInvoiceProps {
  checkoutId: string;
  type: string;
}

const DownloadInvoice = ({ checkoutId, type }: DownloadInvoiceProps) => {
  const {
    data: checkout,
    isLoading: isCheckoutLoading,
    isError: isCheckoutError,
  } = useQuery({
    queryKey: ["checkout-id", checkoutId],
    queryFn: () => getMainCheckOutByMainCheckOutId(checkoutId as string),
    enabled: !!checkoutId,
  });

  const {
    data: invoice,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
  } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkoutId,
    retry: false,
  });

  if (isCheckoutLoading || isInvoiceLoading || !checkout || !invoice) {
    return (
      <Button variant={"outline"} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button variant={"outline"}>
      {type === "package" ? (
        <PDFDownloadLink
          document={<PackageSlipPdf checkout={checkout} invoice={invoice} />}
          fileName={`${invoice.invoice_code}.pdf`}
        >
          {({ loading }) =>
            loading ? (
              "Generating PDF..."
            ) : (
              <div className="cursor-pointer">Download Invoice PDF</div>
            )
          }
        </PDFDownloadLink>
      ) : (
        <PDFDownloadLink
          document={<InvoicePDF checkout={checkout} invoice={invoice} />}
          fileName={`${invoice.invoice_code}.pdf`}
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
  );
};

export default DownloadInvoice;
