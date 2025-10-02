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
import AddOrEditBrandForm from './add-brand-form'

const AddBrandDialog = () => {
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    <Button variant="secondary">Add Brand</Button>
                </DialogTrigger>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Brand</DialogTitle>
                    </DialogHeader>
                    <AddOrEditBrandForm onClose={handleClose} />
                    {/* <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter> */}
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default AddBrandDialog