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
import { Products } from '@/lib/schema/product'
import { Loader2, Trash2 } from 'lucide-react'
import { useDeleteProduct } from '@/features/products/hook'
import { ProductItem } from '@/types/products'
import { toast } from 'sonner'

interface DeleteDialogProps {
    product: ProductItem
}

const DeleteDialog = ({ product }: DeleteDialogProps) => {
    const deleteProduct = useDeleteProduct()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        deleteProduct.mutate(product.id ?? "", {
            onSuccess(data, variables, context) {
                toast.success("Delete product successfully")
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error("Failed to delete product")
                setOpen(false)
            },
        })
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className='size-4 text-red-500' />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className='bg-gray-400 text-white hover:bg-gray-500'
                            disabled={deleteProduct.isPending}
                        >
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleDelete} variant="secondary">
                        {deleteProduct.isPending ? (
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