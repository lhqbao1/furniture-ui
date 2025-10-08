"use client"

import { PDFDownloadLink, Document, Page, Text } from "@react-pdf/renderer"
import { CheckOutManual, DataManual, InvoiceManual, InvoicePDFManual } from "./manual-invoice"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DownloadInvoiceButtonProps {
    data: DataManual
    fileName?: string
}

export default function DownloadInvoiceButton({ data, fileName = "invoice.pdf" }: DownloadInvoiceButtonProps) {
    return (
        // <PDFDownloadLink
        //     document={<InvoicePDFManual data={data.data} />}
        //     fileName={fileName}
        // >
        //     {({ loading }) => (
        //         <Button
        //             className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
        //             disabled={loading}
        //             type="button"
        //         >
        //             {loading ? "Đang tạo PDF..." : "⬇️ Tải hóa đơn PDF"}
        //         </Button>
        //     )}
        // </PDFDownloadLink>
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
