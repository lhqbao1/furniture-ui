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

import { Button } from "@/components/ui/button";
import { Field } from "./field-component";
import {
  useCreateCustomer,
  useGetCustomer,
  useUpdateCustomer,
} from "@/features/incoming-inventory/customer/hook";
import { toast } from "sonner";
import { CountryField } from "./country-select";

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

interface AddUserDialogProps {
  user_id?: string;
}

const AddUserDialog = ({ user_id }: AddUserDialogProps) => {
  const createCustomerMutation = useCreateCustomer();
  const editCustomerMutation = useUpdateCustomer();

  const [open, setOpen] = useState(false);
  const [initialUser, setInitialUser] = useState<IncomingInventoryUser | null>(
    null,
  );

  const { data: userServer, isLoading, isError } = useGetCustomer(user_id);

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

  useEffect(() => {
    if (userServer) {
      const mappedUser: IncomingInventoryUser = {
        name: userServer.name ?? "",
        tax_id: userServer.tax_id ?? "",
        address: userServer.address ?? "",
        city: userServer.city ?? "",
        country: userServer.country ?? "",
        postal_code: userServer.postal_code ?? "",
        fax: userServer.fax ?? "",
        phone_number: userServer.phone ?? "",
        email: userServer.email ?? "",
        web: userServer.website ?? "",
      };

      setUser(mappedUser);
      setInitialUser(mappedUser); // 👈 snapshot ban đầu
    }
  }, [userServer]);

  const isChanged =
    initialUser && JSON.stringify(user) !== JSON.stringify(initialUser);

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

  const handleSubmit = () => {
    const payload = {
      name: user.name,
      tax_id: user.tax_id || undefined,
      address: user.address,
      postal_code: user.postal_code,
      city: user.city,
      country: user.country,
      phone: user.phone_number || undefined,
      email: user.email || undefined,
      fax: user.fax || undefined,
      website: user.web || undefined,
    };

    // 👉 EDIT MODE
    if (userServer && isChanged) {
      editCustomerMutation.mutate(
        { customerId: user_id!, input: payload },
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
    if (userServer && !isChanged) {
      toast.info("No changes detected");
      return;
    }

    // 👉 CREATE MODE
    createCustomerMutation.mutate(payload, {
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
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>
        {userServer ? (
          <Pencil className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        ) : (
          <PlusCircle className="size-4 text-secondary hover:text-secondary/70 cursor-pointer" />
        )}
      </DialogTrigger>

      {/* 🔹 Content */}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {userServer ? "Edit user" : "Add user"}
          </DialogTitle>{" "}
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

          <CountryField
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
          <Button variant="outline" type="button">
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              !isValid ||
              createCustomerMutation.isPending ||
              editCustomerMutation.isPending
            }
            onClick={handleSubmit}
          >
            {userServer
              ? editCustomerMutation.isPending
                ? "Updating..."
                : "Save changes"
              : createCustomerMutation.isPending
                ? "Creating..."
                : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
