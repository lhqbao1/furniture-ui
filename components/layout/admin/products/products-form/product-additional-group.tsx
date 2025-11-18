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
import { useUploadStaticFile } from "@/features/file/hook";
import { toast } from "sonner";

const ProductAdditionalInputs = () => {
  const form = useFormContext();
  const uploadFileMutation = useUploadStaticFile();

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

  const handleUploadPDF = async (files: File[]) => {
    try {
      const urls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("files", file);

        const res = await uploadFileMutation.mutateAsync(formData);

        if (res?.results[0]?.url) {
          urls.push(res?.results[0]?.url);
        }
      }

      // Ghép URL thành | | |
      const joined = urls.join("|");

      form.setValue("pdf_files", joined, { shouldDirty: true });

      return joined;
    } catch (err) {
      console.error(err);
      toast.error("Upload PDF failed");
    }
  };

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

      <FormField
        control={form.control}
        name="pdf_files"
        render={({ field }) => (
          <FormItem className="flex flex-col w-full">
            <FormLabel className="text-black font-semibold text-sm">
              PDF Files
            </FormLabel>

            <FormControl>
              <div className="space-y-3">
                {/* Upload input */}
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  id="pdf-upload"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    const urls = await handleUploadPDF(files);
                    field.onChange(urls);
                  }}
                />

                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex items-center gap-2 text-sm w-fit px-4 py-1.5 border rounded-md text-center bg-white hover:bg-secondary/10 transition"
                >
                  {uploadFileMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Upload className="size-6" />
                      Upload file(s)
                    </>
                  )}
                </label>

                {/* Preview list */}
                <div className="space-y-2">
                  {field.value &&
                    field.value.length > 0 &&
                    field.value.split("|").map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border p-2 rounded-md bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-red-500 font-bold">PDF</div>
                          <span className="text-sm truncate max-w-[180px]">
                            {url.split("/").pop()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            // remove file
                            const filtered = field.value
                              .split("|")
                              .filter((u: string) => u !== url)
                              .join("|");

                            field.onChange(filtered);
                          }}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </FormControl>

            <FormMessage />
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
    </div>
  );
};

export default ProductAdditionalInputs;
