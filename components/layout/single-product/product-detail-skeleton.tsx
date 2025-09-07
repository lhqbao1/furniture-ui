"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailsSkeleton() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            {/* Product details */}
            <div className="grid grid-cols-12 xl:gap-16 gap-8">
                {/* Left images */}
                <div className="xl:col-span-7 col-span-12 flex flex-col gap-6">
                    {/* Main image */}
                    <div className="w-full h-[400px] bg-gray-200 rounded-lg" />

                    {/* Sub images */}
                    <div className="flex flex-row gap-4 px-12">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-24 h-24 bg-gray-200 rounded-md" />
                        ))}
                    </div>

                    {/* Voucher */}
                    <div className="flex flex-row justify-center gap-2 mt-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-24 h-10 bg-gray-200 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* Right details */}
                <div className="xl:col-span-5 col-span-12 flex flex-col gap-6">
                    <div className="h-8 bg-gray-200 w-3/4 rounded-md" />
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 w-20 rounded-md" />
                        <div className="h-6 bg-gray-200 w-16 rounded-md" />
                    </div>
                    <div className="flex flex-row gap-4 items-center">
                        <div className="h-6 w-12 bg-gray-200 rounded-md" />
                        <div className="h-6 w-32 bg-gray-200 rounded-md" />
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-200 rounded" />
                        <div className="h-6 bg-gray-200 w-40 rounded-md" />
                    </div>

                    {/* Quick buy */}
                    <div className="flex flex-row gap-6">
                        <div className="h-10 w-20 bg-gray-200 rounded-md" />
                        <div className="h-10 flex-1 bg-gray-200 rounded-full" />
                    </div>

                    {/* Progress */}
                    <div className="h-4 w-full bg-gray-200 rounded-md" />

                    {/* SKU & Category */}
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-gray-200 rounded-md" />
                        <div className="h-4 w-40 bg-gray-200 rounded-md" />
                        <div className="h-4 w-28 bg-gray-200 rounded-md" />
                    </div>

                    {/* Social */}
                    <div className="flex flex-row gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 w-6 bg-gray-200 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="h-40 bg-gray-200 rounded-md mt-8" />
        </div>
    )
}
