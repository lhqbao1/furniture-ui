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
import { useDeleteCategory } from '@/features/category/hook'

interface DeleteDialogProps {
    categoryId: string
}

const DeleteDialog = ({ categoryId }: DeleteDialogProps) => {
    const deleteCategoryMutation = useDeleteCategory()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        deleteCategoryMutation.mutate(categoryId ?? "", {
            onSuccess(data, variables, context) {
                toast.success("Delete category successfully")
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error("Failed to delete category")
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
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this Category? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className='bg-gray-400 text-white hover:bg-gray-500'
                            disabled={deleteCategoryMutation.isPending}
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
                        disabled={deleteCategoryMutation.isPending}
                    >
                        {deleteCategoryMutation.isPending ? (
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