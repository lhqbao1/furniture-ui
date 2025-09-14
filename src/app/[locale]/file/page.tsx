"use client";
import { useQuery } from "@tanstack/react-query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAtom } from "jotai";
import { checkOutIdAtom } from "@/store/payment";
import { invoiceIdAtom } from "@/store/invoice";
import { getCheckOutByCheckOutId } from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { InvoicePDF } from "@/components/layout/pdf/file";

export default function InvoicePage() {
    const [checkoutId] = useAtom(checkOutIdAtom);
    const [invoiceId] = useAtom(invoiceIdAtom);

    const { data: checkout } = useQuery({
        queryKey: ["checkout-id", checkoutId],
        queryFn: () => getCheckOutByCheckOutId(checkoutId as string),
        enabled: !!checkoutId,
    });

    const { data: invoice } = useQuery({
        queryKey: ["invoice-checkout", checkoutId],
        queryFn: () => getInvoiceByCheckOut(checkoutId as string),
        enabled: !!checkoutId,
    });

    if (!checkout || !invoice) return <div>Loading...</div>;

    return (
        <div>
            <PDFDownloadLink
                document={<InvoicePDF checkout={checkout} invoice={invoice} />}
                fileName="invoice.pdf"
            >
                {({ loading }) => (loading ? "Generating PDF..." : <div className="cursor-pointer">Download Invoice PDF</div>)}
            </PDFDownloadLink>
        </div>
    );
}
