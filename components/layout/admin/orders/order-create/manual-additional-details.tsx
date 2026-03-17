"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar, Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";

interface ManualAdditionalInformationProps {
  isAdmin?: boolean;
}

export default function ManualAdditionalInformation({
  isAdmin = false,
}: ManualAdditionalInformationProps) {
  const form = useFormContext();
  const [marketplaceDisplay, setMarketplaceDisplay] = useState("");
  const [openMarketplacePopover, setOpenMarketplacePopover] = useState(false);
  const marketplace = form.watch("from_marketplace");
  const isDirty = form.formState.isDirty;
  const isNettoMarketplace =
    String(marketplace ?? marketplaceDisplay ?? "").toLowerCase() === "netto";

  const carriers = [
    { id: "spedition", logo: "/amm.jpeg" },
    { id: "dpd", logo: "/dpd.jpeg" },
    { id: "dhl", logo: "/dhl.png" },
    { id: "gls", logo: "/gls-new.png" },
    { id: "ups", logo: "/ups.png" },
    { id: "hermes", logo: "/hermes.png" },
    { id: "fexed", logo: "/fedex.png" },
  ];

  const marketplaceOptions = useMemo(
    () =>
      [
        { value: "amazon", label: "Amazon" },
        { value: "inprodius", label: "Inprodius" },
        { value: "netto", label: "Netto" },
        { value: "freakout", label: "FreakOut" },
        { value: "praktiker", label: "Praktiker" },
        { value: "norma", label: "Norma24" },
        { value: "check24", label: "Check24" },
        { value: "channel21", label: "Channel21" },
        { value: "hornbach", label: "Hornbach" },
        { value: "forstinger", label: "Forstinger" },
        { value: "neckermann", label: "Neckermann" },
        { value: "bauhaus", label: "Bauhaus" },
        { value: "euro-tops", label: "Euro Tops" },
        { value: "XXXLUTZ", label: "XXXLUTZ" },
        { value: "prestige", label: "Prestige Home" },
      ].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" })),
    [],
  );

  const selectedMarketplaceOption = useMemo(
    () =>
      marketplaceOptions.find(
        (option) =>
          option.value.toLowerCase() === String(marketplaceDisplay).toLowerCase(),
      ),
    [marketplaceOptions, marketplaceDisplay],
  );

  useEffect(() => {
    if (!isDirty && marketplace == null) {
      setMarketplaceDisplay("");
      return;
    }

    if (marketplace != null) {
      setMarketplaceDisplay(marketplace);
    }
  }, [marketplace, isDirty]);

  useEffect(() => {
    if (!isNettoMarketplace) {
      form.setValue("netto_buyer_id", null);
    }
  }, [isNettoMarketplace, form]);

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
                <Popover
                  open={openMarketplacePopover}
                  onOpenChange={setOpenMarketplacePopover}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMarketplacePopover}
                      className="w-full justify-between font-normal border"
                    >
                      {selectedMarketplaceOption?.label ?? "Select marketplace"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[80] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto">
                    <Command>
                      <CommandInput placeholder="Search marketplace..." />
                      <CommandEmpty>No marketplace found.</CommandEmpty>
                      <CommandList className="max-h-[220px]">
                        <CommandGroup>
                          {marketplaceOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={`${option.label} ${option.value}`}
                              onSelect={() => {
                                if (option.value === "prestige") {
                                  setMarketplaceDisplay("prestige");
                                  field.onChange(null);
                                } else {
                                  setMarketplaceDisplay(option.value);
                                  field.onChange(option.value);
                                }
                                setOpenMarketplacePopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  marketplaceDisplay?.toLowerCase() ===
                                    option.value.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

        {isNettoMarketplace && (
          <FormField
            control={form.control}
            name="netto_buyer_id"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel className="text-black font-semibold text-sm">
                  Netto Customer ID
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
        )}

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
