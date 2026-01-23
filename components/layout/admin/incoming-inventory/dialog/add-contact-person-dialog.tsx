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

type IncomingInventoryContactPerson = {
  name: string;
  phone_number: string;
  email: string;
};

const AddContactPersonDialog = () => {
  const [user, setUser] = useState<IncomingInventoryContactPerson>({
    name: "",
    phone_number: "",
    email: "",
  });

  const REQUIRED_FIELDS: (keyof IncomingInventoryContactPerson)[] = [
    "name",
    "phone_number",
    "email",
  ];

  const isValid = REQUIRED_FIELDS.every(
    (key) => user[key]?.toString().trim() !== "",
  );

  const updateField = (
    key: keyof IncomingInventoryContactPerson,
    value: string,
  ) => {
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
          <DialogTitle className="text-xl">Add Contact Person</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Name"
            required
            value={user.name}
            onChange={(v) => updateField("name", v)}
          />

          <Field
            label="Email"
            type="email"
            required
            value={user.email}
            onChange={(v) => updateField("email", v)}
          />

          <Field
            label="Phone Number"
            required
            value={user.phone_number}
            onChange={(v) => updateField("phone_number", v)}
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

export default AddContactPersonDialog;
