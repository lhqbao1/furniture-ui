"use client"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"
import { useParams } from "next/navigation"
import React from "react"

interface CustomBreadCrumbProps {
    currentPage?: string
    isProductPage?: boolean
}

export default function CustomBreadCrumb({ currentPage, isProductPage }: CustomBreadCrumbProps) {
    const params = useParams()
    const values = Object.values(params)

    return (
        <Breadcrumb className="pt-2">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/"><Home /></BreadcrumbLink>
                </BreadcrumbItem>
                {currentPage ??
                    <>
                        <BreadcrumbSeparator className="text-primary" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="capitalize text-gray-500 font-bold text-lg">{currentPage}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                }

                {values && values.length > 0 && values.map((item, idx) => {
                    const href = `/${currentPage}` + values.slice(0, idx + 1).join("/")
                    const isLast = idx === values.length - 1
                    const hideLast = isLast && isProductPage

                    return (
                        <React.Fragment key={idx}>
                            {idx === 0 ? '' : <BreadcrumbSeparator className="text-primary" />}
                            {!hideLast && (
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="capitalize text-gray-500 font-bold text-lg">
                                            {item}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            className="capitalize text-gray-500 font-bold text-lg"
                                            href={href}
                                        >
                                            {item}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            )}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
