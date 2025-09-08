"use client"

import { Button } from "@/components/ui/button"
import { FormField, FormMessage } from "@/components/ui/form"
import { useUploadStaticFile } from "@/features/file/hook"
import { cn } from "@/lib/utils"
import { Loader2, UploadIcon } from "lucide-react"
import Image from "next/image"
import React, { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { StaticFileResponse } from "@/types/products"

// ================== TYPES ==================
export type ImageItem = { id: string; url: string }


// stable id generator
const genId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto).randomUUID()
        : Math.random().toString(36).slice(2, 9)

interface ImagePickerInputProps<T extends FieldValues> {
    form: UseFormReturn<T>
    fieldName: Path<T>
    description?: string
    isSingle?: boolean
    className?: string
    isSimple?: boolean
}

// ================== SORTABLE ITEM ==================
function SortableImage({
    item,
    onRemove,
}: {
    item: ImageItem
    onRemove: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: item.id })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="relative h-full aspect-square rounded-lg overflow-hidden group cursor-move z-0"
        >
            <Image
                {...listeners}
                src={item.url}
                alt={`Uploaded-${item.id}`}
                fill
                className="object-cover z-0"
            />
            <button
                type="button"
                // data-dndkit-disabled-drag-handle
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
                ✕
            </button>
        </div>
    )
}

// ================== MAIN COMPONENT ==================
function ImagePickerInput<T extends FieldValues>({
    form,
    fieldName,
    description,
    isSingle = false,
    className,
    isSimple,
}: ImagePickerInputProps<T>) {
    const uploadImage = useUploadStaticFile()
    const watched = form.watch(fieldName as Path<T>)

    // local items with stable id
    const [items, setItems] = useState<ImageItem[]>([])

    // sync form value -> local state
    useEffect(() => {
        const vals: string[] | { url: string }[] =
            (isSingle
                ? watched
                    ? [watched as string]
                    : []
                : (watched as { url: string }[]) || [])

        const normalized: ImageItem[] = vals.map((v) => {
            const url = typeof v === "string" ? v : v.url
            return { id: genId(), url }
        })

        setItems(normalized)
    }, [watched, isSingle])

    // drop handler
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (!acceptedFiles || acceptedFiles.length === 0) return
            const formData = new FormData()
            acceptedFiles.forEach((file) => formData.append("files", file))

            uploadImage.mutate(formData, {
                onSuccess(data: StaticFileResponse) {
                    const uploadedUrls = data.results.map((r) => r.url)
                    const newItems = uploadedUrls.map((url) => ({
                        id: genId(),
                        url,
                    }))
                    const next = isSingle ? newItems.slice(0, 1) : [...items, ...newItems]
                    setItems(next)

                    if (isSingle) {
                        form.setValue(
                            fieldName,
                            newItems[0] as PathValue<T, Path<T>>,
                            { shouldValidate: true }
                        )
                    } else {
                        form.setValue(
                            fieldName,
                            next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
                            { shouldValidate: true }
                        )
                    }
                },
            })
        },
        [uploadImage, isSingle, items, form, fieldName]
    )

    const removeImage = (index: number) => {
        if (isSingle) {
            setItems([])
            form.setValue(fieldName, "" as PathValue<T, Path<T>>, { shouldValidate: true })
        } else {
            const next = items.filter((_, idx) => idx !== index)
            setItems(next)
            form.setValue(
                fieldName,
                next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
                { shouldValidate: true }
            )
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: !isSingle,
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    return (
        <div className={cn("col-span-12 flex flex-col gap-4", className)}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`h-full w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 transition-colors cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"}`}
            >
                {uploadImage.isPending ? (
                    <Loader2
                        className={cn("w-12 h-12 text-gray-400 animate-spin", isSimple && "w-6 h-6")}
                    />
                ) : (
                    <UploadIcon
                        className={cn("w-12 h-12 text-gray-400", isSimple && "w-6 h-6")}
                    />
                )}
                {!isSimple && (
                    <>
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            {isDragActive
                                ? "Drop your images here"
                                : "Drag and drop your images here"}
                        </p>
                        {description && (
                            <p className="text-gray-500 text-sm text-center">{description}</p>
                        )}
                    </>
                )}

                <Button variant="outline" type="button">
                    Browse Files
                </Button>
                <input {...getInputProps()} className="hidden" multiple />
            </div>

            {/* Preview */}
            {isSingle ? (
                watched ? (
                    <div className="col-span-6 relative h-[100px] w-[100px] aspect-square rounded-lg group">
                        <Image src={watched as string} alt="Uploaded" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                removeImage(0)
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                            ✕
                        </button>
                    </div>
                ) : null
            ) : items.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                        if (!over || active.id === over.id) return
                        const oldIndex = items.findIndex((it) => it.id === active.id)
                        const newIndex = items.findIndex((it) => it.id === over.id)
                        if (oldIndex === -1 || newIndex === -1) return
                        const next = arrayMove(items, oldIndex, newIndex)
                        setItems(next)
                        form.setValue(
                            fieldName,
                            next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
                            { shouldValidate: true }
                        )
                    }}
                >
                    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                        <div className="gap-8 w-full h-[144px] flex justify-start">
                            {items.map((it, idx) => (
                                <SortableImage key={it.id} item={it} onRemove={() => removeImage(idx)} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : null}

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
