"use client"

import { Button } from "@/components/ui/button"
import { FormField, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { UploadIcon } from "lucide-react"
import Image from "next/image"
import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form"

interface ImagePickerInputProps<T extends FieldValues> {
    form: UseFormReturn<T>
    fieldName: Path<T>
    description?: string
    isSingle?: boolean
    className?: string
    isSimple?: boolean
}

function ImagePickerInput<T extends FieldValues>({
    form,
    fieldName,
    description,
    isSingle = false,
    className,
    isSimple
}: ImagePickerInputProps<T>) {
    const value = form.watch(fieldName as Path<T>)
    const images = isSingle
        ? (value ? [value] : []) // string -> array 1 phần tử
        : (value || [])          // array


    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newImages = acceptedFiles.map((file) => URL.createObjectURL(file))

            if (isSingle) {
                // chỉ giữ 1 ảnh
                form.setValue(
                    fieldName,
                    newImages[0] as PathValue<T, Path<T>>,
                    { shouldValidate: true }
                )
            } else {
                const currentImages = (form.getValues(fieldName) as string[]) || []
                form.setValue(
                    fieldName,
                    [...currentImages, ...newImages] as PathValue<T, Path<T>>,
                    { shouldValidate: true }
                )
            }
        },
        [form, fieldName, isSingle]
    )

    const removeImage = (index: number) => {
        if (isSingle) {
            form.setValue(fieldName, "" as PathValue<T, Path<T>>, {
                shouldValidate: true,
            })
        } else {
            const updated = (images as string[]).filter((_, idx) => idx !== index)
            form.setValue(fieldName, updated as PathValue<T, Path<T>>, {
                shouldValidate: true,
            })
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: !isSingle,
    })

    return (
        <div className={cn('col-span-12 flex flex-col gap-4', className)}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`h-full w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 transition-colors cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"}`}
            >
                <UploadIcon className={cn("w-12 h-12 text-gray-400", isSimple && 'w-6 h-6')} />
                {!isSimple && <>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        {isDragActive ? "Drop your images here" : "Drag and drop your images here"}
                    </p>
                    {description && <p className="text-gray-500 text-sm text-center">{description}</p>}
                </>}

                <Button variant="outline" type="button">
                    Browse Files
                </Button>
                <input {...getInputProps()} className="hidden" />
            </div>

            {/* Preview */}
            {images.length > 0 && (
                <div className={cn('grid gap-4 w-full max-h-[144px]', isSingle ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4')}>
                    {images.map((src: string, idx: number) => (
                        <div key={idx} className="relative h-full aspect-square rounded-lg overflow-hidden group">
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

            {/* Hidden field for errors */}
            <FormField
                control={form.control}
                name={fieldName}
                render={() => <FormMessage />}
            />
        </div>
    )
}

export default ImagePickerInput
