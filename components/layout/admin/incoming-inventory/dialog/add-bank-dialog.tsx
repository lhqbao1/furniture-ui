"use client";

import React, { useState } from "react";
import { PlusCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field } from "./field-component";
import { CurrencyField } from "./currency-field";

type IncomingInventoryBank = {
  bank_name: string;
  account_no: string;
  account_name: string;
  currency: string;
  swift_code: string;
  address: string;
};

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "KRW", label: "KRW — Korean Won" },
  { value: "VND", label: "VND — Vietnamese Dong" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
];

const AddBankDialog = () => {
  const [bank, setBank] = useState<IncomingInventoryBank>({
    bank_name: "",
    account_no: "",
    account_name: "",
    currency: "",
    swift_code: "",
    address: "",
  });

  const REQUIRED_FIELDS: (keyof IncomingInventoryBank)[] = [
    "bank_name",
    "account_no",
    "currency",
    "swift_code",
    "address",
  ];

  const isValid = REQUIRED_FIELDS.every(
    (key) => bank[key]?.toString().trim() !== "",
  );

  const updateField = (key: keyof IncomingInventoryBank, value: string) => {
    setBank((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog>
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        <PlusCircle className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
      </DialogTrigger>

      {/* 🔹 Content */}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Bank Information</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Bank Name"
            required
            value={bank.bank_name}
            onChange={(v) => updateField("bank_name", v)}
          />

          <Field
            label="Account Number"
            required
            value={bank.account_no ?? ""}
            onChange={(v) => updateField("account_no", v)}
          />

          <Field
            label="Account Name"
            optional
            value={bank.account_name}
            onChange={(v) => updateField("account_name", v)}
          />

          <CurrencyField
            required
            value={bank.currency}
            onChange={(v) => updateField("currency", v)}
          />

          <Field
            label="Swift Code"
            required
            value={bank.swift_code}
            onChange={(v) => updateField("swift_code", v)}
          />

          <Field
            label="Address"
            required
            value={bank.address}
            onChange={(v) => updateField("address", v)}
          />
        </div>

        {/* 🔹 Footer actions (optional) */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            type="button"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!isValid}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankDialog;
