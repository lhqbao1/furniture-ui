import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useGetAddressByUserIdAdmin } from '@/features/address/hook'
import { Skeleton } from '@/components/ui/skeleton'

interface ShippingAddressProps {
    userId: string
}

const ShippingAddress = ({ userId }: ShippingAddressProps) => {
    const { data: shippingAddress, isLoading, isError } = useGetAddressByUserIdAdmin(userId)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
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

    if (isError || !shippingAddress) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No shipping address found.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipping Addresses</CardTitle>
                {/* <CardDescription>Card Description</CardDescription>
                <CardAction>Card Action</CardAction> */}
            </CardHeader>
            <CardContent className='space-y-4'>
                {shippingAddress
                    ?.slice() // copy tránh mutate
                    .sort((a, b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1))
                    .map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>
                                    {item.name_address} {item.is_default ? "(Default)" : ""}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='capitalize'>{item.address_line}</div>
                                <div className='capitalize'>{item.city}</div>
                                <div className='capitalize'>{item.postal_code} - {item.country}</div>
                                <div className='flex gap-1'>
                                    <div>Recipient: </div>
                                    <div>
                                        <div className='capitalize'>{item.recipient_name}</div>
                                        <div>{item.phone_number}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </CardContent>
        </Card>
    )
}

export default ShippingAddress