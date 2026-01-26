"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";

interface DownloadCSVStammProps {
  product: ProductItem;
}

const DownloadCSVStamm = ({ product }: DownloadCSVStammProps) => {
  const handleDownload = () => {
    if (!product) return;
    if (!product.packages || product.packages.length === 0)
      return toast.error("Product is missing the package number");

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Artikelstamm>
  <Mandant>243</Mandant>
  <Artikel>
    <ArtikelNr>${product.sku ?? ""}</ArtikelNr>
    <Bezeichner>${product.name ?? ""}</Bezeichner>
    <Mengeneinheit>St</Mengeneinheit>
    <EANs>
      ${product.ean ? `<EAN>${product.ean}</EAN>` : ""}
    </EANs>
    <Gewicht>${product.packages[0].weight ?? ""}</Gewicht>
    <Packmaßlaenge>${product.packages[0].length ?? ""}</Packmaßlaenge>
    <Packmaßbreite>${product.packages[0].width ?? ""}</Packmaßbreite>
    <Packmaßhoehe>${product.packages[0].height ?? ""}</Packmaßhoehe>
    <Aktiv>Ja</Aktiv>
    <Gefahrstoff/>
    <Lagergruppe>9_1 Amm GmbH</Lagergruppe>
    <VK/>
  </Artikel>
</Artikelstamm>`;

    const blob = new Blob([xmlContent], {
      type: "text/xml;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${product.sku || "artikelstamm"}.csv`; // hoặc .xml
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownload}
      className="w-fit"
    >
      Download Artikelstamm CSV
    </Button>
  );
};

export default DownloadCSVStamm;
