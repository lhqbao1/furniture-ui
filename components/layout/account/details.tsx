"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddressForm from "./address-form";
import AddressList from "./address-list";
import { useGetInvoiceAddressByUserId } from "@/features/address/hook";
import InvoiceAddress from "./invoice-address";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BoxIcon,
  Heart,
  HomeIcon,
  LockKeyholeIcon,
  LucideEye,
  Mails,
  PenBoxIcon,
  PlusSquare,
  User2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "@/src/i18n/navigation";
import EditUserDialog from "./edit-account-dialog";
import { useUpdateUser } from "@/features/users/hook";
import { toast } from "sonner";

interface AccountDetailsProps {
  user: User;
}

const AccountDetails = ({ user }: AccountDetailsProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [isNotified, setIsNotified] = useState<boolean>(
    user.is_notified ?? false,
  );

  const {
    data: invoiceAddress,
    isLoading,
    isError,
  } = useGetInvoiceAddressByUserId(user.id);

  const updateUserMutation = useUpdateUser();

  const handleChange = () => {
    // gọi mutation ngay lập tức khi checkbox thay đổi
    updateUserMutation.mutate(
      {
        id: user.id,
        user: {
          ...user,
          is_notified: isNotified,
        },
      },
      {
        onSuccess(data, variables, context) {
          toast.success(t("turnOnNotificationsSuccess"));
        },
        onError(error, variables, context) {
          toast.error(t("turnOnNotificationsError"));
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-2 space-y-6 gap-4 lg:gap-8 lg:mt-8">
      <div className="col-span-2 lg:col-span-1 w-full lg:space-y-8 space-y-4">
        {/*User data */}
        <div>
          <Card className="shadow-sm rounded-none border-none relative">
            <div className="bg-black w-0.5 h-20 absolute left-0 top-0"></div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <User2
                  className="w-7 h-7"
                  strokeWidth={1}
                  stroke="black"
                />
                <CardTitle className="text-2xl font-light">
                  {t("personal_data")}
                </CardTitle>
              </div>
              <Dialog
                open={openUserDialog}
                onOpenChange={setOpenUserDialog}
              >
                <PenBoxIcon
                  className="w-7 h-7 cursor-pointer"
                  strokeWidth={1}
                  onClick={() => setOpenUserDialog(true)}
                />
                <DialogContent className="lg:w-[800px] space-y-6">
                  <DialogHeader>
                    <DialogTitle className="mb-4">
                      {t("edit_user_data")}
                    </DialogTitle>
                    <EditUserDialog
                      setOpen={setOpenUserDialog}
                      open={openUserDialog}
                      currentUser={user}
                    />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-lg text-black">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-black text-lg">{user.email}</p>
            </CardContent>
          </Card>
        </div>

        {/*Address */}
        <div className="">
          <Card className="shadow-sm rounded-none border-none relative">
            <div className="bg-black w-0.5 h-20 absolute left-0 top-0"></div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <HomeIcon
                  className="w-7 h-7"
                  strokeWidth={1}
                  stroke="black"
                />
                <div>
                  <CardTitle className="text-2xl font-light">
                    {t("address")}
                  </CardTitle>
                </div>
              </div>
              <Dialog
                open={openAddressDialog}
                onOpenChange={setOpenAddressDialog}
              >
                <PlusSquare
                  className="w-7 h-7 cursor-pointer"
                  strokeWidth={1}
                  onClick={() => setOpenAddressDialog(true)}
                />
                <DialogContent className="lg:w-[800px]">
                  <DialogHeader>
                    <DialogTitle>{t("addShippingAddress")}</DialogTitle>
                    <AddressForm
                      setOpen={setOpenAddressDialog}
                      open={openAddressDialog}
                      userId={user.id}
                    />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="">
              <AddressList userId={user.id} />
            </CardContent>
          </Card>
        </div>

        {/*Invoice Address */}
        <div className="">
          <Card className="shadow-sm rounded-none border-none relative">
            <div className="bg-black w-0.5 h-20 absolute left-0 top-0"></div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <HomeIcon
                  className="w-7 h-7"
                  strokeWidth={1}
                  stroke="black"
                />
                <div>
                  <CardTitle className="text-2xl font-light">
                    {t("invoiceAddress")}
                  </CardTitle>
                </div>
              </div>
              <Dialog
                open={openAddressDialog}
                onOpenChange={setOpenAddressDialog}
              >
                {invoiceAddress ? (
                  ""
                ) : (
                  <PlusSquare
                    className="w-7 h-7 cursor-pointer"
                    strokeWidth={1}
                    onClick={() => setOpenAddressDialog(true)}
                  />
                )}
                <DialogContent className="lg:w-[800px]">
                  <DialogHeader>
                    <DialogTitle>{t("addInvoiceAddress")}</DialogTitle>
                    <AddressForm
                      setOpen={setOpenAddressDialog}
                      open={openAddressDialog}
                      userId={user.id}
                      isInvoice={true}
                    />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="">
              <InvoiceAddress userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="col-span-2 lg:col-span-1 w-full lg:space-y-8 space-y-4">
        {/*Order History */}
        <div>
          <Link
            href={`/my-order`}
            className=""
          >
            <Card className="shadow-sm rounded-none border-none relative">
              <div className="bg-black w-0.5 h-full absolute left-0 top-0"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <BoxIcon
                    className="w-7 h-7"
                    strokeWidth={1}
                    stroke="black"
                  />
                  <CardTitle className="text-2xl font-light">
                    {t("orderHistory")}
                  </CardTitle>
                </div>
                <LucideEye
                  className="w-7 h-7 cursor-pointer"
                  strokeWidth={1}
                />
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/*Wishlist */}
        <div>
          <Link
            href={`/wishlist`}
            className=""
          >
            <Card className="shadow-sm rounded-none border-none relative">
              <div className="bg-black w-0.5 h-full absolute left-0 top-0"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Heart
                    className="w-7 h-7"
                    strokeWidth={1}
                    stroke="black"
                  />
                  <CardTitle className="text-2xl font-light">
                    {t("wishlist")}
                  </CardTitle>
                </div>
                <LucideEye
                  className="w-7 h-7 cursor-pointer"
                  strokeWidth={1}
                />
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/*News letter */}
        <div className="">
          <Card className="shadow-sm rounded-none border-none relative">
            <div className="bg-black w-0.5 h-20 absolute left-0 top-0"></div>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Mails
                  className="w-7 h-7"
                  strokeWidth={1}
                  stroke="black"
                />
                <CardTitle className="text-2xl font-light">
                  {t("newsletter")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-lg">{t("newsletter_not_subscribed")}</div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={isNotified}
                    onCheckedChange={() => setIsNotified(!isNotified)}
                    className="size-6 lg:mt-1 border-1 border-black"
                  />
                  <Label
                    htmlFor="newsletter"
                    className="text-lg leading-snug font-light"
                  >
                    {t("newsletter_subscribe_confirm", { email: user.email })}
                  </Label>
                </div>

                <Button
                  variant={"outline"}
                  onClick={() => handleChange()}
                  className="w-full text-lg rounded-none py-2 h-fit border-black lg:mt-4"
                >
                  ANMELDEN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
