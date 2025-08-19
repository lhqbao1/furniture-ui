"use client"

import { Button } from '@/components/ui/button'
import { FormField, FormMessage } from '@/components/ui/form'
import { UploadIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UseFormReturn } from 'react-hook-form'
import { FormValues } from './comment-form'

interface ImagePickerInputProps {
    form: UseFormReturn<FormValues>;
}

const ImagePickerInput = ({ form }: ImagePickerInputProps) => {
    const images = form.watch("image") || [] // lấy từ RHF luôn

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map(file => URL.createObjectURL(file))
        form.setValue("image", [...images, ...newImages], { shouldValidate: true })
    }, [images, form])

    const removeImage = (index: number) => {
        const updated = images.filter((_, idx) => idx !== index)
        form.setValue("image", updated, { shouldValidate: true })
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
    })

    return (
        <div className='col-span-12 flex flex-col gap-4'>
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

            {/* Field hidden cho errors */}
            <FormField
                control={form.control}
                name="image"
                render={() => <FormMessage />}
            />
        </div>
    )
}

export default ImagePickerInput
