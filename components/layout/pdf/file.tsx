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
        fontSize: 20, marginBottom: 20, textAlign: "center", color: '#00B159'
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

export const InvoicePDF = ({ checkout, invoice }: InvoicePDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Logo */}
                <View style={styles.section}>
                    <Image src="https://pxjiuyvomonmptmmkglv.supabase.co/storage/v1/object/public/erp/uploads/681cde2c-27cd-45ea-94c2-7d82a35453bc_invoice-logo.png?" style={{ width: 80, height: 70 }} />
                </View>

                {/* Customer & Invoice Info */}
                <View style={styles.header}>
                    <View style={styles.flexColBlock}>
                        <Text style={{ fontFamily: "Figtree", fontSize: 12, fontWeight: 'bold' }}>{checkout?.user.first_name} {checkout?.user.last_name}</Text>
                        <Text>{checkout?.shipping_address.address_line}</Text>
                        <Text>{checkout?.shipping_address.postal_code} - {checkout?.shipping_address.city}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', marginRight: 50 }}>
                        {/* <Text>Invoice ID: {invoice?.id}</Text> */}
                        <Text>IBelegnummer: {invoice.invoice_code}</Text>
                        <Text>
                            Datum: {invoice?.created_at
                                ? new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                : ""}
                        </Text>
                        {/* <Text>Customer ID: {checkout?.user.id}</Text> */}
                        <Text>Kunden-Nr: {invoice.user_code}</Text>
                    </View>
                </View>

                {/* Invoice Table */}
                <View style={styles.section}>
                    <Text style={styles.title}>Rechnung</Text>
                    <View style={styles.tableHeader}>
                        <Text style={{ width: 50, textAlign: 'center', fontFamily: 'FigtreeBold' }}>Pos.</Text>
                        <Text style={{ width: 150, textAlign: 'left', fontFamily: 'FigtreeBold' }}>Bezeichnung</Text>
                        <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>Menge</Text>
                        <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>MwSt.</Text>
                        <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>E-Preis</Text>
                        <Text style={{ flex: 1, paddingHorizontal: 5, fontFamily: 'FigtreeBold' }}>G-Preis</Text>
                    </View>
                    {/* {invoice?.cart.items?.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={{ width: 50, textAlign: 'center' }}>{index + 1}</Text>
                            <Text style={{ width: 100, textAlign: 'left' }}>
                                <Text>{item.products.name}</Text>
                                <Text style={{ marginTop: 5, textAlign: 'left' }}>{item.products.id_provider}</Text>
                            </Text>
                            <Text style={styles.tableColQuantity}>{item.quantity}</Text>
                            <Text style={styles.tableCol}>19%</Text>
                            <Text style={{ flex: 1, paddingRight: 15, textAlign: 'right' }}>€{item.item_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={styles.tableCol}>€{item.final_price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    ))} */}
                </View>

                {/* Summary */}
                <View style={styles.flexEnd}>
                    <View style={styles.flexColBlock}>
                        <View style={styles.flexEndTotal}>
                            <Text style={styles.gapY10}>Gesamt Netto</Text>
                            <Text style={styles.minWidth}>
                                €{((invoice?.total_amount_item ?? 0) - (invoice?.total_vat ?? 0) - (invoice?.voucher_amount ?? 0) - (invoice?.coupon_amount ?? 0)).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Text style={styles.gapY10}>zzgl. MwSt</Text>
                            <Text style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>€{invoice?.total_vat.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Text style={styles.gapY10}>Versandkosten</Text>
                            <Text style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right' }}>€{invoice?.total_shipping.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={styles.flexEndTotalBg}>
                            <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Rechnungsbetrag</Text>
                            <Text style={styles.minWidth}>€{invoice?.total_amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={styles.flexEndTotal}>
                            <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Zahlbetrag</Text>
                            <Text style={styles.minWidth}>€{invoice?.total_amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={styles.flexEndTotal}>
                            <Text style={styles.gapY10}>Zahlung vom {invoice?.created_at
                                ? new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                : ""}:</Text>
                            <Text style={styles.minWidth}>€{invoice?.total_amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>

                        <View style={styles.flexEndTotal}>
                            <Text style={{ marginBottom: 5, marginRight: 20, fontFamily: "FigtreeBold" }}>Offener Betrag:</Text>
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
                        <Text style={styles.boldWithGap}>Geschäftsführer</Text>
                        <Text style={styles.gapY5}>Thuy Duong Nguyen</Text>
                        <Text style={styles.gapY5}>USt-ID: DE454714336</Text>
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
    )
};