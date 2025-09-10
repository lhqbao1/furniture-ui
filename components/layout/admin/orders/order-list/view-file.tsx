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

interface ViewFileDialogProps {
    checkoutId: string
    invoiceId?: string
}

const ViewFileDialog = ({ checkoutId, invoiceId }: ViewFileDialogProps) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <File className="w-4 h-4 text-secondary" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-fit px-0">
                <DialogHeader>
                    <DialogTitle>PDF File</DialogTitle>
                </DialogHeader>
                <InvoiceTable checkoutId={checkoutId} />
            </DialogContent>
        </Dialog>
    )
}

export default ViewFileDialog