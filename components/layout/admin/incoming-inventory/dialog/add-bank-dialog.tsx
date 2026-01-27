"use client";

import React, { useEffect, useState } from "react";
import { Pencil, PlusCircle } from "lucide-react";

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
import {
  useCreateBankInfo,
  useGetBankInfoDetail,
  useUpdateBankInfo,
} from "@/features/incoming-inventory/bank/hook";
import { toast } from "sonner";
import { useGetAllCustomers } from "@/features/incoming-inventory/customer/hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IncomingInventoryBank = {
  bank_name: string;
  account_no: string;
  account_name: string;
  currency: string;
  swift_code: string;
  address: string;
  customer_id: string;
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

interface AddBankDialogProps {
  bank_info_id?: string;
}

const AddBankDialog = ({ bank_info_id }: AddBankDialogProps) => {
  const createBankInfoMutation = useCreateBankInfo();
  const editBankInfoMutation = useUpdateBankInfo();

  const [open, setOpen] = useState(false);
  const [initialBank, setInitialBank] = useState<IncomingInventoryBank | null>(
    null,
  );

  const {
    data: listUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useGetAllCustomers();

  const {
    data: bankDataServer,
    isLoading,
    isError,
  } = useGetBankInfoDetail(bank_info_id);

  const [bank, setBank] = useState<IncomingInventoryBank>({
    bank_name: "",
    account_no: "",
    account_name: "",
    currency: "",
    swift_code: "",
    address: "",
    customer_id: "",
  });

  useEffect(() => {
    if (bankDataServer) {
      const mappedBankInfo: IncomingInventoryBank = {
        account_no: bankDataServer.account_no,
        account_name: bankDataServer.account_name,
        address: bankDataServer.address,
        bank_name: bankDataServer.bank_name,
        currency: bankDataServer.currency,
        swift_code: bankDataServer.swift_code,
        customer_id: bankDataServer.customer_id, // 👈 NEW
      };

      setBank(mappedBankInfo);
      setInitialBank(mappedBankInfo); // 👈 snapshot ban đầu
    }
  }, [bankDataServer]);

  const isChanged =
    initialBank && JSON.stringify(bank) !== JSON.stringify(initialBank);

  const REQUIRED_FIELDS: (keyof IncomingInventoryBank)[] = [
    "bank_name",
    "account_no",
    "currency",
    "swift_code",
    "address",
    "customer_id",
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

  const handleSubmit = () => {
    const payload = {
      bank_name: bank.bank_name,
      account_no: bank.account_no,
      account_name: bank.account_name || undefined,
      currency: bank.currency,
      swift_code: bank.swift_code,
      address: bank.address,
      customer_id: bank.customer_id,
    };

    // 👉 EDIT MODE
    if (bankDataServer && isChanged) {
      editBankInfoMutation.mutate(
        { bankInfoId: bank_info_id!, input: payload },
        {
          onSuccess: () => {
            toast.success("Customer updated successfully");
            setOpen(false);
          },
          onError: () => {
            toast.error("Failed to update customer");
          },
        },
      );
      return;
    }

    // 👉 NO CHANGE
    if (bankDataServer && !isChanged) {
      toast.info("No changes detected");
      return;
    }

    // 👉 CREATE MODE
    createBankInfoMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Customer created successfully");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to create customer");
      },
    });
  };

  return (
    <Dialog>
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        {bankDataServer ? (
          <Pencil className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        ) : (
          <PlusCircle className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        )}
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
          <div className="md:col-span-2">
            <Label className="text-sm font-medium">
              Customer <span className="text-red-500">*</span>
            </Label>

            <Select
              value={bank.customer_id}
              onValueChange={(value) => updateField("customer_id", value)}
              disabled={isLoadingUser}
            >
              <SelectTrigger className="mt-1 w-full border">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>

              <SelectContent>
                {listUser?.map((u) => (
                  <SelectItem
                    key={u.id}
                    value={u.id}
                  >
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            onClick={handleSubmit}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankDialog;
