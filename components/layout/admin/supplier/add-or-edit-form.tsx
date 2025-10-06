import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupplierInput, SupplierResponse } from "@/types/supplier";
import { defaultSupplier, supplierSchema } from "@/lib/schema/supplier";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateSupplier, useEditSupplier } from "@/features/supplier/hook";

type AddOrEditSupplierFormProps = {
    onSuccess?: (supplier: SupplierResponse) => void
    submitText?: string
    onClose?: () => void
    supplierValues?: SupplierResponse
};

export default function AddOrEditSupplierForm({ onSuccess, submitText, onClose, supplierValues }: AddOrEditSupplierFormProps) {
    const form = useForm<SupplierInput>({
        resolver: zodResolver(supplierSchema),
        defaultValues: supplierValues ? supplierValues : defaultSupplier
    });

    const createSupplierMutation = useCreateSupplier();
    const editSupplierMutation = useEditSupplier()

    async function handleSubmit(values: SupplierInput) {
        if (supplierValues) {
            editSupplierMutation.mutate({
                id: supplierValues.id,
                input: values
            }, {
                onSuccess(data, variables, context) {
                    toast.success("Create supplier successful")
                    form.reset();
                    onClose?.()
                },
                onError(error, variables, context) {
                    toast.error("Create supplier fail")
                },
            });
        } else {
            createSupplierMutation.mutate(values, {
                onSuccess(data, variables, context) {
                    toast.success("Create supplier successful")
                    form.reset();
                    onClose?.()
                },
                onError(error, variables, context) {
                    toast.error("Create supplier fail")
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
                    name="salutation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salutation</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                >
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="MR" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Mr</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="MRS" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Mrs</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="NOT_SPECIFIED" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Other</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* First name */}
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Last name */}
                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* VAT ID */}
                <FormField
                    control={form.control}
                    name="vat_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>VAT ID</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter VAT ID" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email Order */}
                <FormField
                    control={form.control}
                    name="email_order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (Order)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter order email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email Billing */}
                <FormField
                    control={form.control}
                    name="email_billing"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (Billing)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter billing email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone Number */}
                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-end">
                    <Button
                        type="submit"
                        disabled={supplierValues ? editSupplierMutation.isPending : createSupplierMutation.isPending}
                        className="bg-primary hover:bg-primary font-semibold"
                    >
                        {supplierValues ? (
                            editSupplierMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                </>
                            ) : (
                                submitText ?? "Update Supplier"
                            )
                        ) : createSupplierMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            </>
                        ) : (
                            submitText ?? "Create Supplier"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
