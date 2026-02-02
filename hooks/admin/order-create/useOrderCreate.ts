import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export function useManualCheckoutLogic(
  form: UseFormReturn<any>,
  setDisabledFields: (fields: string[]) => void,
) {
  const marketplace = form.watch("from_marketplace");
  const status = form.watch("status");
  const country = form.watch("country");
  const company_name = form.watch("company_name")?.trim();

  const PRESET_FIELDS = [
    "company_name",
    "tax_id",
    "invoice_address",
    "invoice_city",
    "invoice_postal_code",
    "invoice_country",
  ];

  const PRESET_BY_MARKETPLACE: Record<string, any> = {
    netto: {
      company_name: "NeS GmbH",
      tax_id: "DE811205180",
      invoice_address: "Industriepark Ponholz 1",
      invoice_city: "Maxhütte-Haidhof",
      invoice_postal_code: "93142",
      invoice_country: "DE",
    },
    freakout: {
      company_name: "FREAK-OUT GmbH",
      tax_id: "ATU80855139",
      invoice_address: "Steingasse 6a",
      invoice_city: "Linz",
      invoice_postal_code: "4020",
      invoice_country: "AT",
    },
    inprodius: {
      company_name: "Inprodius Solutions GmbH",
      tax_id: "DE815533652",
      invoice_address: "Lange Wende 41-43",
      invoice_city: "Soest",
      invoice_postal_code: "59494",
      invoice_country: "DE",
    },
    norma: {
      company_name: "NORMA24 Online-Shop GmbH & Co.KG",
      tax_id: "DE281146018",
      invoice_address: "Manfred-Roth-Straße 7",
      invoice_city: "Fürth",
      invoice_postal_code: "90766",
      invoice_country: "DE",
    },
  };

  // -------------------------------------------------------------
  // 1️⃣ Apply marketplace preset + disable fields
  // -------------------------------------------------------------
  useEffect(() => {
    // 🔄 Clear toàn bộ preset fields trước
    PRESET_FIELDS.forEach((field) => {
      form.resetField(field as any);
    });

    if (!marketplace || !PRESET_BY_MARKETPLACE[marketplace]) {
      setDisabledFields([]);
      return;
    }

    const preset = PRESET_BY_MARKETPLACE[marketplace];

    Object.entries(preset).forEach(([key, value]) => {
      form.setValue(key as any, value, { shouldValidate: true });
    });

    setDisabledFields(Object.keys(preset));
  }, [marketplace]);

  // -------------------------------------------------------------
  // 2️⃣ Auto reset payment_term if status = paid
  // -------------------------------------------------------------
  useEffect(() => {
    if (status?.toLowerCase() === "paid") {
      form.setValue("payment_term", null);
    }
  }, [status]);

  // -------------------------------------------------------------
  // 3️⃣ Auto calculate tax
  // -------------------------------------------------------------
  useEffect(() => {
    if (!country) return;

    if (country === "DE") {
      form.setValue("tax", 19);
    }

    if (country === "AT") {
      form.setValue("tax", company_name ? 0 : 20);
    }
  }, [country, company_name]);
}
