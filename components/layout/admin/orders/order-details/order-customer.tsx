import { getCountryName } from "@/lib/country-name";
import { Address } from "@/types/address";
import { User } from "@/types/user";
import React from "react";
import { Building2, FileText, MapPinHouse, UserRound } from "lucide-react";

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
  const customerName = fullName || user?.company_name || "";
  const shippingName =
    (user?.company_name && !shippingAddress?.recipient_name
      ? user.company_name
      : shippingAddress?.recipient_name) || customerName;
  const invoiceCountry = invoiceAddress?.country
    ? getCountryName(invoiceAddress.country)
    : "";
  const shippingCountry = shippingAddress?.country
    ? getCountryName(shippingAddress.country)
    : "";
  const invoiceCityLine = [invoiceAddress?.postal_code, invoiceAddress?.city]
    .filter(Boolean)
    .join(" ");
  const shippingCityLine = [shippingAddress?.postal_code, shippingAddress?.city]
    .filter(Boolean)
    .join(" ");
  const shippingEmail =
    shippingAddress?.email ||
    ((user?.email ?? "").toLowerCase() !== "guest" ? user?.email ?? "" : "");

  return (
    <>
      {user?.is_real ? (
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <UserRound className="size-4 text-slate-500" />
              Customer
            </h5>
          </div>
          <div className="text-sm leading-6 text-slate-700">
            <div className="font-medium text-slate-900">{customerName}</div>
            {user?.email ? <div>{user.email}</div> : null}
            {user?.phone_number ? <div>{user.phone_number}</div> : null}
            {!!user?.tax_id && <div>{user.tax_id}</div>}
          </div>
        </div>
      ) : null}

      {invoiceAddress ? (
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
              <FileText className="size-4 text-slate-500" />
              Invoice address
            </h5>
          </div>
          <div className="text-sm leading-6 text-slate-700">
            <div className="font-medium text-slate-900">
              {user?.company_name
                ? user.company_name
                : invoiceAddress?.recipient_name || customerName}
            </div>
            {user?.tax_id ? <div>{user.tax_id}</div> : null}
            {invoiceAddress?.address_line ? (
              <div>{invoiceAddress.address_line}</div>
            ) : null}
            {invoiceAddress?.additional_address_line ? (
              <div>{invoiceAddress.additional_address_line}</div>
            ) : null}
            {invoiceCityLine ? <div>{invoiceCityLine}</div> : null}
            {invoiceCountry ? <div>{invoiceCountry}</div> : null}
          </div>
        </div>
      ) : null}

      <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <MapPinHouse className="size-4 text-slate-500" />
            Shipping address
          </h5>
          <Building2 className="size-4 text-slate-400" />
        </div>
        <div className="text-sm leading-6 text-slate-700">
          <div className="font-medium text-slate-900">{shippingName}</div>
          {shippingAddress?.phone_number ? (
            <div>{shippingAddress.phone_number}</div>
          ) : null}
          {shippingAddress?.address_line ? (
            <div>{shippingAddress.address_line}</div>
          ) : null}
          {shippingAddress?.additional_address_line ? (
            <div>{shippingAddress.additional_address_line}</div>
          ) : null}
          {shippingCityLine ? <div>{shippingCityLine}</div> : null}
          {shippingCountry ? <div>{shippingCountry}</div> : null}
          {shippingEmail ? <div>{shippingEmail}</div> : null}
        </div>
      </div>
    </>
  );
};

export default OrderDetailUser;
