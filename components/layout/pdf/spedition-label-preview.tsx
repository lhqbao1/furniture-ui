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
      <div className="flex items-start justify-between border-b border-black pb-3">
        <strong className="text-2xl">WAREHOUSE</strong>
        <div className="text-right">
          <strong className="text-xl">{data.recipient.countryCode || "--"}</strong>
          <p className="text-[10px]">INTERNAL PARCEL LABEL</p>
        </div>
      </div>

      <section className="border-b border-black py-3">
        <p className="text-[10px] font-bold">SHIP TO</p>
        <p className="mt-1 text-base font-bold">{data.recipient.name || "-"}</p>
        <p className="text-sm">{data.recipient.street || "-"}</p>
        <p className="text-sm">
          {data.recipient.postalCode || "-"} {data.recipient.city || "-"},{" "}
          {data.recipient.countryCode || "-"}
        </p>
      </section>

      <section className="space-y-1 border-b border-black py-3 text-xs">
        {[
          ["ORDER", data.orderCode],
          ["SKU", data.sku],
          ["PRODUCT", data.productName],
          ["PARCEL", `${data.parcelNumber} / ${data.parcelCount}`],
          ["WEIGHT", `${data.weightKg} kg`],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <strong className="w-14 shrink-0">{label}</strong>
            <span>{value || "-"}</span>
          </div>
        ))}
      </section>

      <section className="border-b border-black py-3">
        <p className="text-[10px] font-bold">SSCC</p>
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
        <p className="text-[10px] font-bold">REFERENCE</p>
        <p className="mt-1 text-sm font-bold">{data.reference || "-"}</p>
        <p className="text-[10px]">Created: {data.createdAt || "-"}</p>
      </section>

      <p className="pt-2 text-[10px]">SENDER{data.sender ? ` · ${data.sender}` : ""}</p>
    </div>
  );
}
