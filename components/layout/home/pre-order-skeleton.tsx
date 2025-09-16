"use client"

import React from "react"

const PreOrderSkeleton = () => {
    return (
        <div className="section-padding animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded mb-4 mx-auto" />
            <div className="h-6 w-56 bg-gray-200 rounded mx-auto mb-8" />

            <div className="grid grid-cols-12 xl:min-h-[700px]">
                <div className="xl:col-span-5 col-span-12 flex justify-center items-center">
                    <div className="w-[180px] h-[220px] xl:w-[380px] xl:h-[420px] bg-gray-200 rounded-xl" />
                </div>
                <div className="xl:col-span-5 col-span-12 flex flex-col gap-4 mt-20 lg:mt-0">
                    <div className="h-8 w-64 bg-gray-200 rounded" />
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-12 w-40 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    )
}

export default PreOrderSkeleton
