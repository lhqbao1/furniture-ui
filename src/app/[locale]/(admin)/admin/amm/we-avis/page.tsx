"use client"

import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner" // hoặc react-hot-toast nếu bạn dùng lib khác
import { File, Loader, Loader2 } from "lucide-react"
import { useImportAmmProducts } from "@/features/amm/hook"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { ammWeAvisDefaultValues, ammWeAvisSchema } from "@/lib/schema/amm-weavis"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const AmmWeAvisPage = () => {
    const [file, setFile] = useState<File | null>(null)
    const [open, setOpen] = useState(false)
    // 1. Define your form.
    const form = useForm<z.infer<typeof ammWeAvisSchema>>({
        resolver: zodResolver(ammWeAvisSchema),
        defaultValues: ammWeAvisDefaultValues,
    })
    const importAmmProductMutation = useImportAmmProducts()

    function onSubmit(values: z.infer<typeof ammWeAvisSchema>) {
        const formData = new FormData()

        // append tất cả các field text
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value))
            }
        })

        // append file nếu có
        if (values.file) {
            formData.append("file", values.file)
        }

        importAmmProductMutation.mutate(formData, {
            onSuccess: () => {
                toast.success("Import products successful")
                setOpen(false)
            },
            onError: () => {
                toast.error("Import products fail")
            },
        })

        toast.info("Uploading products…")
    }



    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]) // chỉ lấy file đầu tiên
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    })



    return (
        <Form {...form}>
            <h2 className="section-header mb-12">Import We Avis to AMM</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <div className="grid grid-cols-3 gap-8">
                    <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="order_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Order Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="AZ000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplier_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplier_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplier_city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier City</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplier_postal_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier Postal Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="shadcn" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supplier_country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier Country</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Delivery Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={
                                            field.value
                                                ? `${field.value.slice(0, 4)}-${field.value.slice(4, 6)}-${field.value.slice(6, 8)}`
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const raw = e.target.value // yyyy-mm-dd
                                            const compact = raw.replace(/-/g, "") // yyyymmdd
                                            field.onChange(compact)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="warehouse"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Warehouse</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div
                                        {...getRootProps()} // KHÔNG chặn onClick ở đây
                                        className={`mt-4 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
              ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}`}
                                    >
                                        <input
                                            {...getInputProps({
                                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const f = e.target.files?.[0]
                                                    if (f) {
                                                        field.onChange(f) // set File object vào form
                                                    }
                                                },
                                            })}
                                        />
                                        {field.value ? (
                                            <div className="flex gap-2 items-center">
                                                <File />
                                                <p className="text-sm text-gray-600">{field.value.name}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Drag & drop file here, or click to select
                                            </p>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="mt-8 text-lg px-8 py-1.5">Submit</Button>
            </form>
        </Form>
    )
}

export default AmmWeAvisPage
