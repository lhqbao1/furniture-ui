"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

type PreviewFile = File & { preview: string }

export default function FileDropZone() {
    const [files, setFiles] = useState<PreviewFile[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const mapped = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        ) as PreviewFile[]
        setFiles((prev) => [...prev, ...mapped])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: true,
    })

    // 💡 cleanup memory để tránh leak
    useEffect(() => {
        return () => {
            files.forEach((file) => URL.revokeObjectURL(file.preview))
        }
    }, [files])

    return (
        <div className="flex flex-col gap-4">
            {/* Drop zone */}
            <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer transition ${isDragActive ? "border-primary bg-muted/30" : "border-gray-300"
                    }`}
            >
                <input {...getInputProps()} />
                <span className="text-sm text-muted-foreground">
                    {isDragActive ? (
                        "Drop files here ..."
                    ) : (
                        <>
                            Drag or <span className="text-primary font-semibold">Browse</span>
                        </>
                    )}
                </span>
            </div>

            {/* Preview list */}
            <div className="grid grid-cols-3 gap-4">
                {files.map((file, idx) => (
                    <div
                        key={idx}
                        className="relative w-full aspect-square rounded-md overflow-hidden border"
                    >
                        <Image
                            src={file.preview}
                            alt={file.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
