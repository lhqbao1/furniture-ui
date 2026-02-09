"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import Image from "next/image";

interface ManualAdditionalInformationProps {
  isAdmin?: boolean;
}

export default function ManualAdditionalInformation({
  isAdmin = false,
}: ManualAdditionalInformationProps) {
  const form = useFormContext();

  const carriers = [
    { id: "spedition", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
    { id: "dhl", logo: "/dhl.png" },
    { id: "gls", logo: "/gls-new.png" },
    { id: "ups", logo: "/ups.png" },
    { id: "hermes", logo: "/hermes.png" },
    { id: "fexed", logo: "/fedex.png" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">
          Additional Information
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Address Line */}
        <FormField
          control={form.control}
          name="from_marketplace"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Marketplace
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "prestige" ? null : value);
                  }}
                  value={field.value ?? ""}
                >
                  <SelectTrigger placeholderColor className="border">
                    <SelectValue placeholder="Select marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="inprodius">Inprodius</SelectItem>
                    <SelectItem value="netto">Netto</SelectItem>
                    <SelectItem value="freakout">FreakOut</SelectItem>
                    <SelectItem value="praktiker">Praktiker</SelectItem>
                    <SelectItem value="norma">Norma24</SelectItem>
                    <SelectItem value="check24">Check24</SelectItem>
                    <SelectItem value="prestige">Prestige Home</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketplace_order_id"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Marketplace Order ID
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder=""
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    field.onChange(value === "" ? null : value);
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Status
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Payment received</SelectItem>
                    <SelectItem value="PENDING">Waiting for payment</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_discount"
          render={({ field }) => (
            <FormItem className="flex flex-col col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Discount
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="pl-7"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                  <span className="absolute left-3 text-gray-500">€</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_term"
          render={({ field }) => {
            const status = form.watch("status")?.toLowerCase();

            return (
              <FormItem className="flex flex-col col-span-1">
                <FormLabel className="text-black font-semibold text-sm">
                  Payment Term
                </FormLabel>
                <FormControl>
                  <div className="relative flex items-center w-full">
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      className="pl-8"
                      step="1"
                      value={field.value ?? ""}
                      disabled={status === "paid"} // ✅ DISABLED WHEN PAID
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.valueAsNumber,
                        )
                      }
                    />
                    <span className="absolute left-3 text-gray-500">
                      <Calendar className="size-4" />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="total_shipping"
          render={({ field }) => (
            <FormItem className="flex flex-col col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Total Shipping
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="pl-7"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                  <span className="absolute left-3 text-gray-500">€</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col w-full">
                <FormLabel className="text-black font-semibold text-sm col-span-2">
                  Carrier
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger
                      placeholderColor
                      className="border col-span-4 font-light"
                    >
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={c.logo}
                              alt={c.id}
                              width={30}
                              height={20}
                              className="object-contain"
                            />
                            <span className="uppercase">{c.id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
