"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import GpsrInput from "./form-input/gpsr";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { COLORS, tags } from "@/data/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import countries from "world-countries";
import { ColorSelect } from "./form-input/color-seclect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ProductAdditionalInputs = () => {
  const form = useFormContext();

  const unit = [
    { id: "pcs." },
    { id: "set" },
    { id: "liter" },
    { id: "kg" },
    { id: "m2" },
  ];

  const priorityCountries = ["Vietnam", "Germany", "China"];

  const sortedCountries = [...countries].sort((a, b) => {
    const aPriority = priorityCountries.includes(a.name.common);
    const bPriority = priorityCountries.includes(b.name.common);
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return a.name.common.localeCompare(b.name.common);
  });

  const countryOptions = sortedCountries.map((c) => ({
    value: c.name.common,
    label: c.name.common,
  }));

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Brand */}
        <GpsrInput />

        {/* Product materials */}
        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem className="flex flex-col col-span-1">
              <FormLabel className="text-black font-semibold text-sm">
                Materials
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="col-span-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product color */}
        <ColorSelect />
      </div>

      {/* Manufacture Country */}
      <FormField
        control={form.control}
        name="manufacture_country"
        render={({ field }) => (
          <FormItem className="flex flex-col w-full">
            <FormLabel className="text-black font-semibold text-sm col-span-2">
              Manufacturing Country
            </FormLabel>
            <FormControl className="col-span-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between col-span-4",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value || "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search country..."
                      className="col-span-4"
                    />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandList className="h-[400px]">
                      <CommandGroup>
                        {countryOptions.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.value}
                            onSelect={() => field.onChange(c.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === c.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage className="col-span-6" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Product unit */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full col-span-1">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                Unit
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    placeholderColor
                    className="border col-span-4 font-light"
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unit.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                      >
                        <span className="">{c.id}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product amount unit */}
        <FormField
          control={form.control}
          name="amount_unit"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Amount Unit
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.value,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-6">
        {/* WEEE Nr */}
        <FormField
          control={form.control}
          name="weee_nr"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                WEEE Nr
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="col-span-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* EEK Label: */}
        <FormField
          control={form.control}
          name="weee_nr"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className="text-black font-semibold text-sm col-span-2">
                EEK Label
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ""}
                >
                  <SelectTrigger
                    placeholderColor
                    className="border w-full col-span-4 font-light"
                  >
                    <SelectValue placeholder="EEK Label" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F"].map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="col-span-6" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid lg:grid-cols-4 grid-cols-2 gap-6">
        {/* Product length */}
        <FormField
          control={form.control}
          name="length"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Product Length
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber,
                    )
                  }
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product width */}
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Product Width
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber,
                    )
                  }
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product height */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Product Height
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber,
                    )
                  }
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product net weight */}
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Product Net. Weight
              </FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber,
                    )
                  }
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormField
          control={form.control}
          name="is_fsc"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-3">
              <FormLabel className="text-black font-semibold text-sm">
                Is FCS?
              </FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={(val) => {
                    field.onChange(val === "true");
                  }}
                  value={field.value ? "true" : "false"}
                  className="flex gap-6"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">True</FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal">False</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProductAdditionalInputs;
