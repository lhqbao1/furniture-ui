"use client";

import { invoiceColumns } from "./column";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { FileTable } from "./table";
import { formatDate } from "@/lib/date-formated";
import { useMemo } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./file";
import { Button } from "@/components/ui/button";
import { calculateVAT } from "@/lib/caculate-vat";

interface InvoiceTableProps {
  checkoutId: string;
  invoiceId?: string;
  isCreditNode?: boolean;
}

export default function InvoiceTable({
  checkoutId,
  invoiceId,
  isCreditNode,
}: InvoiceTableProps) {
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

  const flattenedCartItems = useMemo(() => {
    const checkouts = invoice?.main_checkout?.checkouts;
    if (!checkouts) return [];

    return (
      checkouts
        // ❌ Loại checkout có status "exchange" hoặc "cancel_exchange"
        .filter((checkout) => {
          const status = checkout.status?.toLowerCase();
          return status !== "exchange" && status !== "cancel_exchange";
        })

        // ✔ Flatten items
        .flatMap((checkout) => {
          // Nếu checkout.cart là array (CartResponse)
          if (Array.isArray(checkout.cart)) {
            return checkout.cart.flatMap((cartItem) => cartItem.items ?? []);
          }

          // Nếu checkout.cart là object (CartResponseItem)
          return checkout.cart?.items ?? [];
        })
    );
  }, [invoice]);

  return (
    <div
      id="invoice-table"
      className="flex flex-col gap-6 items-start w-[894px] h-screen p-12 pb-4 relative"
    >
      <Image
        src="/invoice-logo.png"
        height={100}
        width={100}
        alt=""
      />
      <div className="flex justify-between gap-8 w-full">
        <div className="flex flex-col gap-0">
          <span className="text-sm">
            Prestige Home GmbH · Greifswalder Straße 226, 10405 Berlin
          </span>
          <span>
            {checkout?.checkouts?.[0]?.user?.first_name}{" "}
            {checkout?.checkouts?.[0]?.user?.last_name}
          </span>
          <span>
            {checkout?.checkouts?.[0]?.invoice_address?.address_line?.trim()
              ? checkout?.checkouts?.[0]?.invoice_address?.address_line
              : checkout?.checkouts?.[0]?.shipping_address?.address_line}
          </span>

          <span>
            {checkout?.checkouts?.[0]?.invoice_address?.postal_code?.trim()
              ? checkout?.checkouts?.[0]?.invoice_address?.postal_code
              : checkout?.checkouts?.[0]?.shipping_address?.postal_code}{" "}
            {checkout?.checkouts?.[0]?.invoice_address?.city?.trim()
              ? checkout?.checkouts?.[0]?.invoice_address?.city
              : checkout?.checkouts?.[0]?.shipping_address?.city}
          </span>
          <span>
            {checkout?.checkouts?.[0]?.invoice_address?.country?.trim()
              ? checkout?.checkouts?.[0]?.invoice_address?.country
              : checkout?.checkouts?.[0]?.shipping_address?.country}
          </span>
        </div>

        <div className="w-[320px] border border-gray-400 text-[13px]">
          {/* Header */}
          <div className="bg-[#d2d2d2] relative z-50 text-center font-semibold py-1 border-b border-gray-400">
            Rechnung
          </div>

          {/* Body */}
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-medium">Belegnummer:</span>
              <span>{invoice?.invoice_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Datum:</span>
              <span>{formatDate(checkout?.created_at ?? new Date())}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Kunden-Nr:</span>
              <span>{checkout?.checkouts[0].user.user_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Bearbeiter:</span>
              <span>-</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[12px] font-semibold py-1">
            Bitte bei allen Rückfragen angeben!
          </div>
        </div>
      </div>
      <div className="text-center w-full space-y-4">
        {/* <h2 className="text-3xl text-secondary font-bold">Invoice</h2> */}
        <FileTable
          columns={invoiceColumns}
          data={flattenedCartItems}
          voucher={invoice?.voucher_amount}
          coupon={invoice?.coupon_amount}
        />
      </div>

      <div className="flex flex-col items-end w-full space-y-2">
        <div className="flex gap-0 justify-end">
          <div className="mr-6">Warenwert (brutto)</div>
          <div className="w-[100px] text-right">
            {invoice?.total_amount_item?.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        </div>
        <div className="flex gap-0 justify-end">
          <div className="mr-6">Versandkosten (brutto)</div>
          <div className="w-[100px] text-right">
            {(invoice?.total_shipping ?? 0)?.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        </div>
        {/* <div className="flex gap-0 justify-end">
                    <div className="mr-6">Summe (netto)</div>
                    <div className="w-[100px] text-right">
                        {((invoice?.total_amount ?? 0) - (invoice?.total_vat ?? 0)).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                    </div>
                </div> */}
        <div className="flex gap-0 justify-end">
          <div className="mr-6">MwSt.</div>
          <div className="w-[100px] text-right">
            {calculateVAT({
              items: invoice?.total_amount_item,
              shipping: invoice?.total_shipping,
              discount: invoice?.voucher_amount,
              taxPercent: checkout?.tax ?? 19,
            }).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        </div>

        <div className="flex gap-0 justify-end">
          <div className="mr-6">Rechnungsbetrag (brutto)</div>
          <div className="w-[100px] text-right">
            {(
              (invoice?.total_amount_item ?? 0) +
              (invoice?.total_shipping ?? 0) +
              (invoice?.voucher_amount ?? 0)
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        </div>

        <div className="flex gap-0 justify-end">
          <div className="mr-6">Wertgutschein (brutto)</div>
          <div className="w-[100px] text-right">
            {(
              (invoice?.coupon_amount ?? 0) +
              Math.abs(invoice?.voucher_amount ?? 0)
            ).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        </div>

        {checkout?.status.toLowerCase() === "pending" ? (
          ""
        ) : (
          <div className="flex gap-0 justify-end">
            <div className="mr-6">Zahlbetrag</div>
            <div className="w-[100px] text-right">
              {(invoice?.total_amount ?? 0).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
            </div>
          </div>
        )}

        <div className="flex gap-0 justify-end">
          <div className="mr-6">Offener Betrag</div>
          <div className="w-[100px] text-right">
            {checkout?.status.toLowerCase() === "pending"
              ? (invoice?.total_amount ?? 0).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "00,00"}
            €
          </div>
        </div>
      </div>

      {/* <div className="flex justify-between w-full">
               
            </div> */}

      <div className="absolute right-0 top-0 z-10">
        <Image
          src={"/Vector1.png"}
          height={160}
          width={160}
          alt=""
          unoptimized
        />
        <Image
          src={"/Vector2.png"}
          height={160}
          width={160}
          alt=""
          unoptimized
        />
      </div>

      <div className="absolute left-0 bottom-0 z-10">
        <Image
          src={"/Vector3.png"}
          height={160}
          width={160}
          alt=""
          unoptimized
        />
        <Image
          src={"/Vector4.png"}
          height={160}
          width={160}
          alt=""
          unoptimized
        />
      </div>

      <div className="absolute bottom-0 z-20 grid grid-cols-3 gap-6">
        <div className="">
          <div
            className="font-semibold"
            translate="no"
          >
            Prestige Home GmbH
          </div>
          <div>Greifswalder Straße 226</div>
          <div>10405 Berlin</div>
          <div>info@prestige-home.de</div>
        </div>

        <div className="">
          <div
            className="font-semibold"
            translate="no"
          >
            Bankverbindung
          </div>
          <div>OLINDA Zweigniederlassung Deutschland</div>
          <div>IBAN:</div>
          <div>DE57100101232316418882</div>
          <div>BIC:</div>
          <div>QNTODEB2XXX</div>
        </div>

        <div className="">
          <div className="font-semibold">Geschäftsführung</div>
          <div>Duong Thuy Nguyen</div>
          <div>Ust-IdNr: DE454714336</div>
        </div>

        {checkout && invoice && (
          <div className="w-full flex justify-center col-span-3">
            <Button variant={"outline"}>
              <PDFDownloadLink
                document={
                  <InvoicePDF
                    checkout={checkout}
                    invoice={invoice}
                  />
                }
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
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
