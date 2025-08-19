'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

// ---------------- ZOD SCHEMA ----------------
const formSchema = z.object({
    custom_desc: z.string().min(1, 'Please enter a description'),
    custom_amount: z
        .number({ error: 'Amount must be a number' })
        .positive('Amount must be greater than 0'),
    custom_image: z.array(z.string()).min(1, 'Please upload at least 1 image'),
})

type FormValues = z.infer<typeof formSchema>

interface ImagePickerFormProps {
    type?: 'full' | 'simple'
}

export default function ImagePickerForm({ type = 'full' }: ImagePickerFormProps) {
    const [images, setImages] = useState<string[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map(file => URL.createObjectURL(file))
        setImages(prev => [...prev, ...newImages])
        // Gán luôn vào react-hook-form
        form.setValue('custom_image', [...images, ...newImages])
    }, [images])

    const removeImage = (index: number) => {
        const updated = images.filter((_, idx) => idx !== index)
        setImages(updated)
        form.setValue('custom_image', updated)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
    })

    // ---------------- FORM HOOK ----------------
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            custom_desc: '',
            custom_amount: 1,
            custom_image: [],
        },
    })

    const onSubmit = (data: FormValues) => {
        console.log('Form data:', data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn(
                type === 'simple' ? 'p-0 md:p-0' : 'p-8 md:p-12',
                'grid grid-cols-12 gap-6'
            )}>

                {/* LEFT SIDE */}
                <div className={cn(
                    type === "simple" ? "col-span-12" : "col-span-4",
                    "flex flex-col gap-4"
                )}>
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 transition-colors cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}`}
                    >
                        <UploadIcon className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {isDragActive ? 'Drop your images here' : 'Drag and drop your images here'}
                        </p>
                        <Button variant="outline" type="button">
                            Browse Files
                        </Button>
                        <input {...getInputProps()} className="hidden" />
                    </div>

                    {/* Preview Grid */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                            {images.map((src, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                    <Image src={src} alt={`Uploaded ${idx}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Field hidden cho images */}
                    <FormField
                        control={form.control}
                        name="custom_image"
                        render={({ field }) => (
                            <FormMessage /> // chỉ hiển thị lỗi
                        )}
                    />
                </div>
                {/* RIGHT SIDE */}
                {type === 'full' ?
                    <div className="col-span-8 flex flex-col gap-6">
                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="custom_desc"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Textarea {...field} placeholder="Enter your description..." className="xl:h-52 h-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Quantity + Buttons */}
                        <div className="flex flex-row justify-between">
                            <FormField
                                control={form.control}
                                name="custom_amount"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row gap-3 items-center">
                                        <FormLabel className='text-base'>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={field.value}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder="10"
                                            />
                                        </FormControl>
                                        <p className='text-base'>pcs</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-row gap-4">
                                <Button type="button" variant="outline" className='text-xl px-4 py-6'>
                                    Cancel
                                </Button>
                                <Button type="submit" className='text-xl px-4 py-6' hasEffect>Check out</Button>
                            </div>
                        </div>
                    </div>
                    : ''}
            </form>
        </Form >
    )
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f15a24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    )
}
