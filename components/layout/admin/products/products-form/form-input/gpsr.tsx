'use client'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useGetBrands } from '@/features/brand/hook'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const GpsrInput = () => {
    const form = useFormContext()
    const { data: brands, isLoading: isLoadingBrand, isError: isErrorBrand } = useGetBrands()

    return (
        <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => {
                const selectedBrand = brands?.find((b) => b.id === field.value)

                return (
                    <FormItem className="grid grid-cols-6 w-full">
                        <FormLabel className="text-[#666666] text-sm col-span-6">
                            Brand
                        </FormLabel>
                        <FormControl className="col-span-6">
                            <div>
                                {brands ? (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full border font-light">
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Loader2 className="animate-spin" />
                                )}

                                {/* Hiển thị thông tin dưới brand đã chọn */}
                                {selectedBrand && (
                                    <ul className="list-disc list-inside mt-2 ml-2 text-sm text-black space-y-1">
                                        <li>{selectedBrand.company_email}</li>
                                        <li>{selectedBrand.company_address}</li>
                                    </ul>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage className="col-span-6" />
                    </FormItem>
                )
            }}
        />
    )
}

export default GpsrInput
