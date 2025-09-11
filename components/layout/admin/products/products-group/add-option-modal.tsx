"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { toast } from "sonner"
import { useCreateVariantOption } from "@/features/variant/hook"
import { Plus } from "lucide-react"
import { useUploadStaticFile } from "@/features/file/hook"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useDropzone } from "react-dropzone"

interface AddImageOptionDialogProps {
    variantId: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddOptionDialog = ({ variantId }: AddImageOptionDialogProps) => {
    const [open, setOpen] = useState(false)
    const [optionName, setOptionName] = useState("")
    const [imageDes, setImageDes] = useState("")
    const [preview, setPreview] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [isGlobal, setIsGlobal] = useState<boolean>(false)

    const createVariantOptionMutation = useCreateVariantOption()
    const uploadStaticFile = useUploadStaticFile()

    // === handle drop/upload ===
    const onDrop = (acceptedFiles: File[]) => {
        if (optionName) {
            toast.error("Option name already filled, cannot upload image")
            return
        }

        const selectedFile = acceptedFiles[0]
        if (!selectedFile) return

        setPreview(URL.createObjectURL(selectedFile))

        const formData = new FormData()
        formData.append("files", selectedFile)

        uploadStaticFile.mutate(formData, {
            onSuccess(data) {
                toast.success("Image uploaded successfully")
                setCurrentImage(data.results[0].url)
            },
            onError(error) {
                toast.error("Image upload failed")
                console.error(error)
            },
        })
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: false,
        disabled: !!optionName, // chặn upload nếu đã có optionName
    })

    // === handle add option ===
    const handleAdd = () => {
        if (!optionName && !currentImage) {
            toast.error("Please provide option name OR upload image")
            return
        }

        const input = {
            options: [
                {
                    label: optionName,
                    image_url: currentImage,
                    img_description: imageDes,
                    is_global: isGlobal,
                },
            ],
        }

        createVariantOptionMutation.mutate(
            { variant_id: variantId, input },
            {
                onSuccess() {
                    toast.success("Option added successfully")
                    setOptionName("")
                    setCurrentImage(null)
                    setPreview(null)
                    setImageDes("")
                    setOpen(false)
                },
                onError(error) {
                    toast.error("Failed to add option")
                    console.error(error)
                },
            }
        )
    }

    const hasImageOrDesc = !!preview || !!imageDes

    return (
        <Dialog open={open}
            onOpenChange={(val) => {
                setOpen(val)
                if (!val) {
                    // reset toàn bộ state khi đóng
                    setOptionName("")
                    setImageDes("")
                    setPreview(null)
                    setCurrentImage(null)
                    setIsGlobal(false)
                }
            }}
        >
            <DialogTrigger asChild>
                <Plus size={16} className="border cursor-pointer" />
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Add image option
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Radio buttons */}
                    <div>
                        <Label className="mb-2 block text-sm font-medium">Option type</Label>
                        <RadioGroup
                            className="flex gap-4"
                            value={isGlobal ? "global" : "local"}
                            onValueChange={(val) => setIsGlobal(val === "global")}
                        >
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="global" id="global" />
                                <Label htmlFor="global">Global</Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="local" id="local" />
                                <Label htmlFor="local">Local</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Upload box (disabled if optionName exists) */}
                    <div
                        {...getRootProps()}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer transition ${isDragActive ? "border-primary bg-muted/30" : "border-gray-300"
                            } ${optionName ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        <input {...getInputProps()} />
                        <span className="text-sm text-muted-foreground">
                            {isDragActive
                                ? "Drop file here ..."
                                : "Drag or Browse an image"}
                        </span>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="flex justify-center">
                            <Image
                                src={preview}
                                alt="preview"
                                width={100}
                                height={60}
                                className="rounded-md object-cover"
                                unoptimized
                            />
                        </div>
                    )}

                    {/* Description (disabled if optionName exists) */}
                    <Input
                        placeholder="Image description"
                        value={imageDes}
                        onChange={(e) => setImageDes(e.target.value)}
                        disabled={!!optionName}
                    />

                    {/* Option name (disabled if image or description exists) */}
                    <Input
                        placeholder="Option name"
                        value={optionName}
                        onChange={(e) => setOptionName(e.target.value)}
                        disabled={hasImageOrDesc}
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={uploadStaticFile.isPending || createVariantOptionMutation.isPending}
                        >
                            {createVariantOptionMutation.isPending ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddOptionDialog
