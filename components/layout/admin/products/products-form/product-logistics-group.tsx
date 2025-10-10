import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

interface ProductLogisticsGroupProps {
    isDSP?: boolean
}

const ProductLogisticsGroup = ({ isDSP = false }: ProductLogisticsGroupProps) => {
    const form = useFormContext()
    const control = form.control;

    const carriers = [
        { id: "amm", logo: "/amm.jpeg" },
        { id: "dpd", logo: "/dpd.jpeg" },
    ]

    const DSPcarriers = [
        { id: "amm", logo: "/amm.jpeg" },
        { id: "dpd", logo: "/dpd.jpeg" },
        { id: "dhl", logo: "/dhl.png" },
        { id: "hermes", logo: "/hermes.png" },
        { id: "gls", logo: "/gls.png" },
        { id: "ups", logo: "/ups.png" },
    ]


    const deliveryTimes = ["1-3", "3-5", "5-8", "8-14", "14-20"]

    // Lấy giá trị number_of_packages từ form
    const numberOfPackages = useWatch({
        control,
        name: "number_of_packages",
    })

    // Tạo field array cho packages
    const { fields, append, remove } = useFieldArray({
        control,
        name: "packages",
    })

    useEffect(() => {
        // Nếu chưa nhập hoặc nhập < 1 → clear toàn bộ packages
        if (!numberOfPackages || numberOfPackages < 1) {
            form.setValue("packages", []);
            return;
        }

        // Nếu ít hơn thì thêm
        if (fields.length < numberOfPackages) {
            const diff = numberOfPackages - fields.length;
            for (let i = 0; i < diff; i++) {
                append({
                    length: null,
                    height: null,
                    width: null,
                    weight: null,
                });
            }
        }

        // Nếu nhiều hơn thì xóa bớt
        if (fields.length > numberOfPackages) {
            const diff = fields.length - numberOfPackages;
            for (let i = 0; i < diff; i++) {
                remove(fields.length - 1 - i);
            }
        }
    }, [numberOfPackages, fields.length]);

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
                                        {(isDSP ? DSPcarriers : carriers).map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={c.logo}
                                                        alt={c.id}
                                                        width={30}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                    <span className="uppercase">
                                                        {c.id === "amm" ? "Spedition" : c.id}
                                                    </span>
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
                                                {t} business days
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
                    name="number_of_packages"
                    render={({ field }) => (
                        <FormItem className='flex flex-col col-span-1'>
                            <FormLabel className='text-black font-semibold text-sm'>
                                Number of packages
                            </FormLabel>
                            <FormControl>
                                {/* <Input
                                    placeholder=""
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                    }
                                    className='col-span-4'
                                /> */}
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value === "" ? null : e.target.valueAsNumber
                                        )
                                    }
                                />
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

            {/* --- DYNAMIC PACKAGES --- */}
            {numberOfPackages > 0 && (
                <div>
                    <div className='col-span-2 text-sm text-black font-semibold'>Packaging (cm)</div>

                    <div className='flex flex-col gap-4 mt-2'>
                        {fields.map((pkg, index) => (
                            <div
                                key={pkg.id}
                                className='flex flex-col w-full border p-3 rounded-2xl shadow-sm'
                            >
                                <div className='font-semibold text-sm mb-2 text-gray-700'>
                                    Package #{index + 1}
                                </div>

                                <div className='flex flex-row gap-3 w-full'>
                                    {["length", "height", "width", "weight"].map((key) => (
                                        <FormField
                                            key={key}
                                            control={control}
                                            name={`packages.${index}.${key}`}
                                            render={({ field }) => (
                                                <FormItem className='flex flex-col-reverse items-center flex-1'>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder=""
                                                            min={0}
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value === ""
                                                                        ? null
                                                                        : e.target.valueAsNumber
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormLabel className='text-black font-semibold text-sm capitalize'>
                                                        {key}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductLogisticsGroup