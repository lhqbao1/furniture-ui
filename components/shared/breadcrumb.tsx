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

export default function CustomBreadCrumb() {
    const params = useParams()
    const values = Object.values(params)
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/"><Home /></BreadcrumbLink>
                </BreadcrumbItem>

                {values.map((item, idx) => {
                    const href = "/product/" + values.slice(0, idx + 1).join("/")
                    const isLast = idx === values.length - 1

                    return (
                        <React.Fragment key={idx}>
                            <BreadcrumbSeparator className="text-primary" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="capitalize text-gray-500 font-bold text-lg">{item}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink className="capitalize text-gray-500 font-bold text-lg" href={href}>{item}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
