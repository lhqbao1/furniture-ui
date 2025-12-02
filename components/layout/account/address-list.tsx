"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import AddressForm from "./address-form";
import { cn } from "@/lib/utils";
import { useAddressManager } from "@/hooks/account/useAccountAddress";
import { COUNTRY_OPTIONS } from "@/data/data";

interface AddressListProps {
  userId: string;
}

const AddressList = ({ userId }: AddressListProps) => {
  const {
    addresses,
    isLoading,
    isError,
    t,
    removeDialogId,
    defaultDialogId,
    editDialogId,
    setRemoveDialogId,
    setDefaultDialogId,
    setEditDialogId,
    deleteAddressMutation,
    setDefaultAddressMutation,
    handleDeleteAddress,
    handleSetDefaultAddress,
  } = useAddressManager(userId);

  if (isLoading) return <div>{t("loading")}...</div>;
  if (isError)
    return <div className="text-red-500">{t("noShippingAddress")}</div>;
  if (!addresses || addresses.length === 0)
    return <div className="text-red-500">{t("noShippingAddress")}</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {[...addresses]
        .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)) // default lên đầu
        .map((address) => (
          <Card
            key={address.id}
            className={cn(
              "col-span-2 lg:col-span-1",
              address.is_default ? "border-secondary border-2" : "",
            )}
          >
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>{address.address_line}</p>
              <p>{address.city}</p>
              <p>
                {COUNTRY_OPTIONS.find((c) => c.value === address.country)
                  ?.label || address.country}
              </p>
              {address.recipient_name && (
                <p>
                  {t("recipient")}: {address.recipient_name}
                </p>
              )}
              {address.phone_number && <p>{address.phone_number}</p>}
            </CardContent>
            <CardFooter className="px-2 justify-center">
              <div className="flex gap-2">
                <Dialog
                  open={editDialogId === address.id}
                  onOpenChange={(open) =>
                    setEditDialogId(open ? address.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                    >
                      {t("edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="lg:w-[800px]">
                    <DialogHeader>
                      <DialogTitle>{t("editShippingAddress")}</DialogTitle>
                      <AddressForm
                        userId={userId}
                        open={editDialogId === address.id} // boolean
                        setOpen={(open) =>
                          setEditDialogId(open ? address.id : null)
                        } // adapter
                        currentAddress={address}
                      />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={defaultDialogId === address.id}
                  onOpenChange={(open) =>
                    setDefaultDialogId(open ? address.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                    >
                      {t("asDefault")}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="lg:w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {t("setAsDefaultShippingAddress")}
                      </DialogTitle>
                      <DialogDescription>
                        {t("confirmSetDefaultShippingAddress")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={() => handleSetDefaultAddress(address.id)}
                        variant="secondary"
                        disabled={setDefaultAddressMutation.isPending}
                      >
                        {setDefaultAddressMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          t("confirm")
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={removeDialogId === address.id}
                  onOpenChange={(open) =>
                    setRemoveDialogId(open ? address.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                    >
                      {t("remove")}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="lg:w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{t("deleteShippingAddress")}</DialogTitle>
                      <DialogDescription>
                        {t("confirmDeleteShippingAddress")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={() => handleDeleteAddress(address.id)}
                        variant="secondary"
                        disabled={deleteAddressMutation.isPending}
                      >
                        {deleteAddressMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          t("confirm")
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
};

export default AddressList;
