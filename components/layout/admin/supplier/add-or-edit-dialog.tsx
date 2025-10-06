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
import AddOrEditSupplierForm from './add-or-edit-form'

const AddSupplierDialog = () => {
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    <Button variant="secondary">Add Supplier</Button>
                </DialogTrigger>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Supplier</DialogTitle>
                    </DialogHeader>
                    <AddOrEditSupplierForm onClose={handleClose} />
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default AddSupplierDialog