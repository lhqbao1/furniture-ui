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
import { useDropzone } from "react-dropzone"
import { toast } from "sonner" // hoặc react-hot-toast nếu bạn dùng lib khác
import { File, Loader, Loader2 } from "lucide-react"
import { useImportAmmProducts } from "@/features/amm/hook"



const AmmWeAvisPage = () => {
    const [file, setFile] = useState<File | null>(null)
    const [open, setOpen] = useState(false)

    const importAmmProductMutation = useImportAmmProducts()

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]) // chỉ lấy file đầu tiên
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    })

    const handleSubmit = () => {
        if (!file) {
            toast.error("You need to choose at least one file")
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        importAmmProductMutation.mutate(formData, {
            onSuccess: () => {
                toast.success("Import products successful")
                setOpen(false)
            },
            onError: () => {
                toast.error("Import products fail")
            },
        })

        toast.info("Uploading products")
        setOpen(false)
    }

    return (
        <div>
            <h2 className="section-header">Import We Avis to AMM</h2>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="" disabled={importAmmProductMutation.isPending ? true : false}>{importAmmProductMutation.isPending ? <Loader2 className="animate-spin" /> : 'Import'}</Button>
                </DialogTrigger>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Upload file</DialogTitle>
                    </DialogHeader>
                    <div
                        {...getRootProps()}
                        className={`mt-4 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition 
                        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"}`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex gap-2">
                                <File />
                                <p className="text-sm text-gray-600">{file.name}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Drag & drop file here, or click to select
                            </p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!file || importAmmProductMutation.isPending}>
                            {importAmmProductMutation.isPending ? <Loader2 className="animate-spin" /> : "Submit"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AmmWeAvisPage
