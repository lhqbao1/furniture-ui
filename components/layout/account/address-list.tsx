'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useDeleteAddress, useGetAddressByUserId, useSetDefaultAddress } from '@/features/address/hook'
import React from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Loader2 } from 'lucide-react'
import AddressForm from './address-form'

interface AddressListProps {
    userId: string
}

const AddressList = ({ userId }: AddressListProps) => {
    const { data: addresses, isLoading, isError } = useGetAddressByUserId(userId)
    const deleteAddressMutation = useDeleteAddress()
    const setDefaultAddressMutation = useSetDefaultAddress()
    const [removeDialogId, setRemoveDialogId] = React.useState<string | null>(null)
    const [defaultDialogId, setDefaultDialogId] = React.useState<string | null>(null)
    const [editDialogId, setEditDialogId] = React.useState<string | null>(null)

    const handleDeleteAddress = (addressId: string) => {
        deleteAddressMutation.mutate(addressId, {
            onSuccess() {
                toast.success("Address deleted successfully")
                setRemoveDialogId(null)
            },
            onError() {
                toast.error("Failed to delete address")
                // handle error
            },
        })
    }

    const handleSetDefaultAddress = (addressId: string) => {
        setDefaultAddressMutation.mutate(addressId, {
            onSuccess() {
                toast.success("Set default address successfully")
                setDefaultDialogId(null)
            },
            onError() {
                toast.error("Failed to set default address")
                // handle error
            },
        })
    }

    if (isLoading) return <div>Loading addresses...</div>
    if (isError) return <div className="text-red-500">You have not created any address for shipping. You need at least one shipping address to buy product</div>
    if (!addresses || addresses.length === 0) return <div className="text-red-500">You have not created any address for shipping. You need at least one shipping address to buy product</div>

    return (
        <div className="grid grid-cols-2 gap-4">
            {[...addresses]
                .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)) // default lên đầu
                .map((address) => (
                    <Card
                        key={address.id}
                        className={address.is_default ? "border-secondary border-2" : ""}
                    >
                        <CardHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* <RadioGroupItem value={address.id} id={address.id} /> */}
                                <Label htmlFor={address.id} className="text-lg font-semibold">
                                    {address.name_address}
                                </Label>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                            <p>{address.address_line}</p>
                            <p>{address.city}</p>
                            <p>{address.country}</p>
                            {address.recipient_name && <p>Recipient: {address.recipient_name}</p>}
                            {address.phone_number && <p>{address.phone_number}</p>}
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-2">
                                <Dialog
                                    open={editDialogId === address.id}
                                    onOpenChange={(open) => setEditDialogId(open ? address.id : null)}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" type='button'>Edit</Button>
                                    </DialogTrigger>
                                    <DialogContent className='lg:w-[800px]'>
                                        <DialogHeader>
                                            <DialogTitle>Edit Shipping Address</DialogTitle>
                                            <AddressForm
                                                userId={userId}
                                                open={editDialogId === address.id} // boolean
                                                setOpen={(open) => setEditDialogId(open ? address.id : null)} // adapter
                                                currentAddress={address}
                                            />
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>


                                <Dialog
                                    open={defaultDialogId === address.id}
                                    onOpenChange={(open) => setDefaultDialogId(open ? address.id : null)}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" type='button'>Set as Default</Button>
                                    </DialogTrigger>

                                    <DialogContent className="lg:w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Set Default Shipping Address</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to set this address as your default shipping address?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button
                                                type="button"
                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                variant="secondary"
                                                disabled={setDefaultAddressMutation.isPending}
                                            >
                                                {setDefaultAddressMutation.isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : 'Confirm'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog
                                    open={removeDialogId === address.id}
                                    onOpenChange={(open) => setRemoveDialogId(open ? address.id : null)}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-red-500">
                                            Remove
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="lg:w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Delete Shipping Address</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this address? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button
                                                type="button"
                                                onClick={() => handleDeleteAddress(address.id)}
                                                variant="secondary"
                                                disabled={deleteAddressMutation.isPending}
                                            >
                                                {deleteAddressMutation.isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : 'Confirm'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                            </div>
                        </CardFooter>
                    </Card>
                ))}
        </div>
    )
}

export default AddressList