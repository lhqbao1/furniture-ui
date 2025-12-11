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
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { COUNTRY_OPTIONS } from "@/data/data";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { getUserById } from "@/features/users/api";
import { useQuery } from "@tanstack/react-query";

interface CheckOutUserInformationProps {
  userId?: string;
}

function CheckOutUserInformation({ userId }: CheckOutUserInformationProps) {
  const [userIdLogin, setUserIdLogin] = useAtom(userIdAtom);
  const form = useFormContext();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const isLogin = !!userIdLogin;

  const { data: userData } = useQuery({
    queryKey: ["user", userIdLogin],
    queryFn: () => getUserById(userIdLogin ?? ""),
    enabled: !!userIdLogin,
    retry: false,
  });

  // Khi user login → đổ dữ liệu vào form
  useEffect(() => {
    if (!userData) return;

    form.reset({
      first_name: userData.first_name ?? "",
      last_name: userData.last_name ?? "",
      email: userData.email ?? "",
      phone_number: userData.phone_number ?? "",
      gender: userData.gender ?? "",
      company_name: userData.company_name ?? "",
      tax_id: userData.tax_id ?? "",

      // invoice_address_line:
      //   userData.default_invoice_address?.address_line ?? "",
      // invoice_address_additional:
      //   userData.default_invoice_address?.additional_address_line ?? "",
      // invoice_postal_code: userData.default_invoice_address?.postal_code ?? "",
      // invoice_city: userData.default_invoice_address?.city ?? "",
      // invoice_country: userData.default_invoice_address?.country ?? "",
    });
  }, [userData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 px-2 py-3">
        <h2 className="text-lg text-black font-semibold mb-0">
          {t("shippingDetails")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>{t("gender")}</FormLabel> */}
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("male")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("female")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex gap-1 items-center">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="ml-2">{t("otherGender")}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("firstName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={isLogin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("lastName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={isLogin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>
                {t("companyName")} ({t("optional")})
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>
                {t("taxCode")} ({t("optional")})
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder=""
                  {...field}
                  disabled={isLogin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phone_number")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder=""
                  {...field}
                  disabled={isLogin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="invoice_address_line"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t("streetAndHouse")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_address_additional"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                {t("addressSupplement")} ({t("optional")})
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("postalCode")}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("city")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_country"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black text-sm">
                {t("country")}
              </FormLabel>

              <Popover
                open={open}
                onOpenChange={setOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      onClick={() => setOpen(!open)}
                    >
                      {field.value
                        ? COUNTRY_OPTIONS.find((c) => c.value === field.value)
                            ?.label
                        : "Select country"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 h-[150px]">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>{t("noCountry")}</CommandEmpty>
                      <CommandGroup>
                        {COUNTRY_OPTIONS.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.label}
                            onSelect={() => {
                              field.onChange(c.value);
                              setOpen(false); // 🔥 đóng popover sau khi chọn
                            }}
                            className="cursor-pointer"
                          >
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default React.memo(CheckOutUserInformation);
