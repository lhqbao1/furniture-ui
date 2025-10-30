import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import AddressForm from './address-form'
import { useGetInvoiceAddressByUserId } from '@/features/address/hook'
import { useTranslations } from 'next-intl'

interface InvoiceAddressProps {
    userId: string

}

const InvoiceAddress = ({ userId }: InvoiceAddressProps) => {
    const [openEdit, setOpenEdit] = useState<boolean>(false)
    const t = useTranslations()
    const { data: address, isLoading, isError } = useGetInvoiceAddressByUserId(userId)

    if (isLoading) return <div>Loading addresses...</div>
    if (isError) return <div className="text-red-500">
        {t('noInvoiceAddress')}
    </div>
    if (!address) return <div className="text-red-500">
        {t('noInvoiceAddress')}
    </div>

    return (
        <Card
            className={"border-secondary border-2"}
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
                {address.recipient_name && <p>{t('recipient')}: {address.recipient_name}</p>}
                {address.phone_number && <p>{address.phone_number}</p>}
            </CardContent>
            <CardFooter>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" type='button'>{t("edit")}</Button>
                        </DialogTrigger>
                        <DialogContent className='lg:w-[800px]'>
                            <DialogHeader>
                                <DialogTitle>{t('editInvoiceAddress')}</DialogTitle>
                                <AddressForm
                                    userId={userId}
                                    open={openEdit}
                                    setOpen={setOpenEdit}
                                    currentAddress={address}
                                    isInvoice
                                />
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardFooter>
        </Card>
    )
}

export default InvoiceAddress