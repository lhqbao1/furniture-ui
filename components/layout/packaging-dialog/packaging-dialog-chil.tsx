'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Eye, File, Loader2, Trash2 } from 'lucide-react'
import InvoiceTable from '@/components/layout/pdf/file-component'
import PackagingDialogComponent from '@/components/layout/packaging-dialog/packaging-dialog-component'
import { CartItem } from '@/types/cart'
import PackagingDialogChildComponent from './packaging-dialog-component-chil'

interface ViewFileDialogProps {
    checkoutId: string
    data?: CartItem[]
}

const ViewFileChildDialog = ({ checkoutId, data }: ViewFileDialogProps) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <File className="w-4 h-4 text-secondary" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-fit h-[calc(100%-3rem)] overflow-y-scroll px-0">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                </DialogHeader>
                <PackagingDialogChildComponent checkoutId={checkoutId} data={data} />
            </DialogContent>
        </Dialog>
    )
}

export default ViewFileChildDialog