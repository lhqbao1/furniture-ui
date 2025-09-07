// InvoiceTable.tsx
// "use client"

// import { invoiceColumns } from "./column"
// import { DataTable } from "./table"
// import Image from "next/image"
// import { useAtom } from "jotai"
// import { checkOutIdAtom } from "@/store/payment"
// import { useQuery } from "@tanstack/react-query"
// import { getCheckOutByCheckOutId } from "@/features/checkout/api"
// import { getInvoiceByCheckOut } from "@/features/invoice/api"
// import { useEffect } from "react"
// import { invoiceIdAtom } from "@/store/invoice"

// export default function InvoiceTable() {
//     const [checkoutId, setCheckoutId] = useAtom(checkOutIdAtom)
//     const [invoiceId, setInvoiceId] = useAtom(invoiceIdAtom)

//     const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
//         queryKey: ["checkout-id", checkoutId],
//         queryFn: () => getCheckOutByCheckOutId(checkoutId as string),
//         enabled: !!checkoutId, // chỉ chạy khi có id
//     })

//     const { data: invoice, isLoading: isInvoiceLoading, isError: isInvoiceError } = useQuery({
//         queryKey: ["invoice-checkout", checkoutId],
//         queryFn: () => getInvoiceByCheckOut(checkoutId as string),
//         enabled: !!checkoutId, // chỉ chạy khi có id
//     })

//     useEffect(() => {
//         if (checkout) {
//             setCheckoutId(checkout.id)
//         }
//         if (invoice) {
//             setInvoiceId(invoice.id)
//         }
//     })

//     return (
//         <div id="invoice-table" className="flex flex-col gap-6 items-start w-[794px] p-12 pb-4 relative">
//             <Image
//                 src="/new-logo.png"
//                 height={100}
//                 width={100}
//                 alt=""
//             />
//             <div className="flex justify-between gap-8 w-full">
//                 <div className="flex flex-col gap-1">
//                     <span>{checkout?.user.first_name} {checkout?.user.last_name}</span>
//                     <span>{checkout?.shipping_address.city}</span>
//                     <span>{checkout?.shipping_address.address_line}</span>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                     <span>Invoice ID: {invoice?.id}</span>
//                     <span>
//                         Invoice date: {invoice?.created_at
//                             ? new Date(invoice.created_at).toLocaleDateString("en-US", {
//                                 year: "numeric",
//                                 month: "short",
//                                 day: "numeric",
//                             })
//                             : ""}
//                     </span>
//                     <span>Customer ID: {checkout?.user.id}</span>
//                 </div>
//             </div>
//             <div className="text-center w-full space-y-4">
//                 <h2 className="text-3xl text-secondary font-bold">Invoice</h2>
//                 <DataTable columns={invoiceColumns} data={invoice?.cart.items ?? []} voucher={invoice?.voucher_amount} coupon={invoice?.coupon_amount} />
//             </div>

//             <div className="flex flex-col items-end w-full space-y-2">
//                 <div className="flex gap-3 justify-end">
//                     <div>Total net amount</div>
//                     <div>
//                         €{
//                             (invoice?.total_amount_item ?? 0)
//                             - (invoice?.total_vat ?? 0)
//                             - (invoice?.voucher_amount ?? 0)
//                             - (invoice?.coupon_amount ?? 0)
//                         }
//                     </div>
//                 </div>
//                 <div className="flex gap-3 justify-end">
//                     <div>Total VAT </div>
//                     <div>€{invoice?.total_vat}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Shipping cost</div>
//                     <div>€{invoice?.total_shipping}</div>
//                 </div><div className="flex gap-3 justify-end bg-secondary/20 p-2 rounded-sm">
//                     <div className="font-bold">Invoice amount</div>
//                     <div>€{invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div className="font-bold">Amount Due</div>
//                     <div>€{invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Payment (PayPal Checkout) from 04/29/2025</div>
//                     <div>€{invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Open Amount</div>
//                     <div>€00.00</div>
//                 </div>
//             </div>

//             <div className="flex justify-between mt-20 w-full">
//                 <div className="space-y-1">
//                     <div className="font-semibold">Prestige Home GmbH</div>
//                     <div>Greifswalder Straße 226, 10405 Berlin.</div>
//                     <div>Tel: info@prestige-home.de</div>
//                 </div>
//                 <div className="space-y-1">
//                     <div className="font-semibold">Chief Executive Office</div>
//                     <div>Thuy Duong Nguyen</div>
//                     <div>Tax code: DE454714336</div>
//                 </div>
//             </div>

//             <div className="absolute right-0 top-0">
//                 <Image
//                     src={'pdf-1.svg'}
//                     height={160}
//                     width={160}
//                     alt=""
//                 />
//             </div>
//         </div>
//     )
// }



import { CheckOut } from "@/types/checkout";
import { InvoiceResponse } from "@/types/invoice";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer"

Font.register({
    family: "Roboto",
    src: "/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf",
})

Font.register({
    family: "Figtree",
    src: "/fonts/Figtree/Figtree-VariableFont_wght.ttf",
})

Font.register({
    family: "FigtreeBold",
    src: "/fonts/Figtree/figtree-bold.ttf",
})

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 11,
        fontFamily: "Figtree",
        fontWeight: "bold",
        color: '#666666',
        position: 'relative'
    },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, marginTop: 20 },
    section: { marginBottom: 10 },
    gapY10: { marginBottom: 5, marginRight: 20 },
    gapBoldY10: { marginBottom: 5, marginRight: 20, fontFamily: "Figtree" },
    gapY5: { marginBottom: 0 },
    minWidth: {
        // minWidth: 100,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    flexEnd: { display: 'flex', justifyContent: 'flex-end', width: '100%', flexDirection: "row", marginTop: 30, flex: 1 },
    tableHeader: { flexDirection: "row", paddingBottom: 10 },
    tableRow: { flexDirection: "row", paddingVertical: 10 },
    tableCol: { flex: 1, paddingHorizontal: 5 },
    tableColPosition: { width: '50px', textAlign: 'center' },
    tableColQuantity: { flex: 1, textAlign: 'center' },
    tableColName: { flex: 1 },
    title: {
        fontSize: 20, marginBottom: 20, textAlign: "center", color: '#51BE8C'
    },
    footer: { marginTop: 50, display: 'flex', justifyContent: 'space-between', flexDirection: "row", fontSize: 9 },
    bold: { fontWeight: "bold" },
    text: { fontFamily: "Roboto", fontSize: 12 },
    flexColBlock: { display: 'flex', flexDirection: 'column' },
    flexRowBlock: { display: 'flex', flexDirection: 'row', gap: '4px' },
    boldWithGap: { fontFamily: 'FigtreeBold' },
    flexEndTotal: { display: 'flex', justifyContent: 'flex-end', width: '100%', flexDirection: "row" },
    right5: { marginRight: 5 },
    flexEndTotalBg: { display: 'flex', justifyContent: 'flex-end', width: '300px', flexDirection: "row", backgroundColor: "rgba(81, 190, 140, 0.2)", borderRadius: 6, paddingTop: 5, paddingBottom: 2 },

});

interface InvoicePDFProps {
    checkout: CheckOut;
    invoice: InvoiceResponse;
}

export const InvoicePDF = ({ checkout, invoice }: InvoicePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header Logo */}
            <View style={styles.section}>
                <Image src="/new-logo.png" style={{ width: 80, height: 70 }} />
            </View>

            {/* Customer & Invoice Info */}
            <View style={styles.header}>
                <View style={styles.flexColBlock}>
                    <Text style={{ fontFamily: "Figtree", fontSize: 12, fontWeight: 'bold' }}>{checkout?.user.first_name} {checkout?.user.last_name}</Text>
                    <Text>{checkout?.shipping_address.city}</Text>
                    <Text>{checkout?.shipping_address.address_line}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column', marginRight: 50 }}>
                    {/* <Text>Invoice ID: {invoice?.id}</Text> */}
                    <Text>Invoice ID: 1.000.001</Text>
                    <Text>
                        Invoice date: {invoice?.created_at
                            ? new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            : ""}
                    </Text>
                    {/* <Text>Customer ID: {checkout?.user.id}</Text> */}
                    <Text>Customer ID: 1.000.002</Text>
                </View>
            </View>

            {/* Invoice Table */}
            <View style={styles.section}>
                <Text style={styles.title}>Invoice</Text>
                <View style={styles.tableHeader}>
                    <Text style={{ width: 50, textAlign: 'center', fontFamily: 'FigtreeBold' }}>Pos.</Text>
                    <Text style={{ width: 100, textAlign: 'left', fontFamily: 'FigtreeBold' }}>Item(s)</Text>
                    <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>Item ID</Text>
                    <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>Unit Price</Text>
                    <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>Quantity</Text>
                    <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>VAT</Text>
                    <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>Amount</Text>
                </View>
                {invoice?.cart.items?.map((item, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={{ width: 50, textAlign: 'center' }}>{index + 1}</Text>
                        <Text style={{ width: 100, textAlign: 'left' }}>
                            <Text>{item.product_name}</Text>
                            <View style={styles.flexRowBlock}>
                                <Text>{item.variant_name}</Text>
                                <Text>{item.option_label}</Text>
                            </View>
                        </Text>
                        <Text style={styles.tableCol}>#567100</Text>
                        <Text style={styles.tableCol}>€{item.item_price}</Text>
                        <Text style={styles.tableColQuantity}>{item.quantity}</Text>
                        <Text style={styles.tableCol}>19%</Text>
                        <Text style={styles.tableCol}>€{item.final_price}</Text>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.flexEnd}>
                <View style={styles.flexColBlock}>
                    <View style={styles.flexEndTotal}>
                        <Text style={styles.gapY10}>Total net amount:</Text>
                        <Text style={styles.minWidth}>
                            €{(invoice?.total_amount_item ?? 0) - (invoice?.total_vat ?? 0) - (invoice?.voucher_amount ?? 0) - (invoice?.coupon_amount ?? 0)}
                        </Text>
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={styles.gapY10}>Total VAT:</Text>
                        <Text style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>€{invoice?.total_vat.toFixed(2)}</Text>
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={styles.gapY10}>Shipping cost:</Text>
                        <Text style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right' }}>€{invoice?.total_shipping.toFixed(2)}</Text>
                    </View>

                    <View style={styles.flexEndTotalBg}>
                        <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Invoice amount:</Text>
                        <Text style={styles.minWidth}>€{invoice?.total_amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.flexEndTotal}>
                        <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Amount Due:</Text>
                        <Text style={styles.minWidth}>€{invoice?.total_amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.flexEndTotal}>
                        <Text style={styles.gapY10}>Payment (PayPal Checkout) from 04/29/2025:</Text>
                        <Text style={styles.minWidth}>€{invoice?.total_amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.flexEndTotal}>
                        <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Open Amount:</Text>
                        <Text style={styles.minWidth}>€00.00</Text>
                    </View>

                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.boldWithGap}>Prestige Home GmbH</Text>
                    <Text style={styles.gapY5}>Greifswalder Straße 226, 10405 Berlin.</Text>
                    <Text style={styles.gapY5}>Tel: info@prestige-home.de</Text>
                </View>

                <View>
                    <Text style={styles.boldWithGap}>Chief Executive Office</Text>
                    <Text style={styles.gapY5}>Thuy Duong Nguyen</Text>
                    <Text style={styles.gapY5}>Tax code: DE454714336</Text>
                </View>
            </View>

            <View style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Image src="/Vector1.png" style={{ width: 160, height: 160 }} />
                <Image src="/Vector2.png" style={{ width: 107, height: 114, marginTop: 10 }} />
            </View>

            <View style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', flexDirection: 'column' }}>
                <Image src="/Vector3.png" style={{ width: 160, height: 160 }} />
                <Image src="/Vector4.png" style={{ width: 107, height: 114, marginTop: 10 }} />
            </View>
        </Page>
    </Document >
);



// components/InvoiceClient.tsx
// "use client"

// import { useEffect, useState } from "react"
// import { DataTable } from "@/components/layout/pdf/table"
// import { invoiceColumns } from "@/components/layout/pdf/column"
// import Image from "next/image"
// import { InvoiceResponse } from "@/types/invoice"
// import { CheckOut } from "@/types/checkout"

// type InvoiceWithCheckout = {
//     invoice: InvoiceResponse
//     checkout: CheckOut
// }

// export default function InvoiceTable() {
//     const [checkoutId, setCheckoutId] = useState<string | null>(null)
//     const [invoiceData, setInvoiceData] = useState<InvoiceWithCheckout>()

//     useEffect(() => {
//         const id = localStorage.getItem("checkout")
//         if (id) setCheckoutId(id)
//     }, [])

//     useEffect(() => {
//         if (!checkoutId) return

//         const fetchData = async () => {
//             try {
//                 const checkoutRes = await fetch(`/api/checkout/46d7c8ba-390e-4c74-a936-8279ef333fae`)
//                 if (!checkoutRes.ok) throw new Error("Checkout fetch failed")
//                 const checkout = await checkoutRes.json()
//                 console.log(checkout)

//                 const invoiceRes = await fetch(`/api/invoice/by-checkout/${checkoutId}`)
//                 if (!invoiceRes.ok) throw new Error("Invoice fetch failed")
//                 const invoice = await invoiceRes.json()

//                 setInvoiceData({ checkout, invoice })
//             } catch (err) {
//                 console.error(err)
//             }
//         }

//         fetchData()
//     }, [checkoutId])

//     if (!invoiceData) return <div>Loading...</div>

//     return (
//         <div id="invoice-table" className="flex flex-col gap-6 items-start w-[794px] p-12 pb-4 relative">
//             <Image
//                 src="/new-logo.png"
//                 height={100}
//                 width={100}
//                 alt=""
//             />
//             <div className="flex justify-between gap-8 w-full">
//                 <div className="flex flex-col gap-1">
//                     <span>{invoiceData.checkout?.user.first_name} {invoiceData.checkout?.user.last_name}</span>
//                     <span>{invoiceData.checkout?.shipping_address.city}</span>
//                     <span>{invoiceData.checkout?.shipping_address.address_line}</span>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                     <span>Invoice ID: {invoiceData.invoice?.id}</span>
//                     <span>
//                         Invoice date: {invoiceData.invoice?.created_at
//                             ? new Date(invoiceData.invoice.created_at).toLocaleDateString("en-US", {
//                                 year: "numeric",
//                                 month: "short",
//                                 day: "numeric",
//                             })
//                             : ""}
//                     </span>
//                     <span>Customer ID: {invoiceData.checkout?.user.id}</span>
//                 </div>
//             </div>
//             <div className="text-center w-full space-y-4">
//                 <h2 className="text-3xl text-secondary font-bold">Invoice</h2>
//                 <DataTable columns={invoiceColumns} data={invoiceData.invoice?.cart.items ?? []} voucher={invoiceData.invoice?.voucher_amount} coupon={invoiceData.invoice?.coupon_amount} />
//             </div>

//             <div className="flex flex-col items-end w-full space-y-2">
//                 <div className="flex gap-3 justify-end">
//                     <div>Total net amount</div>
//                     <div>
//                         €{
//                             (invoiceData.invoice?.total_amount_item ?? 0)
//                             - (invoiceData.invoice?.total_vat ?? 0)
//                             - (invoiceData.invoice?.voucher_amount ?? 0)
//                             - (invoiceData.invoice?.coupon_amount ?? 0)
//                         }
//                     </div>
//                 </div>
//                 <div className="flex gap-3 justify-end">
//                     <div>Total VAT </div>
//                     <div>€{invoiceData.invoice?.total_vat}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Shipping cost</div>
//                     <div>€{invoiceData.invoice?.total_shipping}</div>
//                 </div><div className="flex gap-3 justify-end bg-secondary/20 p-2 rounded-sm">
//                     <div className="font-bold">invoiceData.invoice amount</div>
//                     <div>€{invoiceData.invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div className="font-bold">Amount Due</div>
//                     <div>€{invoiceData.invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Payment (PayPal Checkout) from 04/29/2025</div>
//                     <div>€{invoiceData.invoice?.total_amount}</div>
//                 </div><div className="flex gap-3 justify-end">
//                     <div>Open Amount</div>
//                     <div>€00.00</div>
//                 </div>
//             </div>

//             <div className="flex justify-between mt-20 w-full">
//                 <div className="space-y-1">
//                     <div className="font-semibold">Prestige Home GmbH</div>
//                     <div>Greifswalder Straße 226, 10405 Berlin.</div>
//                     <div>Tel: info@prestige-home.de</div>
//                 </div>
//                 <div className="space-y-1">
//                     <div className="font-semibold">Chief Executive Office</div>
//                     <div>Thuy Duong Nguyen</div>
//                     <div>Tax code: DE454714336</div>
//                 </div>
//             </div>

//             <div className="absolute right-0 top-0">
//                 <Image
//                     src={'pdf-1.svg'}
//                     height={160}
//                     width={160}
//                     alt=""
//                 />
//             </div>
//         </div>
//     )
// }



