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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useContactPersonDetail,
  useCreateContactPerson,
  useUpdateContactPerson,
} from "@/features/incoming-inventory/contact-person/hook";
import { useGetAllCustomers } from "@/features/incoming-inventory/customer/hook";
import { toast } from "sonner";

type IncomingInventoryContactPerson = {
  name: string;
  phone_number: string;
  email: string;
  customer_id: string;
};

interface AddContactPersonDialogProps {
  contact_person_id?: string;
}

const AddContactPersonDialog = ({
  contact_person_id,
}: AddContactPersonDialogProps) => {
  const createContactPersonMutation = useCreateContactPerson();
  const editContactPersonMutation = useUpdateContactPerson();

  const [open, setOpen] = useState(false);
  const [initialContactPerson, setInitialContactPerson] =
    useState<IncomingInventoryContactPerson | null>(null);

  const {
    data: listUser,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useGetAllCustomers();

  const {
    data: contactPersonData,
    isLoading,
    isError,
  } = useContactPersonDetail(contact_person_id);

  const [contactPerson, setContactPerson] =
    useState<IncomingInventoryContactPerson>({
      name: "",
      phone_number: "",
      email: "",
      customer_id: "",
    });

  useEffect(() => {
    if (contactPersonData) {
      const mappedContactPerson: IncomingInventoryContactPerson = {
        name: contactPersonData.name,
        email: contactPersonData.email,
        phone_number: contactPersonData.phone_number,
        customer_id: contactPersonData.customer_id, // 👈 NEW
      };

      setContactPerson(mappedContactPerson);
      setInitialContactPerson(mappedContactPerson); // 👈 snapshot ban đầu
    }
  }, [contactPersonData]);

  const isChanged =
    initialContactPerson &&
    JSON.stringify(contactPerson) !== JSON.stringify(initialContactPerson);

  const REQUIRED_FIELDS: (keyof IncomingInventoryContactPerson)[] = [
    "name",
    "phone_number",
    "email",
    "customer_id",
  ];

  const isValid = REQUIRED_FIELDS.every(
    (key) => contactPerson[key]?.toString().trim() !== "",
  );

  const updateField = (
    key: keyof IncomingInventoryContactPerson,
    value: string,
  ) => {
    setContactPerson((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: contactPerson.name,
      email: contactPerson.email,
      phone_number: contactPerson.phone_number,
      customer_id: contactPerson.customer_id,
    };

    // 👉 EDIT MODE
    if (contactPersonData && isChanged) {
      editContactPersonMutation.mutate(
        { id: contact_person_id!, input: payload },
        {
          onSuccess: () => {
            toast.success("Contact person updated successfully");
            setOpen(false);
          },
          onError: () => {
            toast.error("Failed to update contact person");
          },
        },
      );
      return;
    }

    // 👉 NO CHANGE
    if (contactPersonData && !isChanged) {
      toast.info("No changes detected");
      return;
    }

    // 👉 CREATE MODE
    createContactPersonMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Contact person created successfully");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to create contact person");
      },
    });
  };

  return (
    <Dialog>
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        {contactPersonData ? (
          <Pencil className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        ) : (
          <PlusCircle className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        )}
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
            value={contactPerson.name}
            onChange={(v) => updateField("name", v)}
          />

          <Field
            label="Email"
            type="email"
            required
            value={contactPerson.email}
            onChange={(v) => updateField("email", v)}
          />

          <Field
            label="Phone Number"
            required
            value={contactPerson.phone_number}
            onChange={(v) => updateField("phone_number", v)}
          />

          <div className="md:col-span-1">
            <Label className="text-sm font-medium">
              Customer <span className="text-red-500">*</span>
            </Label>

            <Select
              value={contactPerson.customer_id}
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

export default AddContactPersonDialog;
