import { getCountryName } from "@/lib/country-name";
import { Address } from "@/types/address";
import { User } from "@/types/user";
import React from "react";

interface OrderDetailUserProps {
  user?: User | null;
  shippingAddress?: Address | null;
  invoiceAddress?: Address | null;
}

const OrderDetailUser = ({
  user,
  shippingAddress,
  invoiceAddress,
}: OrderDetailUserProps) => {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
  const customerName = fullName || user?.company_name || "-";
  const shippingName =
    (user?.company_name && !shippingAddress?.recipient_name
      ? user.company_name
      : shippingAddress?.recipient_name) || customerName;
  const invoiceCountry = invoiceAddress?.country
    ? getCountryName(invoiceAddress.country)
    : "-";
  const shippingCountry = shippingAddress?.country
    ? getCountryName(shippingAddress.country)
    : "-";

  return (
    <>
      {user?.is_real ? (
        <div className="col-span-1 pt-2 pb-6 px-3 rounded-sm border space-y-2.5">
          <h5 className="font-bold">Customer</h5>
          <div className="flex items-start gap-2.5">
            <div className="text-sm">
              <div>{customerName}</div>
              <div>{user?.email || "-"}</div>
              <div>{user?.phone_number || "-"}</div>
              {!!user?.tax_id && <div>{user.tax_id}</div>}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {invoiceAddress && (
        <div className="col-span-1 py-2 px-3 rounded-sm border space-y-2.5 flex-1">
          <h5 className="font-bold">Invoice address</h5>
          <div className="space-y-2.5">
            <div className="text-sm">
              {user?.company_name ? (
                user.company_name
              ) : (
                <div>{invoiceAddress?.recipient_name || customerName}</div>
              )}
              <div>{user?.tax_id || ""}</div>
              <div>{invoiceAddress?.address_line || "-"}</div>
              <div>{invoiceAddress?.additional_address_line || ""}</div>
              <div className="flex gap-1">
                <div>{invoiceAddress?.postal_code || "-"}</div>
                <div>{invoiceAddress?.city || "-"}</div>
              </div>
              <div>{invoiceCountry}</div>
            </div>
          </div>
        </div>
      )}

      <div className="col-span-1 py-2 px-3 rounded-sm border space-y-2.5 flex-1">
        <h5 className="font-bold">Shipping address</h5>
        <div className="space-y-2.5">
          <div className="text-sm">
            <div>{shippingName}</div>
            <div>{shippingAddress?.phone_number || ""}</div>
            <div>{shippingAddress?.address_line || ""}</div>
            <div>{shippingAddress?.additional_address_line || ""}</div>
            <div className="flex gap-1">
              <div>{shippingAddress?.postal_code || ""}</div>
              <div>{shippingAddress?.city || ""}</div>
            </div>
            <div>{shippingCountry}</div>
            <div>
              {shippingAddress?.email ||
                user?.email.toLowerCase() !== "guest" ||
                ""}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailUser;
