"use client"

import { PDFDownloadLink, Document, Page, Text } from "@react-pdf/renderer"
import { CheckOutManual, DataManual, InvoiceManual, InvoicePDFManual } from "./manual-invoice"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DownloadInvoiceButtonProps {
    data?: DataManual
    fileName?: string
}

export default function DownloadInvoiceButton({ data, fileName = "invoice.pdf" }: DownloadInvoiceButtonProps) {
    return (
        <PDFDownloadLink
            document={<InvoicePDFManual />}
            fileName="invoice.pdf"
        >
            {({ loading }) => (
                <Button type="button" className="py-6" variant={'secondary'}>
                    {loading ? <Loader2 className="animate-spin" /> : "⬇️ Download PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
