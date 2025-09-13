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
import { useDeleteBrand } from '@/features/brand/hook'

interface DeleteDialogProps {
    brandId: string
}

const DeleteDialog = ({ brandId }: DeleteDialogProps) => {
    const deleteBrandMutation = useDeleteBrand()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        deleteBrandMutation.mutate(brandId, {
            onSuccess(data, variables, context) {
                toast.success("Delete Brand successfully")
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error("Failed to delete Brand")
                setOpen(false)
            },
        })
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation()
                }}>
                    <Trash2 className='size-4 text-red-500' />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Brand</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this Brand? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className='bg-gray-400 text-white hover:bg-gray-500'
                            disabled={deleteBrandMutation.isPending}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="button"
                        onClick={() => {
                            handleDelete()
                        }}
                        hasEffect
                        variant="secondary"
                        disabled={deleteBrandMutation.isPending}
                    >
                        {deleteBrandMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog