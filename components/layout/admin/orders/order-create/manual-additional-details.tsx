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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { Calendar, Check, ChevronsUpDown, Receipt, Wallet } from "lucide-react";
import Image from "next/image";
import { ProductItem } from "@/types/products";
import { calculateShippingGrossFromNet } from "@/lib/caculate-vat";
import { getCountryCode } from "@/components/shared/getCountryNameDe";

type ManualSelectedProduct = {
  product: ProductItem;
  quantity: number;
  final_price: number;
};

interface ManualAdditionalInformationProps {
  listProducts?: ManualSelectedProduct[];
}

export default function ManualAdditionalInformation({
  listProducts = [],
}: ManualAdditionalInformationProps) {
  const form = useFormContext();
  const [marketplaceDisplay, setMarketplaceDisplay] = useState("");
  const [openMarketplacePopover, setOpenMarketplacePopover] = useState(false);
  const marketplace = form.watch("from_marketplace");
  const priceMode = form.watch("price_mode") ?? "gross";
  const totalShippingInput = Number(form.watch("total_shipping") ?? 0) || 0;
  const countryCode = getCountryCode(form.watch("country"));
  const taxId = form.watch("tax_id") ?? null;
  const effectiveTaxIdForVat = countryCode === "AT" ? "__AT_ZERO_VAT__" : taxId;
  const isDirty = form.formState.isDirty;
  const isNettoMarketplace =
    String(marketplace ?? marketplaceDisplay ?? "").toLowerCase() === "netto";

  const shippingGrossPreview = useMemo(() => {
    if (priceMode !== "net") return 0;

    const converted = calculateShippingGrossFromNet(
      listProducts.map((item) => ({
        unitNet: Number(item.final_price) || 0,
        quantity: Number(item.quantity) || 0,
        tax: item.product?.tax ?? null,
      })),
      totalShippingInput,
      countryCode,
      effectiveTaxIdForVat,
    );

    return Number(converted.gross) || 0;
  }, [
    countryCode,
    effectiveTaxIdForVat,
    listProducts,
    priceMode,
    totalShippingInput,
  ]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
        { value: "econelo", label: "Econelo" },
        { value: "freakout", label: "FreakOut" },
        { value: "praktiker", label: "Praktiker" },
        { value: "norma", label: "Norma24" },
        { value: "check24", label: "Check24" },
        { value: "channel21", label: "Channel21" },
        { value: "hornbach", label: "Hornbach" },
        { value: "forstinger", label: "Forstinger" },
        { value: "neckermann", label: "Neckermann" },
        { value: "bauhaus", label: "Bauhaus" },
        { value: "bader", label: "Bader" },
        { value: "euro-tops", label: "Euro Tops" },
        { value: "XXXLUTZ", label: "XXXLUTZ" },
        { value: "prestige", label: "Prestige Home" },
      ].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const selectedMarketplaceOption = useMemo(
    () =>
      marketplaceOptions.find(
        (option) =>
          option.value.toLowerCase() ===
          String(marketplaceDisplay).toLowerCase(),
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
      <FormField
        control={form.control}
        name="price_mode"
        render={({ field }) => (
          <FormItem className="space-y-2 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price Mode
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value ?? "gross"}
                onValueChange={(value) => field.onChange(value)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <FormItem className="space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="gross"
                      id="price-mode-gross"
                      className="peer sr-only"
                    />
                  </FormControl>
                  <Label
                    htmlFor="price-mode-gross"
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                      (field.value ?? "gross") === "gross"
                        ? "border-secondary bg-secondary/15 text-secondary shadow-sm"
                        : "border-border bg-background hover:border-secondary/40 hover:bg-secondary/5",
                    )}
                  >
                    <Wallet className="size-5 shrink-0" />
                    <span className="font-semibold">Gross</span>
                  </Label>
                </FormItem>

                <FormItem className="space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="net"
                      id="price-mode-net"
                      className="peer sr-only"
                    />
                  </FormControl>
                  <Label
                    htmlFor="price-mode-net"
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                      field.value === "net"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-border bg-background hover:border-blue-300 hover:bg-blue-50/60",
                    )}
                  >
                    <Receipt className="size-5 shrink-0" />
                    <span className="font-semibold">Net</span>
                  </Label>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
              {priceMode === "net" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Gross: € {formatCurrency(shippingGrossPreview)}
                </p>
              )}
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
