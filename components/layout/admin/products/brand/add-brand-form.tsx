import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandDefaultValues, brandFormSchema, type BrandFormValues } from "@/lib/schema/brand";
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
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AddOrEditBrandFormProps = {
    onSuccess?: (brand: BrandResponse) => void
    submitText?: string
    onClose?: () => void
    brandValues?: BrandResponse
};

export default function AddOrEditBrandForm({ onSuccess, submitText, onClose, brandValues }: AddOrEditBrandFormProps) {
    const form = useForm<BrandFormValues>({
        resolver: zodResolver(brandFormSchema),
        defaultValues: brandValues ?
            {
                name: brandValues.name,
                static_files: [{
                    url: brandValues.img_url
                }],
                company_address: brandValues.company_address,
                company_email: brandValues.company_email,
                company_name: brandValues.company_name
            }
            : brandDefaultValues,
    });

    const createBrand = useCreateBrand();
    const editBrand = useEditBrand()

    async function handleSubmit(values: BrandFormValues) {
        if (brandValues) {
            editBrand.mutate({
                id: brandValues.id,
                input: {
                    name: values.name,
                    company_name: values.company_name,
                    company_address: values.company_address,
                    company_email: values.company_email,
                    ...(values.static_files?.[0]?.url
                        ? { img_url: values.static_files[0].url }
                        : {}),
                }
            }, {
                onSuccess(data, variables, context) {
                    toast.success("Create brand successful")
                    form.reset();
                    onClose?.()
                },
                onError(error, variables, context) {
                    toast.error("Create brand fail")
                },
            });
        } else {
            createBrand.mutate({
                name: values.name,
                company_name: values.company_name,
                company_address: values.company_address,
                company_email: values.company_email,
                ...(values.static_files?.[0]?.url
                    ? { img_url: values.static_files[0].url }
                    : {}),
            }, {
                onSuccess(data, variables, context) {
                    toast.success("Create brand successful")
                    form.reset();
                    onClose?.()
                },
                onError(error, variables, context) {
                    toast.error("Create brand fail")
                },
            });
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(
                    (values) => {
                        handleSubmit(values)
                    },
                    (errors) => {
                        toast.error("Please check the form for errors")
                    }
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
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <ImagePickerInput fieldName="static_files" form={form} />

                <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brand company</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
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
                            <FormLabel>Brand company email</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
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
                            <FormLabel>Brand company address</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
