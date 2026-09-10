"use client";

import bwipjs from "@bwip-js/browser";
import type { SpeditionLabelData } from "./spedition-label-pdf";

export function SpeditionLabelPreview({ data }: { data: SpeditionLabelData }) {
  const barcode = data.sscc
    ? bwipjs.toSVG({
        bcid: "gs1-128",
        text: `(00)${data.sscc}`,
        parse: true,
        scale: 2,
        height: 16,
        includetext: false,
        padding: 0,
      })
    : "";

  return (
    <div className="mx-auto aspect-[105/148] w-full max-w-[420px] border border-slate-300 bg-white p-5 text-black shadow-sm">
      <section className="border-b border-black py-3">
        <p className="text-[10px] font-bold">EMPFÄNGER</p>
        <p className="mt-1 text-base font-bold">{data.recipient.name || "-"}</p>
        <p className="text-sm">{data.recipient.street || "-"}</p>
        <p className="text-sm">
          {data.recipient.postalCode || "-"} {data.recipient.city || "-"},{" "}
          {data.recipient.countryCode || "-"}
        </p>
      </section>

      <section className="space-y-1 border-b border-black py-3 text-xs">
        {[
          ["AUFTRAG", data.orderCode],
          ["SKU", data.sku],
          ["PRODUKT", data.productName],
          ["PAKET", `${data.parcelNumber} / ${data.parcelCount}`],
          ["GEWICHT", `${data.weightKg} kg`],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <strong className="w-14 shrink-0">{label}</strong>
            <span>{value || "-"}</span>
          </div>
        ))}
      </section>

      <section className="border-b border-black py-3">
        <p className="text-[10px] font-bold">NVE</p>
        {barcode ? (
          <div
            className="mt-2 flex justify-center"
            dangerouslySetInnerHTML={{ __html: barcode }}
          />
        ) : null}
        <p className="text-center text-base font-bold tracking-widest">
          {data.sscc ? `00${data.sscc}` : "-"}
        </p>
        <p className="text-center text-[10px]">(00) {data.sscc || "-"}</p>
      </section>

      <section className="border-b border-black py-3">
        <p className="text-[10px] font-bold">REFERENZ</p>
        <p className="mt-1 text-sm font-bold">{data.reference || "-"}</p>
        <p className="text-[10px]">Erstellt: {data.createdAt || "-"}</p>
      </section>

      <p className="whitespace-pre-line pt-2 text-[10px]">
        ABSENDER{data.sender ? `\n${data.sender}` : ""}
      </p>
    </div>
  );
}
