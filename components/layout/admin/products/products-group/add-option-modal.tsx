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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddImageOptionDialogProps {
    variantId: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddOptionDialog = ({ variantId }: AddImageOptionDialogProps) => {
    const [open, setOpen] = useState(false)
    const [optionName, setOptionName] = useState("")
    const [imageDes, setImageDes] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [isGlobal, setIsGlobal] = useState<boolean>(false) // default Global

    const createVariantOptionMutation = useCreateVariantOption()
    const uploadStaticFile = useUploadStaticFile()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))

        const formData = new FormData()
        formData.append("files", selectedFile)

        uploadStaticFile.mutate(formData, {
            onSuccess(data) {
                toast.success("Image uploaded successfully")
                setCurrentImage(data.results[0].url)
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
                    image_url: currentImage,
                    img_description: imageDes,
                    is_global: isGlobal
                }
            ]
        };

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

                    {/* Radio buttons: Global / Local */}
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
                        placeholder="Image description"
                        value={imageDes}
                        onChange={(e) => setImageDes(e.target.value)}
                        disabled={optionName ? true : false}
                    />

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
