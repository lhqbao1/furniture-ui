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
import {
  useCreateCustomer,
  useGetCustomer,
  useUpdateCustomer,
} from "@/features/incoming-inventory/customer/hook";
import { toast } from "sonner";
import { CountryField } from "./country-select";
import {
  useCreateWarehouse,
  useUpdateWarehouse,
} from "@/features/incoming-inventory/ware-house/hook";
import { useWarehouseDetail } from "@/features/incoming-inventory/contact-person/hook";

type IncomingInventoryWareHouse = {
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  phone_number: string;
  email: string;
};

interface AddWareHouseDialogProps {
  warehouse_id?: string;
}

const AddWareHouseDialog = ({ warehouse_id }: AddWareHouseDialogProps) => {
  const createWareHouseMutation = useCreateWarehouse();
  const editWareHouseMutation = useUpdateWarehouse();

  const [open, setOpen] = useState(false);
  const [initialWareHouse, setInitialWareHouse] =
    useState<IncomingInventoryWareHouse | null>(null);

  const {
    data: wareHouseServer,
    isLoading,
    isError,
  } = useWarehouseDetail(warehouse_id);

  const [wareHouse, setWareHouse] = useState<IncomingInventoryWareHouse>({
    name: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    if (wareHouseServer) {
      const mappedWareHouse: IncomingInventoryWareHouse = {
        name: wareHouseServer.name ?? "",
        address: wareHouseServer.address ?? "",
        city: wareHouseServer.city ?? "",
        country: wareHouseServer.country ?? "",
        postal_code: wareHouseServer.postal_code ?? "",
        phone_number: wareHouseServer.phone_number ?? "",
        email: wareHouseServer.email ?? "",
      };

      setWareHouse(mappedWareHouse);
      setInitialWareHouse(mappedWareHouse); // 👈 snapshot ban đầu
    }
  }, [wareHouseServer]);

  const isChanged =
    initialWareHouse &&
    JSON.stringify(wareHouse) !== JSON.stringify(initialWareHouse);

  const REQUIRED_FIELDS: (keyof IncomingInventoryWareHouse)[] = [
    "name",
    "address",
    "city",
    "country",
    "postal_code",
  ];

  const isValid = REQUIRED_FIELDS.every(
    (key) => wareHouse[key]?.toString().trim() !== "",
  );

  const updateField = (
    key: keyof IncomingInventoryWareHouse,
    value: string,
  ) => {
    setWareHouse((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: wareHouse.name,
      address: wareHouse.address,
      postal_code: wareHouse.postal_code,
      city: wareHouse.city,
      country: wareHouse.country,
      phone_number: wareHouse.phone_number,
      email: wareHouse.email,
    };

    // 👉 EDIT MODE
    if (wareHouseServer && isChanged) {
      editWareHouseMutation.mutate(
        { id: warehouse_id!, input: payload },
        {
          onSuccess: () => {
            toast.success("Warehouse updated successfully");
            setOpen(false);
          },
          onError: () => {
            toast.error("Failed to update warehouse");
          },
        },
      );
      return;
    }

    // 👉 NO CHANGE
    if (wareHouseServer && !isChanged) {
      toast.info("No changes detected");
      return;
    }

    // 👉 CREATE MODE
    createWareHouseMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Warehouse created successfully");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to create warehouse");
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        {wareHouseServer ? (
          <Pencil className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        ) : (
          <PlusCircle className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        )}
      </DialogTrigger>

      {/* 🔹 Content */}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {wareHouseServer ? "Edit Warehouse" : "Add Warehouse"}
          </DialogTitle>{" "}
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Name"
            required
            value={wareHouse.name}
            onChange={(v) => updateField("name", v)}
          />

          <Field
            label="Address"
            required
            value={wareHouse.address}
            onChange={(v) => updateField("address", v)}
          />

          <Field
            label="City"
            required
            value={wareHouse.city}
            onChange={(v) => updateField("city", v)}
          />

          <CountryField
            required
            value={wareHouse.country}
            onChange={(v) => updateField("country", v)}
          />

          <Field
            label="Postal Code"
            required
            value={wareHouse.postal_code}
            onChange={(v) => updateField("postal_code", v)}
          />

          <Field
            label="Phone Number"
            optional
            value={wareHouse.phone_number}
            onChange={(v) => updateField("phone_number", v)}
          />

          <Field
            label="Email"
            type="email"
            optional
            value={wareHouse.email}
            onChange={(v) => updateField("email", v)}
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
            disabled={
              !isValid ||
              createWareHouseMutation.isPending ||
              editWareHouseMutation.isPending
            }
            onClick={handleSubmit}
          >
            {wareHouseServer
              ? editWareHouseMutation.isPending
                ? "Updating..."
                : "Save changes"
              : createWareHouseMutation.isPending
                ? "Creating..."
                : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWareHouseDialog;
