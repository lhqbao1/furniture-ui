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
import { useCreateVariantOption } from "@/features/variant/hook" // hook mutation
import { Plus } from "lucide-react"
import { useUploadStaticFile } from "@/features/file/hook"

interface AddImageOptionDialogProps {
    variantId: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddOptionDialog = ({ variantId }: AddImageOptionDialogProps) => {
    const [open, setOpen] = useState(false)
    const [optionName, setOptionName] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState<string | null>(null)

    const createVariantOptionMutation = useCreateVariantOption()
    const uploadStaticFile = useUploadStaticFile()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))

        const formData = new FormData()
        formData.append("file", selectedFile)

        uploadStaticFile.mutate(formData, {
            onSuccess(data) {
                toast.success("Image uploaded successfully")
                setCurrentImage(data.url)
                console.log("Response:", data)
            },
            onError(error) {
                toast.error("Image upload failed")
                console.error(error)
            },
        })
    }

    const handleAdd = () => {
        const input = {
            options: [
                {
                    label: optionName,
                    image_url: currentImage
                }
            ]
        };

        console.log(input)

        createVariantOptionMutation.mutate({ variant_id: variantId, input }, {
            onSuccess() {
                toast.success("Option added successfully");
                setOptionName("");
                setCurrentImage("");
                setPreview(null);
                setOpen(false);
            },
            onError(error) {
                toast.error("Failed to add option");
                console.error(error);
            }
        });
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                    {/* Upload box */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                            Drag or <span className="text-primary font-semibold">Browse</span>
                        </span>
                        <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={optionName ? true : false}
                        />
                    </label>

                    {/* Preview image */}
                    {preview && (
                        <div className="flex justify-center">
                            <Image
                                src={preview}
                                alt="preview"
                                width={100}
                                height={60}
                                className="rounded-md object-cover"
                            />
                        </div>
                    )}

                    {/* Option name input */}
                    <Input
                        placeholder="Option name"
                        value={optionName}
                        onChange={(e) => setOptionName(e.target.value)}
                        disabled={preview ? true : false}
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
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
