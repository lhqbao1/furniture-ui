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

type IncomingInventoryUser = {
  name: string;
  tax_id?: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  fax: string;
  phone_number: string;
  email: string;
  web: string;
};

const AddUserDialog = () => {
  const [user, setUser] = useState<IncomingInventoryUser>({
    name: "",
    tax_id: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    fax: "",
    phone_number: "",
    email: "",
    web: "",
  });

  const REQUIRED_FIELDS: (keyof IncomingInventoryUser)[] = [
    "name",
    "address",
    "city",
    "country",
    "postal_code",
  ];

  const isValid = REQUIRED_FIELDS.every(
    (key) => user[key]?.toString().trim() !== "",
  );

  const updateField = (key: keyof IncomingInventoryUser, value: string) => {
    setUser((prev) => ({
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
          <DialogTitle className="text-xl">Add user</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Name"
            required
            value={user.name}
            onChange={(v) => updateField("name", v)}
          />

          <Field
            label="Tax ID"
            optional
            value={user.tax_id ?? ""}
            onChange={(v) => updateField("tax_id", v)}
          />

          <Field
            label="Address"
            required
            value={user.address}
            onChange={(v) => updateField("address", v)}
          />

          <Field
            label="City"
            required
            value={user.city}
            onChange={(v) => updateField("city", v)}
          />

          <Field
            label="Country"
            required
            value={user.country}
            onChange={(v) => updateField("country", v)}
          />

          <Field
            label="Postal Code"
            required
            value={user.postal_code}
            onChange={(v) => updateField("postal_code", v)}
          />

          <Field
            label="Fax"
            optional
            value={user.fax}
            onChange={(v) => updateField("fax", v)}
          />

          <Field
            label="Phone Number"
            optional
            value={user.phone_number}
            onChange={(v) => updateField("phone_number", v)}
          />

          <Field
            label="Email"
            type="email"
            optional
            value={user.email}
            onChange={(v) => updateField("email", v)}
          />

          <Field
            label="Website"
            optional
            value={user.web}
            onChange={(v) => updateField("web", v)}
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

export default AddUserDialog;
