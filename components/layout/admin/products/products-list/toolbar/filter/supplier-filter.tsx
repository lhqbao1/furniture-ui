"use client";

import { useGetSuppliers } from "@/features/supplier/hook";
import React, { useState } from "react";
import SupplierSelect from "../supplier-select";
import { useRouter, useSearchParams } from "next/navigation";
import type { SupplierResponse } from "@/types/supplier";
import { Label } from "@/components/ui/label";

const SupplierFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [supplier, setSupplier] = useState<string>(
    searchParams.get("supplier_id") ?? "",
  );

  const { data: suppliers } = useGetSuppliers();
  if (!suppliers) return <>Loading...</>;

  // Add prestige home option
  const extendedSuppliers: SupplierResponse[] = [
    {
      id: "",
      business_name: "All",
      delivery_multiple: false,
      vat_id: "",
      email: "",
      email_order: "",
      email_billing: "",
      phone_number: "",
      created_at: "",
      updated_at: "",
    },
    {
      id: "prestige_home",
      business_name: "Prestige Home",
      delivery_multiple: false,
      vat_id: "",
      email: "",
      email_order: "",
      email_billing: "",
      phone_number: "",
      created_at: "",
      updated_at: "",
    },
    ...suppliers,
  ];

  const handleChange = (value: string) => {
    setSupplier(value);

    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete("supplier_id");
    else params.set("supplier_id", value);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-2">
      <Label>Select Supplier</Label>
      <SupplierSelect
        suppliers={extendedSuppliers}
        supplier={supplier}
        setSupplier={handleChange}
      />
    </div>
  );
};

export default SupplierFilter;
