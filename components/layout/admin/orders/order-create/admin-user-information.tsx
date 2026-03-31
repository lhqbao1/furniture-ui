"use client";

import { useFormContext, useWatch } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BRAND_COUNTRY_OPTIONS } from "@/data/data";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteInformationManualOrder,
  useGetInformationManualOrders,
} from "@/features/user-order/hook";
import { InformationManualOrderResponse } from "@/features/user-order/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AdminCheckOutUserInformationProps {
  isAdmin?: boolean;
  disabledFields: string[];
  saveUserInformation: boolean;
  onSaveUserInformationChange: (checked: boolean) => void;
  onSavedUserSelectionChange?: (selected: boolean) => void;
}

export function AdminCheckOutUserInformation({
  isAdmin = false,
  disabledFields,
  saveUserInformation,
  onSaveUserInformationChange,
  onSavedUserSelectionChange,
}: AdminCheckOutUserInformationProps) {
  const form = useFormContext();
  const setValue = form.setValue;
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [selectedSavedUserKey, setSelectedSavedUserKey] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    value: string;
    label: string;
  } | null>(null);
  const deleteInformationManualOrderMutation =
    useDeleteInformationManualOrder();
  const { data: savedUsersResponse, isLoading: isLoadingSavedUsers } =
    useGetInformationManualOrders();

  const savedUsers = useMemo<InformationManualOrderResponse[]>(() => {
    if (Array.isArray(savedUsersResponse)) return savedUsersResponse;
    if (Array.isArray(savedUsersResponse?.results))
      return savedUsersResponse.results;
    return [];
  }, [savedUsersResponse]);

  const savedUserOptions = useMemo(
    () =>
      savedUsers.map((savedUser, index) => {
        const optionValue =
          savedUser.id != null ? String(savedUser.id) : `saved-user-${index}`;
        const fullName = [savedUser.first_name, savedUser.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const emailLabel = savedUser.email?.trim() ?? "";
        const addressLabel = savedUser.address?.trim() ?? "";
        const postalCodeLabel = savedUser.postal_code?.trim() ?? "";
        const cityLabel = savedUser.city?.trim() ?? "";
        const primaryLabel =
          savedUser.company?.trim() ||
          fullName ||
          emailLabel ||
          `Saved user ${index + 1}`;
        const details = [
          primaryLabel === emailLabel ? "" : emailLabel,
          addressLabel,
          postalCodeLabel,
          cityLabel,
        ].filter(Boolean);
        const secondaryLabel =
          details.length > 0 ? ` - ${details.join(" - ")}` : "";

        return {
          value: optionValue,
          id: savedUser.id != null ? String(savedUser.id) : "",
          label: `${primaryLabel}${secondaryLabel}`,
          savedUser,
        };
      }),
    [savedUsers],
  );

  const phoneNumber = useWatch({
    control: form.control,
    name: "phone_number",
  });

  const firstName = useWatch({
    control: form.control,
    name: "first_name",
  });

  const lastName = useWatch({
    control: form.control,
    name: "last_name",
  });

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  const applySavedUserToForm = (savedUser: InformationManualOrderResponse) => {
    const fullName = [savedUser.first_name?.trim(), savedUser.last_name?.trim()]
      .filter(Boolean)
      .join(" ")
      .trim();

    form.setValue("gender", savedUser.gender ?? "", { shouldDirty: true });
    form.setValue("first_name", savedUser.first_name ?? "", {
      shouldDirty: true,
    });
    form.setValue("last_name", savedUser.last_name ?? "", {
      shouldDirty: true,
    });
    form.setValue("company_name", savedUser.company ?? "", {
      shouldDirty: true,
    });
    form.setValue("tax_id", savedUser.tax_id ?? "", { shouldDirty: true });
    form.setValue("email", savedUser.email ?? "", { shouldDirty: true });
    form.setValue("phone_number", savedUser.phone_number ?? "", {
      shouldDirty: true,
    });

    form.setValue("invoice_address", savedUser.address ?? "", {
      shouldDirty: true,
    });
    form.setValue(
      "invoice_additional_address",
      savedUser.additional_address ?? "",
      { shouldDirty: true },
    );
    form.setValue("invoice_city", savedUser.city ?? "", { shouldDirty: true });
    form.setValue("invoice_postal_code", savedUser.postal_code ?? "", {
      shouldDirty: true,
    });
    form.setValue("invoice_country", savedUser.country ?? "DE", {
      shouldDirty: true,
    });
    form.setValue("invoice_recipient_name", fullName, { shouldDirty: true });
    form.setValue("invoice_phone", savedUser.phone_number ?? "", {
      shouldDirty: true,
    });
    form.setValue("email_invoice", savedUser.email ?? "", {
      shouldDirty: true,
    });

    form.setValue("recipient_name", savedUser.recipient_name ?? fullName, {
      shouldDirty: true,
    });
    form.setValue(
      "phone",
      savedUser.recipient_phone_number ?? savedUser.phone_number ?? "",
      {
        shouldDirty: true,
      },
    );
    form.setValue(
      "email_shipping",
      savedUser.recipient_email ?? savedUser.email ?? "",
      {
        shouldDirty: true,
      },
    );
    form.setValue(
      "address",
      savedUser.recipient_address ?? savedUser.address ?? "",
      {
        shouldDirty: true,
      },
    );
    form.setValue(
      "additional_address",
      savedUser.recipient_additional_address ??
        savedUser.additional_address ??
        "",
      {
        shouldDirty: true,
      },
    );
    form.setValue("city", savedUser.recipient_city ?? savedUser.city ?? "", {
      shouldDirty: true,
    });
    form.setValue(
      "postal_code",
      savedUser.recipient_postal_code ?? savedUser.postal_code ?? "",
      {
        shouldDirty: true,
      },
    );
    form.setValue(
      "country",
      savedUser.recipient_country ?? savedUser.country ?? "DE",
      {
        shouldDirty: true,
      },
    );
    form.setValue("same_as_invoice", savedUser.same_as_invoice ?? true, {
      shouldDirty: true,
    });
  };

  const handleSavedUserSelect = (value: string) => {
    if (value === "__none__") {
      setSelectedSavedUserKey("");
      onSavedUserSelectionChange?.(false);
      return;
    }

    const selectedOption = savedUserOptions.find(
      (option) => option.value === value,
    );
    if (!selectedOption) return;

    setSelectedSavedUserKey(value);
    applySavedUserToForm(selectedOption.savedUser);
    onSavedUserSelectionChange?.(true);
  };

  const handleOpenDeleteDialog = (option: {
    id: string;
    value: string;
    label: string;
  }) => {
    if (!option.id) return;
    setDeleteTarget(option);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteSavedUser = () => {
    if (!deleteTarget?.id) return;

    deleteInformationManualOrderMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Delete saved user information successfully");
        if (selectedSavedUserKey === deleteTarget.value) {
          setSelectedSavedUserKey("");
          onSavedUserSelectionChange?.(false);
        }
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Delete saved user information fail");
      },
    });
  };

  // Sync invoice_phone = phone_number
  useEffect(() => {
    setValue("email_invoice", email ?? "");
    setValue("invoice_phone", phoneNumber ?? "");
    setValue(
      "invoice_recipient_name",
      [firstName, lastName].filter(Boolean).join(" "),
    );
  }, [email, phoneNumber, firstName, lastName, setValue]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">User Information</h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="save-user-information"
            checked={saveUserInformation}
            onCheckedChange={(checked) =>
              onSaveUserInformationChange(checked === true)
            }
          />
          <Label
            htmlFor="save-user-information"
            className="text-sm font-medium"
          >
            Save user information
          </Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormItem>
            <FormLabel>Saved User Information</FormLabel>
            <Select
              value={selectedSavedUserKey || undefined}
              onValueChange={handleSavedUserSelect}
            >
              <FormControl>
                <SelectTrigger className="border">
                  <SelectValue
                    placeholder={
                      isLoadingSavedUsers ? "Loading..." : "Select saved user"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__none__">Manual input</SelectItem>
                {savedUserOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="pr-12"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {option.id ? (
                        <button
                          type="button"
                          className="rounded p-1 text-red-500 hover:bg-red-50 pointer-events-auto cursor-pointer"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleOpenDeleteDialog(option);
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                          }}
                          aria-label={`Delete ${option.label}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>

        <div className="col-span-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>{t("gender")}</FormLabel> */}
                <FormControl>
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value ?? ""}
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
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
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
              <FormLabel>Last Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
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
              <FormLabel>Company name (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""} // 👈 đảm bảo controlled
                  disabled={disabledFields.includes("company_name")}
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
            <FormItem>
              <FormLabel>Tax ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabledFields.includes("tax_id")}
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
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
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
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder=""
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Nếu input trống => set null
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
          name="invoice_address"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Street and House number</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={disabledFields.includes("invoice_address")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_additional_address"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>
                {isAdmin
                  ? "Additional Address line"
                  : t("additionalAddressLine")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""} // 👈 đảm bảo controlled
                />
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
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={disabledFields.includes("invoice_postal_code")}
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
              <FormLabel className="text-black font-semibold text-sm">
                City
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  disabled={disabledFields.includes("invoice_city")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_country"
          render={({ field }) => {
            const isDisabled = disabledFields.includes("invoice_country"); // hoặc logic của bạn

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black font-semibold text-sm">
                  Country
                </FormLabel>

                <Popover
                  open={isDisabled ? false : open} // ❌ Không cho mở nếu disabled
                  onOpenChange={(val) => !isDisabled && setOpen(val)}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={isDisabled} // 🔥 Disable UI
                      >
                        {field.value
                          ? BRAND_COUNTRY_OPTIONS.find(
                              (c) => c.value === field.value,
                            )?.label
                          : "Select country"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  {!isDisabled /* ❗ Không render popover khi disabled */ && (
                    <PopoverContent className="w-full p-0 h-[250px] pointer-events-auto">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {BRAND_COUNTRY_OPTIONS.map((c) => (
                              <CommandItem
                                key={c.value}
                                value={c.label}
                                onSelect={() => {
                                  field.onChange(c.value);
                                  setOpen(false);
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
                  )}
                </Popover>

                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(openState) => {
          setDeleteDialogOpen(openState);
          if (!openState) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete saved user information</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this saved user information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                className="bg-gray-400 text-white hover:bg-gray-500"
                disabled={deleteInformationManualOrderMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleConfirmDeleteSavedUser}
              hasEffect
              variant="secondary"
              disabled={
                deleteInformationManualOrderMutation.isPending || !deleteTarget
              }
            >
              {deleteInformationManualOrderMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
