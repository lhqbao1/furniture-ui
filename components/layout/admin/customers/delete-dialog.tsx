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
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Customer } from '@/types/user'
import { useDeleteCustomer } from '@/features/users/hook'

interface DeleteDialogProps {
    user: Customer
}

const DeleteDialog = ({ user }: DeleteDialogProps) => {
    const deleteCustomerMutation = useDeleteCustomer()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        deleteCustomerMutation.mutate(user.id ?? "", {
            onSuccess(data, variables, context) {
                toast.success("Delete customer successfully")
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error("Delete customer fail")
                setOpen(false)
            },
        })
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault()
                        setOpen(true)
                    }}
                >
                    <Trash2 className="size-4 text-red-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Customer</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this customer? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className='bg-gray-400 text-white hover:bg-gray-500'
                            disabled={deleteCustomerMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleDelete} hasEffect variant="secondary" disabled={deleteCustomerMutation.isPending}>
                        {deleteCustomerMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog