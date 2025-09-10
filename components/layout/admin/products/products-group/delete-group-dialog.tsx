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
import { useDeleteProductGroup } from '@/features/product-group/hook'

interface DeleteGroupDialogProps {
    parentId: string
}

const DeleteGroupDialog = ({ parentId }: DeleteGroupDialogProps) => {
    const deleteGroupMutation = useDeleteProductGroup()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        deleteGroupMutation.mutate(parentId, {
            onSuccess(data, variables, context) {
                toast.success("Delete group successfully")
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error("Failed to delete group")
                setOpen(false)
            },
        })
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className='cursor-pointer' onClick={(e) => {
                    e.stopPropagation()
                }}>
                    <Trash2 className='size-4 text-red-500' />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Product Group</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this product group? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className='bg-gray-400 text-white hover:bg-gray-500'
                            disabled={deleteGroupMutation.isPending}
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
                        disabled={deleteGroupMutation.isPending}
                    >
                        {deleteGroupMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export default DeleteGroupDialog