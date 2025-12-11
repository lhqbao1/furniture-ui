import { getCountryName } from "@/lib/country-name";
import { Address } from "@/types/address";
import { User } from "@/types/user";
import React from "react";

interface OrderDetailUserProps {
  user: User;
  shippingAddress: Address;
  invoiceAddress: Address;
}

const OrderDetailUser = ({
  user,
  shippingAddress,
  invoiceAddress,
}: OrderDetailUserProps) => {
  return (
    <>
      {user.is_real ? (
        <div className="col-span-1 pt-2 pb-6 px-3 rounded-sm border space-y-2.5">
          <h5 className="font-bold">Customer</h5>
          <div className="flex items-start gap-2.5">
            <div className="text-sm">
              <div>
                {user.first_name} {user.last_name}
              </div>
              <div>{user.email}</div>
              <div>{user.phone_number}</div>
              {user.tax_id && <div>{user.tax_id}</div>}
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
              {user.company_name ? (
                user.company_name
              ) : (
                <div>{invoiceAddress.recipient_name}</div>
              )}
              <div>{user.tax_id ? user.tax_id : ""}</div>
              <div>{invoiceAddress.address_line}</div>
              <div>{invoiceAddress.additional_address_line}</div>
              <div className="flex gap-1">
                <div>{invoiceAddress.postal_code}</div>
                <div>{invoiceAddress.city}</div>
              </div>
              <div>{getCountryName(invoiceAddress.country)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="col-span-1 py-2 px-3 rounded-sm border space-y-2.5 flex-1">
        <h5 className="font-bold">Shipping address</h5>
        <div className="space-y-2.5">
          <div className="text-sm">
            <div>{shippingAddress.recipient_name}</div>
            <div>{shippingAddress.phone_number}</div>
            <div>{shippingAddress.address_line}</div>
            <div>{shippingAddress.additional_address_line}</div>
            <div className="flex gap-1">
              <div>{shippingAddress.postal_code}</div>
              <div>{shippingAddress.city}</div>
            </div>
            <div>{getCountryName(shippingAddress.country)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailUser;
