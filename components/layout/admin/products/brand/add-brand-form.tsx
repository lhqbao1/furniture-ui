import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  brandDefaultValues,
  brandFormSchema,
  type BrandFormValues,
} from "@/lib/schema/brand";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BrandResponse } from "@/types/brand";
import { useCreateBrand, useEditBrand } from "@/features/brand/hook";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND_COUNTRY_OPTIONS, COUNTRY_OPTIONS } from "@/data/data";
import FormImageUpload from "./image-picker";

type AddOrEditBrandFormProps = {
  onSuccess?: (brand: BrandResponse) => void;
  submitText?: string;
  onClose?: () => void;
  brandValues?: BrandResponse;
};

export default function AddOrEditBrandForm({
  onSuccess,
  submitText,
  onClose,
  brandValues,
}: AddOrEditBrandFormProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: brandValues
      ? {
          name: brandValues.name,
          img_url: brandValues.img_url,
          company_address: brandValues.company_address,
          company_email: brandValues.company_email,
          company_name: brandValues.company_name,
          company_city: brandValues.company_city,
          company_country: brandValues.company_country,
          company_postal_code: brandValues.company_postal_code,
          company_phone: brandValues.company_phone,
        }
      : brandDefaultValues,
  });

  const createBrand = useCreateBrand();
  const editBrand = useEditBrand();

  async function handleSubmit(values: BrandFormValues) {
    if (brandValues) {
      editBrand.mutate(
        {
          id: brandValues.id,
          input: {
            name: values.name,
            company_name: values.company_name,
            company_address: values.company_address,
            company_email: values.company_email,
            img_url: values.img_url ? values?.img_url : "",
            company_city: values.company_city,
            company_country: values.company_country,
            company_postal_code: values.company_postal_code,
            company_phone: values.company_phone,
          },
        },
        {
          onSuccess(data, variables, context) {
            toast.success("Create brand successful");
            form.reset();
            onClose?.();
          },
          onError(error, variables, context) {
            toast.error("Create brand fail");
          },
        },
      );
    } else {
      createBrand.mutate(
        {
          name: values.name,
          company_name: values.company_name,
          company_address: values.company_address,
          company_email: values.company_email,
          img_url: values.img_url ? values?.img_url : "",
          company_city: values.company_city,
          company_country: values.company_country,
          company_postal_code: values.company_postal_code,
          company_phone: values.company_phone,
        },
        {
          onSuccess(data, variables, context) {
            toast.success("Create brand successful");
            form.reset();
            onClose?.();
          },
          onError(error, variables, context) {
            toast.error("Create brand fail");
          },
        },
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => {
            handleSubmit(values);
          },
          (errors) => {
            toast.error("Please check the form for errors");
          },
        )}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand name</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormImageUpload
          form={form}
          name="img_url"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company name</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>

                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      className="w-full border"
                      placeholderColor
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>

                    <SelectContent className="max-h-80">
                      {BRAND_COUNTRY_OPTIONS.map((c) => (
                        <SelectItem
                          key={c.value}
                          value={c.value}
                        >
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={brandValues ? editBrand.isPending : createBrand.isPending}
            className="bg-primary hover:bg-primary font-semibold"
          >
            {brandValues ? (
              editBrand.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  updating
                </>
              ) : (
                submitText ?? "Update Brand"
              )
            ) : createBrand.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                creating
              </>
            ) : (
              submitText ?? "Create Brand"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
