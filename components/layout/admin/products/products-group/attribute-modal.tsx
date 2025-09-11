import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateVariant } from '@/features/variant/hook'
import { toast } from 'sonner'
import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'

interface AttributesModalProps {
    dialogOpen: boolean
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AttributesModal = ({ dialogOpen, setDialogOpen }: AttributesModalProps) => {
    const { watch } = useFormContext()
    const parent_id = watch('parent_id')
    const [attr, setAttr] = useState("")

    const createVariantMutation = useCreateVariant()

    const handleCreateVariant = (name: string) => {
        createVariantMutation.mutate({ parent_id, name }, {
            onSuccess(data, variables, context) {
                toast.success("Product attributes created")
                setDialogOpen(false)
                setAttr('')
            },
            onError(error, variables, context) {
                toast.error("Product attributes created fail")
            },
        })
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button
                type="button"
                variant={'ghost'}
                className='text-secondary hover:bg-secondary hover:text-white'
                onClick={() => {
                    if (!parent_id) {
                        toast.error("You need to choose a parent before choose or create an attributes")
                        return
                    } else {
                        setDialogOpen(true)
                    }
                }}
            >
                Add Attributes
            </Button>
            <DialogContent className="w-1/3">
                <DialogHeader>
                    <DialogTitle>Add Product Attributes</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        value={attr}
                        onChange={(e) => setAttr(e.target.value)}
                        placeholder="Product Attributes ex: Materials"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                if (attr.trim()) {
                                    handleCreateVariant(attr.trim())
                                } else {
                                    toast.error("Please enter group name")
                                }
                            }
                        }}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={createVariantMutation.isPending}
                            onClick={() => {
                                if (attr.trim()) {
                                    handleCreateVariant(attr.trim())
                                } else {
                                    toast.error("Please enter group name")
                                }
                            }}
                        >
                            {createVariantMutation.isPending ? <Loader2 className="animate-spin" /> : "Save"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AttributesModal