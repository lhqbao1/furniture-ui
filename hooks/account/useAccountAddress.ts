"use client";

import React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  useGetAddressByUserId,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/features/address/hook";

export function useAddressManager(userId: string) {
  const t = useTranslations();

  // Dialog states
  const [removeDialogId, setRemoveDialogId] = React.useState<string | null>(
    null,
  );
  const [defaultDialogId, setDefaultDialogId] = React.useState<string | null>(
    null,
  );
  const [editDialogId, setEditDialogId] = React.useState<string | null>(null);

  // Queries
  const { data: addresses, isLoading, isError } = useGetAddressByUserId(userId);

  // Mutations
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  // Handlers
  const handleDeleteAddress = (addressId: string) => {
    deleteAddressMutation.mutate(addressId, {
      onSuccess() {
        toast.success(t("deleteShippingAddress"));
        setRemoveDialogId(null);
      },
      onError() {
        toast.error(t("deleteShippingAddressFail"));
      },
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setDefaultAddressMutation.mutate(addressId, {
      onSuccess() {
        toast.success(t("setDefaultShippingAddress"));
        setDefaultDialogId(null);
      },
      onError() {
        toast.error(t("setDefaultShippingAddressFail"));
      },
    });
  };

  return {
    // data
    addresses,
    isLoading,
    isError,
    t,

    // dialog states
    removeDialogId,
    defaultDialogId,
    editDialogId,
    setRemoveDialogId,
    setDefaultDialogId,
    setEditDialogId,

    // actions
    deleteAddressMutation,
    setDefaultAddressMutation,
    handleDeleteAddress,
    handleSetDefaultAddress,
  };
}
