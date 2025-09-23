"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProductItem } from "@/types/products"

interface ProductImageDialogProps {
    productDetails: ProductItem
    children: React.ReactNode // trigger bên ngoài (div mà bạn gửi)
}

export default function ProductImageDialog({
    productDetails,
    children,
}: ProductImageDialogProps) {
    const [mainImageIndex, setMainImageIndex] = useState(0)

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="p-6 h-4/5 w-[calc(100%-10rem)] left-0" aria-describedby="">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="grid grid-cols-12 gap-6">
                    {/* Cột 8: main image */}
                    <div className="col-span-12 lg:col-span-8 flex items-center justify-center">
                        <Image
                            src={
                                productDetails.static_files.length > 0
                                    ? productDetails.static_files[mainImageIndex].url
                                    : "/2.png"
                            }
                            alt={productDetails.name}
                            width={600}
                            height={600}
                            className="object-contain max-h-[600px]"
                        />
                    </div>

                    {/* Cột 4: thumbnails + name */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col justify-start gap-4">
                        <h2 className="text-2xl font-semibold">{productDetails.name}</h2>

                        <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2">
                            {productDetails.static_files.map((file, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImageIndex(idx)}
                                    className={`border-2 rounded-md p-2 overflow-hidden ${mainImageIndex === idx ? "border-primary" : "border-gray-200"
                                        }`}
                                >
                                    <Image
                                        src={file.url}
                                        alt={`Thumbnail ${idx}`}
                                        width={120}
                                        height={120}
                                        className="object-cover w-full h-full"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
