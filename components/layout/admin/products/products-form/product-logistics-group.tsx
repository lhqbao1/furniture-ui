import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import React from 'react'
import { useFormContext } from 'react-hook-form'

const ProductLogisticsGroup = () => {
    const form = useFormContext()
    const carriers = [
        { id: "amm", logo: "/amm.jpeg" },
        { id: "dpd", logo: "/dpd.jpeg" },
    ]
    const deliveryTimes = ["1-3", "3-5", "5-8", "5-14", "8-14", "14-20"]

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-3 gap-6'>
                {/* Carrier field */}
                <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Carrier
                            </FormLabel>
                            <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger placeholderColor className='border col-span-4 font-light'>
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
                    )}
                />

                {/* Delivery time field */}
                <FormField
                    control={form.control}
                    name="delivery_time"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Delivery time
                            </FormLabel>
                            <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger placeholderColor className='border col-span-4 font-light'>
                                        <SelectValue placeholder="Select delivery time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deliveryTimes.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Product packaging number */}
                <FormField
                    control={form.control}
                    name="packaging_amount"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-1'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Number of packages
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} className='col-span-4' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className='flex gap-6'>
                {/* Tariff Number */}
                <FormField
                    control={form.control}
                    name="tariff_number"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Tariff Number
                            </FormLabel>
                            <FormControl>
                                <Input
                                    className='col-span-4'
                                    placeholder=""
                                    min={0}
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value
                                        )
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/*Incoterm */}
                <FormField
                    control={form.control}
                    name="incoterm"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full'>
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Incoterm
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} className='col-span-4' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Pallet unit input */}
                <FormField
                    control={form.control}
                    name="pallet_unit"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                            <FormLabel className='text-black font-semibold text-sm'>
                                Pallet unit
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                    }
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <div className='flex gap-6'>
                {/* Packaging input */}
                <div className='flex flex-col w-full'>
                    <div className='col-span-2 text-sm text-black font-semibold'>Packaging (cm)</div>
                    <div className='flex flex-row gap-1 col-span-4'>
                        <FormField
                            control={form.control}
                            name='length'
                            render={({ field }) => (
                                <FormItem className='flex flex-col-reverse items-center'>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder=""
                                            min={0}
                                            step="0.01"
                                            inputMode="decimal"
                                            {...field}
                                            value={field.value ?? ""} // null hoặc undefined => ""
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? null : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormLabel className='text-black font-semibold text-sm'>
                                        Length
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='height'
                            render={({ field }) => (
                                <FormItem className='flex flex-col-reverse items-center'>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder=""
                                            min={0}
                                            step="0.01"
                                            inputMode="decimal"
                                            {...field}
                                            value={field.value ?? ""} // null hoặc undefined => ""
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? null : e.target.valueAsNumber
                                                )
                                            } />
                                    </FormControl>
                                    <FormLabel className='text-black font-semibold text-sm'>
                                        Height
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='width'
                            render={({ field }) => (
                                <FormItem className='flex flex-col-reverse items-center'>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder=""
                                            min={0}
                                            step="0.01"
                                            inputMode="decimal"
                                            {...field}
                                            value={field.value ?? ""} // null hoặc undefined => ""
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? null : e.target.valueAsNumber
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormLabel className='text-black font-semibold text-sm'>
                                        Width
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Weight input */}
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full justify-end">
                            <FormLabel className="text-black font-semibold text-sm col-span-2">
                                Weight (kg)
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Weight"
                                    min={0}
                                    step="0.01"
                                    inputMode="decimal"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                    className="col-span-4"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

            </div>
        </div>
    )
}

export default ProductLogisticsGroup