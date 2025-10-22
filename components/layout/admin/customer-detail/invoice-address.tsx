import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetInvoiceAddressByUserIdAdmin } from '@/features/address/hook'

interface InvoiceAddressProps {
    userId: string
}

const InvoiceAddress = ({ userId }: InvoiceAddressProps) => {
    const { data: invoiceAddress, isLoading, isError } = useGetInvoiceAddressByUserIdAdmin(userId)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card className="p-4 space-y-3">
                        <Skeleton className="h-5 w-1/3" /> {/* name_address */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-2/3" /> {/* address_line */}
                            <Skeleton className="h-4 w-1/2" /> {/* city */}
                            <Skeleton className="h-4 w-1/2" /> {/* postal + country */}
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-1/4" /> {/* recipient label */}
                            <Skeleton className="h-4 w-1/3" /> {/* recipient_name */}
                            <Skeleton className="h-4 w-1/3" /> {/* phone_number */}
                        </div>
                    </Card>
                </CardContent>
            </Card>
        )
    }

    if (isError || !invoiceAddress || invoiceAddress?.city === '') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Address</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No invoice address found.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice Address</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {invoiceAddress.name_address}{" "}
                            {invoiceAddress.is_default ? "(Default)" : ""}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='capitalize'>{invoiceAddress.address_line}</div>
                        <div className='capitalize'>{invoiceAddress.city}</div>
                        <div className='capitalize'>
                            {invoiceAddress.postal_code} - {invoiceAddress.country}
                        </div>
                        <div className='flex gap-1'>
                            <div>Recipient: </div>
                            <div>
                                <div className='capitalize'>{invoiceAddress.recipient_name}</div>
                                <div>{invoiceAddress.phone_number}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

export default InvoiceAddress
